export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  online?: boolean;
  typing?: boolean;
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
  { id: "1", name: "Anil", avatar: "A", lastMessage: "Typing...", timestamp: "Today, 9:52pm", online: true, typing: true },
  { id: "2", name: "Mary Cha", avatar: "M", lastMessage: "Take care, see you tomorrow...", timestamp: "Today, 12:11pm", online: true },
  { id: "3", name: "Tina", avatar: "T", lastMessage: "I'm on the way, I'm com...", timestamp: "Today, 2:40pm", unread: 4 },
  { id: "4", name: "Ranganathan", avatar: "R", lastMessage: "Let's catchup at 9 PM to...", timestamp: "Yesterday, 12:31pm" },
  { id: "5", name: "Josh", avatar: "J", lastMessage: "What is your plan today?...", timestamp: "Yesterday, 12:31pm" },
  { id: "6", name: "Harriet", avatar: "H", lastMessage: "Will you pick me up tom...", timestamp: "Wednesday, 9:40am" },
  { id: "7", name: "Ally", avatar: "AL", lastMessage: "Good Morning 🌞", timestamp: "Monday, 3:00pm" },
  { id: "8", name: "Catherine James", avatar: "C", lastMessage: "Let me share the detail...", timestamp: "Sunday, 6:00pm" },
];

export const messages: Record<string, Message[]> = {
  "1": [
    { id: "m1", conversationId: "1", text: "Hi Anil, how are you doing?", timestamp: "Today, 8:33pm", sent: true, read: true },
    { id: "m2", conversationId: "1", text: "I'm doing good, thanks for asking! How about you?", timestamp: "Today, 8:35pm", sent: false },
    { id: "m3", conversationId: "1", text: "I'm great! Just working on the new project. Want to catch up later?", timestamp: "Today, 9:51pm", sent: true, read: true },
  ],
  "2": [
    { id: "m4", conversationId: "2", text: "Hey Mary! Are we still on for tomorrow?", timestamp: "Today, 11:00am", sent: true, read: true },
    { id: "m5", conversationId: "2", text: "Yes! I'll be there at 10am.", timestamp: "Today, 11:30am", sent: false },
    { id: "m6", conversationId: "2", text: "Perfect, see you then!", timestamp: "Today, 12:00pm", sent: true, read: true },
    { id: "m7", conversationId: "2", text: "Take care, see you tomorrow! 😊", timestamp: "Today, 12:11pm", sent: false },
  ],
  "3": [
    { id: "m8", conversationId: "3", text: "Where are you?", timestamp: "Today, 2:30pm", sent: true },
    { id: "m9", conversationId: "3", text: "I'm on the way, I'm coming now!", timestamp: "Today, 2:40pm", sent: false },
  ],
};
