// API response types (DB shapes returned by API routes)

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface ApiMessage {
  id: string;
  chatSessionId: string;
  senderId: string;
  content: string;
  createdAt: string; // ISO date string
}

export interface ApiConversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  updatedAt: string;
  otherUser: ApiUser;
  lastMessage: ApiMessage | null;
}

// Request payloads
export interface SendMessagePayload {
  chatSessionId: string;
  content: string;
}

export interface SendMessageResponse {
  message: ApiMessage;
}

export interface CreateConversationPayload {
  userId: string; // the other user's ID
}

export interface CreateConversationResponse {
  chatSession: ApiConversation;
}

// Ably event payloads
export interface AblyNewMessageEvent {
  id: string;
  chatSessionId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface AblyConversationUpdateEvent {
  chatSessionId: string;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
}
