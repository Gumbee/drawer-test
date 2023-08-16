import React, { FC, MouseEvent, PropsWithChildren, useCallback } from "react";

import { PADDING_TOP } from "../constants";
import { useSheetDrag } from "../hooks/useSheetDrag";
import { findAncestor } from "@/utils/dom";
import classNames from "classnames";

export type SheetProps = {
  open: boolean;
  onClose?: () => void;
};

const Sheet: FC<PropsWithChildren<SheetProps>> = ({
  children,
  open,
  onClose,
}) => {
  const { ref } = useSheetDrag();

  const handleClick = useCallback(
    (e: MouseEvent): void => {
      const sheet = findAncestor(e.target as HTMLElement, "[data-sheet]");

      if (!sheet) {
        // close the sheet if we click outside it
        onClose?.();
      }
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      onClick={handleClick}
      className="fixed top-0 left-0 right-0 min-h-[100vh] overflow-hidden grid grid-rows-[1fr_auto] bg-black/60"
    >
      <div style={{ minHeight: PADDING_TOP }} />
      <div
        data-sheet
        className={classNames(
          "relative min-h-[100px] rounded-t-lg px-4 pb-4 bg-white"
        )}
        ref={ref}
      >
        {children}
      </div>
    </div>
  );
};

export default Sheet;
