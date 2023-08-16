import React, { FC, MouseEvent, PropsWithChildren, useCallback } from "react";
import { Drawer } from "vaul";

export type SheetProps = {
  open: boolean;
  onClose?: () => void;
};

const VaulSheet: FC<PropsWithChildren<SheetProps>> = ({
  open,
  children,
  onClose,
}) => {
  const handleChange = useCallback(
    (o: boolean) => {
      if (!o) {
        onClose?.();
      }
    },
    [onClose]
  );

  return (
    <Drawer.Root shouldScaleBackground open={open} onOpenChange={handleChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-white flex flex-col fixed bottom-0 left-0 right-0 max-h-[82vh] rounded-t-[10px]">
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default VaulSheet;
