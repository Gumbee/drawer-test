import "./styles.css";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import DragHandler from "./dragHandler";
import GestureDetector from "./gestureDetector";

export type DragHook<T> = {
  ref: Dispatch<SetStateAction<T | null>>;
  dragHandler: DragHandler | null;
  gestureHandler: GestureDetector | null;
};

export function useDragAndGesture<T extends HTMLElement>(): DragHook<T> {
  const [ref, setRef] = useState<T | null>(null);
  const [dragHandler, setDragHandler] = useState<DragHandler | null>(null);
  const [gestureHandler, setGestureHandler] = useState<GestureDetector | null>(
    null
  );

  useEffect(() => {
    if (ref) {
      const d = new DragHandler(ref);
      const g = new GestureDetector(d);

      setDragHandler(d);
      setGestureHandler(g);

      return (): void => {
        setDragHandler(null);
        setGestureHandler(null);

        d.destroy();
        g.destroy();
      };
    }
  }, [ref]);

  return {
    ref: setRef,
    dragHandler,
    gestureHandler,
  };
}
