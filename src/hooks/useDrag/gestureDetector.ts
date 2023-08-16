import DragHandler, { DragHandlerEvent, DragHandlerEvents } from './dragHandler'
import { Emitter } from './emitter'
import { add, distance, multiply, Vector } from './vector'

type Binding<T = DragHandlerEvents> = T extends DragHandlerEvents
  ? { event: T['name']; handler: (payload: T['payload']) => void }
  : never
type GestureEvents = { name: 'swipe'; payload: { direction: Vector } }

/**
 * Detects drag gestures and emits them to subscribers as events with information about the gesture.
 */
class GestureDetector extends Emitter<GestureEvents> {
  private _dragHandler: DragHandler
  private _bindings: Binding[] = []
  private _velocityAvg = 0
  private _dirAvg: Vector = { x: 0, y: 0 }

  constructor(dragHandler: DragHandler) {
    super()

    this._bindings = [
      { event: 'dragmove', handler: this.onDragMove.bind(this) },
      { event: 'dragend', handler: this.onDragEnd.bind(this) }
    ]

    this._dragHandler = dragHandler

    this._bindings.forEach(({ event, handler }) => {
      // cast to never to avoid type errors (type safety is guaranteed via Binding type)
      this._dragHandler.on(event, handler as never)
    })
  }

  public destroy(): void {
    this._bindings.forEach(({ event, handler }) => {
      // cast to never to avoid type errors (type safety is guaranteed via Binding type)
      this._dragHandler.off(event, handler as never)
    })

    this.unsubscribeAll()
  }

  // ------------------------------
  // Gesture Detectors
  // ------------------------------

  private onDragMove(payload: DragHandlerEvent<'dragmove'>['payload']): void {
    this._velocityAvg = this._velocityAvg * 0.7 + distance(payload.delta, { x: 0, y: 0 }) * 0.3
    this._dirAvg = add(multiply(this._dirAvg, 0.7), multiply(payload.delta, 0.3))
  }

  private onDragEnd(): void {
    if (this._velocityAvg > 15) {
      this.emit('swipe', { direction: this._dirAvg })
    }
  }
}

export default GestureDetector
