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
  reaction?: string;
  isFollowUp?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
}

export interface MediaGroup {
  month: string;
  items: string[];
}

export interface LinkItem {
  url: string;
  description: string;
  color: string;
}

export interface LinkGroup {
  month: string;
  links: LinkItem[];
}

export interface DocItem {
  name: string;
  pages?: string;
  size: string;
  type: string;
  tagColor: string;
}

export interface DocGroup {
  month: string;
  docs: DocItem[];
}
