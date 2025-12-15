"use client";

import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { useUsername } from "@/hooks/use-username";
import { api } from "@/lib/api";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
import { formatTime } from "@/utils/format-time";

const RoomPage = () => {
  const params = useParams();
  const roomId = params.roomId as string;
  const [timeRemaining, setTimeRemaining] = useState<number | null>(10);
  const { username } = useUsername();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: sendMessage, isPending: isMessagePending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await api.messages.post(
        { sender: username, text },
        { query: { roomId } },
      );
    },
  });

  const onCopyClick = () => {
    const url = window.location.href;
    copyToClipboard(url);
    toast.success("Copied", { icon: null });
  };

  const isSubmitDisabled = inputValue.trim().length === 0 && !isMessagePending; // Fixed logic

  return (
    <main className="flex flex-col h-dvh max-h-dvh overflow-hidden bg-base text-foreground">
      <header className="border-b border-surface-1 p-4 flex items-center justify-between bg-surface-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-surface-2 uppercase font-mono">
              ROOM ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-subtext-0 font-mono">
                {roomId}
              </span>
              <button
                className="text-[12px] bg-surface-2 rounded py-0.5 px-2 text-subtext-0 hover:bg-surface-1 hover:text-subtext-0/50 transition-colors cursor-pointer flex items-center gap-1 font-mono"
                onClick={onCopyClick}
              >
                Copy
              </button>
            </div>
          </div>
          <div className="h-8 w-px bg-overlay-2" />
          <div className="flex flex-col">
            <span className="text-xs text-subtext-0 uppercase font-mono">
              Self Destruct
            </span>
            <span
              className={`text-sm font-bold flex items-center gap-2 font-mono
                ${timeRemaining !== null && timeRemaining < 60 ? "text-red-500" : "text-amber-500"}
              `}
            >
              {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
            </span>
          </div>
        </div>
        <button className="text-sm bg-crust uppercase px-3 py-1.5 rounded text-color-foreground hover:bg-color-mantle font-bold transition-all group flex items-center gap-2 disabled:opacity-50 font-mono disabled:cursor-not-allowed cursor-pointer">
          <span className="animate-pulse size-2 rounded-full bg-red-500" />
          Destroy Now
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-color-mantle"></div>

      <div className="p-4 border-t border-color-subtext-0 bg-color-surface-0 shrink-0">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 animate-pulse text-color-surface-2 font-mono">
              #
            </span>
            <input
              className="w-full bg-color-base border border-color-surface-2 focus:border-color-overlay-0 focus:outline-none transition-colors text-color-foreground py-3 pl-10 pr-4 text-sm font-mono placeholder:text-color-overlay-1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              ref={inputRef}
              autoFocus
              placeholder="Type a message..."
              onKeyDown={(e) => {
                // send on enter
                if (e.key === "Enter" && inputValue.trim()) {
                  // send message
                  sendMessage({ text: inputValue });
                  inputRef.current?.focus();
                }
              }}
            />
          </div>
          <button
            className="text-base bg-overlay-2 hover:bg-overlay-1 px-6 font-bold rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono"
            disabled={isSubmitDisabled}
            onClick={() => {
              sendMessage({ text: inputValue });
              inputRef.current?.focus();
            }}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
};

export default RoomPage;
