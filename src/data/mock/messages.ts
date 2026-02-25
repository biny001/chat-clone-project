import type { Message } from "@/types/chat";

export const messages: Record<string, Message[]> = {
  "1": [
    { id: "m1", conversationId: "1", text: "Hey, Dan", timestamp: "10:17 AM", sent: false },
    { id: "m2", conversationId: "1", text: "Can you help with with the last task on basecamp, please?", timestamp: "10:17 AM", sent: false, isFollowUp: true },
    { id: "m3", conversationId: "1", text: "I'm little bit confused with the task.. 😕", timestamp: "10:17 AM", sent: false, isFollowUp: true },
    { id: "m4", conversationId: "1", text: "it's done already, no worries!", timestamp: "10:22 AM", sent: true, read: true },
    { id: "m5", conversationId: "1", text: "what...", timestamp: "10:32 AM", sent: false },
    { id: "m6", conversationId: "1", text: "Really?! Thank you so much! 😍", timestamp: "10:32 AM", sent: false, isFollowUp: true },
    { id: "m7", conversationId: "1", text: "anytime! my pleasure~", timestamp: "11:01 AM", sent: true, read: true, reaction: "❣️" },
  ],
  "2": [
    { id: "m8", conversationId: "2", text: "Hey! Are we still on for tomorrow?", timestamp: "11:00 AM", sent: true, read: true },
    { id: "m9", conversationId: "2", text: "Let's do a quick call after lunch, I'll explain the brief later on", timestamp: "11:30 AM", sent: false },
  ],
  "3": [
    { id: "m10", conversationId: "3", text: "Thank you so much for your help!", timestamp: "2:30 PM", sent: false },
    { id: "m11", conversationId: "3", text: "anytime! my pleasure~", timestamp: "2:40 PM", sent: true, read: true },
  ],
};
