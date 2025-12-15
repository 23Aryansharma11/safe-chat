"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { copyToClipboard } from "@/utils/copy-to-clipboard";
import { formatTime } from "@/utils/format-time";

const RoomPage = () => {
  const params = useParams();
  const roomId = params.roomId as string;

  const [timeRemaining, setTimeRemaining] = useState<number | null>(90);

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
          <div className="h-8 w-px bg-overlay-2" />

          <div className="flex flex-col">
            <span className="text-xs text-subtext-0 uppercase">
              Self Destruct
            </span>
            <span
              className={`text-sm font-bold flex items-center gap-2
              ${timeRemaining !== null && timeRemaining < 60 ? "text-red-500" : "text-amber-500"}
            `}
            >
              {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
            </span>
          </div>
        </div>

        <button className="text-sm bg-crust uppercase px-3 py-1.5 rounded text-foreground hover:cursor-pointer hover:bg-mantle font-bold transition-all group flex items-center gap-2 disabled:opacity-50">
          <span className="animate-pulse size-2 rounded-full bg-red-600" />
          Destroy Now
        </button>
      </header>
    </main>
  );
};

export default RoomPage;
