export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  online?: boolean;
  typing?: boolean;
  read?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  text: string;
  timestamp: string;
  sent: boolean;
  read?: boolean;
}

export const conversations: Conversation[] = [
  { id: "1", name: "Fego Chidera", avatar: "FC", lastMessage: "Thanks for the explanation!", timestamp: "3 mins ago", online: true, read: true },
  { id: "2", name: "Yomi Immanuel", avatar: "YI", lastMessage: "Let's do a quick call after lunch, I'll explai...", timestamp: "12 mins ago", online: true, read: true },
  { id: "3", name: "Bianca Nubia", avatar: "BN", lastMessage: "anytime! my pleasure~", timestamp: "32 mins ago", read: true },
  { id: "4", name: "Zender Lowre", avatar: "ZL", lastMessage: "Okay cool, that make sense 👍", timestamp: "1 hour ago", read: true },
  { id: "5", name: "Palmer Dian", avatar: "PD", lastMessage: "Thanks, Jonas! That helps 😄", timestamp: "5 hour ago" },
  { id: "6", name: "Yuki Tanaka", avatar: "YT", lastMessage: "Have you watch the new season of Danm...", timestamp: "12 hour ago", read: true },
];

export const messages: Record<string, Message[]> = {
  "1": [
    { id: "m1", conversationId: "1", text: "Hi, how are you doing?", timestamp: "Today, 8:33pm", sent: true, read: true },
    { id: "m2", conversationId: "1", text: "I'm doing good, thanks for asking!", timestamp: "Today, 8:35pm", sent: false },
    { id: "m3", conversationId: "1", text: "Thanks for the explanation!", timestamp: "Today, 9:51pm", sent: false },
  ],
  "2": [
    { id: "m4", conversationId: "2", text: "Hey! Are we still on for tomorrow?", timestamp: "Today, 11:00am", sent: true, read: true },
    { id: "m5", conversationId: "2", text: "Let's do a quick call after lunch, I'll explain the brief later on", timestamp: "Today, 11:30am", sent: false },
  ],
  "3": [
    { id: "m8", conversationId: "3", text: "Thank you so much for your help!", timestamp: "Today, 2:30pm", sent: true },
    { id: "m9", conversationId: "3", text: "anytime! my pleasure~", timestamp: "Today, 2:40pm", sent: false },
  ],
};
