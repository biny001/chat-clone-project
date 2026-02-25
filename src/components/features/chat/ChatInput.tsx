import { useState } from "react";
import { Mic, Smile, Paperclip, Send } from "lucide-react";

export const ChatInput = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="pt-3">
      <div className="flex items-center rounded-full border border-border pl-4 pr-1 py-1 gap-1 h-10">
        <input
          type="text"
          placeholder="Type any message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-transparent text-xs leading-4 text-foreground placeholder:text-[#8796AF] outline-none"
        />
        <div className="flex items-center gap-2">
          <button className="w-6 h-6 flex items-center justify-center rounded-full">
            <Mic size={14} className="text-foreground" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded-full">
            <Smile size={14} className="text-foreground" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded-full">
            <Paperclip size={14} className="text-foreground" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary">
            <Send size={16} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};
