"use client";

import { Sheet } from "@/components/Sheet";
import useSheet from "@/components/Sheet/hooks/useSheet";

export default function Home() {
  const { open, currentContent, closeSheet, setSheetContent } =
    useSheet("main");

  const setOpenA = () => {
    setSheetContent({
      id: "miasd",
      component: <div>Hello</div>,
    });
  };

  const setOpenB = () => {
    setSheetContent({
      id: "gewgw",
      component: (
        <div className="mt-[20px]">
          <input placeholder="X" />
          <div className="h-[200px] bg-red-400" />
          <input placeholder="A" />
          <div className="h-[200px] bg-blue-400" />
          <input placeholder="B" />
          <div className="h-[200px] bg-green-400" />
          <input placeholder="C" />
          <div className="h-[200px] bg-purple-400" />
          <input placeholder="D" />
        </div>
      ),
    });
  };

  return (
    <>
      <main
        vaul-drawer-wrapper=""
        className="flex min-h-screen flex-col items-center justify-between p-24 bg-white"
      >
        <button onClick={setOpenA}>Open Drawer A</button>
        <button onClick={setOpenB}>Open Drawer B</button>
      </main>

      <Sheet open={open} onClose={closeSheet}>
        {currentContent?.component}
      </Sheet>
    </>
  );
}
