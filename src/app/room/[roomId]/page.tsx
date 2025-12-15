"use client";

import { useParams } from "next/navigation";

import { copyToClipboard } from "@/utils/copy-to-clipboard";
import toast from "react-hot-toast";

const RoomPage = () => {
  const params = useParams();
  const roomId = params.roomId as string;

  const onCopyClick = () => {
    const url = window.location.href;
    copyToClipboard(url);
    toast.success("Copied", {
      icon: null,
    });
  };

  return (
    <main className="flex flex-col h-dvh max-h-dvh overflow-hidden">
      <header className="border-b border-surface-1 p-4 flex items-center justify-between bg-surface-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-surface-2 uppercase">ROOM ID</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-subtext-0">{roomId}</span>
              <button
                className="text-[12px] bg-surface-2 rounded py-0.5 px-2 text-subtext-0 hover:bg-surface-1 hover:text-subtext-0/50 transition-colors cursor-pointer flex items-center gap-1"
                onClick={onCopyClick}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </header>
    </main>
  );
};

export default RoomPage;
