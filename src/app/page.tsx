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
          <div className="h-[200px] bg-red-400" />
          <div className="h-[200px] bg-blue-400" />
          <div className="h-[200px] bg-green-400" />
          <div className="h-[200px] bg-purple-400" />
        </div>
      ),
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button onClick={setOpenA}>Open Drawer A</button>
      <button onClick={setOpenB}>Open Drawer B</button>
      {open && <Sheet onClose={closeSheet}>{currentContent?.component}</Sheet>}
    </main>
  );
}
