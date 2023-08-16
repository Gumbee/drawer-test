import { Emitter } from "./emitter";
import { distance, subtract, Vector } from "./vector";

type EventHandler = (e: Event) => void;
type Binding = {
  scope: "element" | "window";
  event: keyof HTMLElementEventMap;
  handler: EventHandler;
};
export type DragHandlerEvents =
  | { name: "dragstart"; payload: { start: Vector } }
  | {
      name: "dragmove";
      payload: {
        start: Vector;
        current: Vector;
        offset: Vector;
        rawOffset: Vector;
        delta: Vector;
      };
    }
  | {
      name: "dragend";
      payload: {
        start: Vector;
        current: Vector;
        offset: Vector;
        rawOffset: Vector;
      };
    }
  | { name: "staticClick"; payload: { event: MouseEvent } };
export type DragHandlerEvent<T extends DragHandlerEvents["name"]> = Extract<
  DragHandlerEvents,
  { name: T }
>;
export type DragTransformer = (offset: Vector, raw: Vector) => Vector;

/**
 * Low-level drag handler. Manages drag events and emits them to subscribers with information about movement amount.
 */
class DragHandler extends Emitter<DragHandlerEvents> {
  private _start: Vector = { x: 0, y: 0 };
  private _current: Vector = { x: 0, y: 0 };
  private _active = false;
  private _dragging = false;
  private _el: HTMLElement;
  private _bindings: Binding[] = [];
  private _preventClick = false;
  // allow transforming the drag position. Takes two arguments:
  // - offset (the current drag offset that has been transformed)
  // - raw (the raw, original drag offset without having any transforms applied)
  private _transformers: DragTransformer[] = [];

  constructor(el: HTMLElement) {
    super();

    this._el = el;

    this._bindings = [
      // element => bind handler to the drag element
      // window => bind handler to the window
      {
        scope: "element",
        event: "mousedown",
        handler: this.onMouseDown.bind(this) as EventHandler,
      },
      {
        scope: "element",
        event: "click",
        handler: this.onClick.bind(this) as EventHandler,
      },
      {
        scope: "window",
        event: "mouseup",
        handler: this.onMouseUp.bind(this) as EventHandler,
      },
      {
        scope: "window",
        event: "mousemove",
        handler: this.onMouseMove.bind(this) as EventHandler,
      },

      {
        scope: "element",
        event: "touchstart",
        handler: this.onTouchStart.bind(this) as EventHandler,
      },
      {
        scope: "window",
        event: "touchend",
        handler: this.onTouchEnd.bind(this) as EventHandler,
      },
      {
        scope: "window",
        event: "touchmove",
        handler: this.onTouchMove.bind(this) as EventHandler,
      },
    ];

    this._bindings.forEach(({ scope, event, handler }) => {
      // DragHandler should only be used in the browser (inside useEffects), so we can safely assume the browser exists
      const target = scope === "window" ? window : this._el;

      target.addEventListener(event, handler);
    });
  }

  public getElement(): HTMLElement {
    return this._el;
  }

  public destroy(): void {
    this._bindings.forEach(({ event, handler }) => {
      this._el.removeEventListener(event, handler);
    });

    this.unsubscribeAll();
  }

  public addTransformer(transformer: DragTransformer): void {
    this._transformers.push(transformer);
  }

  public removeTransformer(transformer: DragTransformer): void {
    this._transformers = this._transformers.filter((x) => x !== transformer);
  }

  // ------------------------------
  // Private helpers
  // ------------------------------

  private transform(offset: Vector): Vector {
    return this._transformers.reduce(
      (acc, transformer) => transformer(acc, offset),
      offset
    );
  }

  // ------------------------------
  // Drag Handlers
  // ------------------------------

  private startPotentialDrag(clientX: number, clientY: number): void {
    if (this._active) return;

    this._active = true;
    this._start = this._current = {
      x: clientX,
      y: clientY,
    };
  }

  private endPotentialDrag(): void {
    if (!this._active) return;

    const rawOffset = subtract(this._current, this._start);

    if (this._dragging) {
      setTimeout(() => {
        this._preventClick = false;
      }, 100);

      this.emit("dragend", {
        // initial position
        start: this._start,
        // current position
        current: this._current,
        // total offset
        offset: this.transform(rawOffset),
        // raw offset
        rawOffset,
      });
    }

    this._active = false;
    this._dragging = false;
  }

  private onDrag(clientX: number, clientY: number): void {
    if (!this._active) return;

    const delta = subtract(this._current, { x: clientX, y: clientY });
    const scrolling =
      this._el.scrollHeight > this._el.clientHeight && this._el.scrollTop !== 0;
    const rawOffset = subtract(this._current, this._start);

    if (scrolling) {
      // if we're scrolling and dragging, end the drag
      if (this._dragging) {
        this._dragging = false;

        setTimeout(() => {
          this._preventClick = false;
        }, 100);

        this.emit("dragend", {
          // initial position
          start: this._start,
          // current position
          current: this._current,
          // total offset
          offset: this.transform(rawOffset),
          // raw offset
          rawOffset,
        });
      }
      this._start = this._current = {
        x: clientX,
        y: clientY,
      };
    } else {
      // if we're not already dragging and we've moved a little bit, start dragging
      if (
        !this._dragging &&
        distance({ x: clientX, y: clientY }, this._start) > 0.9
      ) {
        this._dragging = true;

        this._preventClick = true; // set flag to prevent clicks

        this.emit("dragstart", {
          // initial position
          start: this._start,
        });
      }
    }

    this._current = {
      x: clientX,
      y: clientY,
    };

    if (this._dragging) {
      this.emit("dragmove", {
        // initial position
        start: this._start,
        // current position
        current: this._current,
        // amount moved since last dragmove event
        delta: delta,
        // total offset
        offset: this.transform(rawOffset),
        // raw offset
        rawOffset,
      });
    }
  }

  // ------------------------------
  // Event Handlers
  // ------------------------------

  private onMouseDown(e: MouseEvent): void {
    this.startPotentialDrag(e.clientX, e.clientY);
  }

  private onTouchStart(e: TouchEvent): void {
    this.startPotentialDrag(
      e.changedTouches[0].clientX,
      e.changedTouches[0].clientY
    );
  }

  private onMouseUp(): void {
    this.endPotentialDrag();
  }

  private onTouchEnd(): void {
    this.endPotentialDrag();
  }

  private onMouseMove(e: MouseEvent): void {
    this.onDrag(e.clientX, e.clientY);
  }

  private onTouchMove(e: TouchEvent): void {
    this.onDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  }

  private onClick(e: MouseEvent): void {
    if (this._preventClick) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      this.staticClick(e);
    }
  }

  private staticClick(e: MouseEvent): void {
    this.emit("staticClick", { event: e });
  }
}

export default DragHandler;
