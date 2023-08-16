import { useEffect } from "react";

import { PADDING_TOP } from "../constants";
import { DragHook, useDragAndGesture } from "@/hooks/useDrag";
import { DragHandlerEvent, DragTransformer } from "@/hooks/useDrag/dragHandler";

type SheetDragHook = Pick<DragHook<HTMLElement>, "ref">;
type SheetInfo = {
  // starting offset for the next drag movement
  initialOffset: number;
  //height of the sheet
  height: number;
};

export function useSheetDrag(): SheetDragHook {
  const { ref, dragHandler } = useDragAndGesture();

  useEffect(() => {
    if (dragHandler) {
      const sheet = dragHandler.getElement();
      const sheetInfo: SheetInfo = {
        initialOffset: 0,
        height: 0,
      };

      const transform: DragTransformer = (offset, raw) => {
        const padding =
          sheetInfo.height < window.innerHeight - PADDING_TOP ? 0 : PADDING_TOP;
        const overflowHeight = Math.max(
          sheetInfo.height - window.innerHeight + padding,
          0
        );
        const canScroll = overflowHeight > 0;

        console.log("[DragHandler]", sheetInfo.height, window.innerHeight);

        const top = canScroll
          ? -sheetInfo.initialOffset - overflowHeight
          : -sheetInfo.initialOffset;

        const bottom =
          sheetInfo.height - overflowHeight - sheetInfo.initialOffset - 30;

        // lock sheet at top and bottom
        return {
          x: offset.x,
          y: Math.min(Math.max(offset.y, top), bottom),
        };
      };

      const handleDragStart = (): void => {
        sheetInfo.height = sheet.clientHeight;
      };

      const handleDrag = (
        payload: DragHandlerEvent<"dragmove">["payload"]
      ): void => {
        const padding =
          sheetInfo.height < window.innerHeight - PADDING_TOP ? 0 : PADDING_TOP;
        const overflowHeight = Math.max(
          sheetInfo.height - window.innerHeight + padding,
          0
        );

        sheet.style.transform = `translateY(${
          payload.offset.y + sheetInfo.initialOffset
        }px)`;
      };

      const handleDragEnd = (
        payload: DragHandlerEvent<"dragend">["payload"]
      ): void => {
        sheetInfo.initialOffset = payload.offset.y + sheetInfo.initialOffset;
      };

      dragHandler.on("dragstart", handleDragStart);
      dragHandler.on("dragmove", handleDrag);
      dragHandler.on("dragend", handleDragEnd);

      // lock sheet at top and bottom
      dragHandler.addTransformer(transform);

      return () => {
        dragHandler.off("dragstart", handleDragStart);
        dragHandler.off("dragmove", handleDrag);
        dragHandler.off("dragend", handleDragEnd);

        dragHandler.removeTransformer(transform);
      };
    }
  }, [dragHandler]);

  return { ref };
}
