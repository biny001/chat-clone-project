"use client";

export const TypingBubble = () => {
  return (
    <div className="flex items-start animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-card rounded-xl rounded-bl-[4px] px-4 py-3 flex items-center gap-1">
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 animate-[typing-bounce_1.4s_ease-in-out_infinite]" />
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 animate-[typing-bounce_1.4s_ease-in-out_0.2s_infinite]" />
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 animate-[typing-bounce_1.4s_ease-in-out_0.4s_infinite]" />
      </div>
    </div>
  );
};
