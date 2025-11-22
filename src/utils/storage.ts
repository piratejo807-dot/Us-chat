import { User, Message } from '@/types';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CURRENT_USER: 'current_user',
  MESSAGES: 'messages'
} as const;

export const storage = {
  // Auth token operations
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Current user operations
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      // Convert string dates back to Date objects
      if (user.createdAt) user.createdAt = new Date(user.createdAt);
      if (user.lastSeen) user.lastSeen = new Date(user.lastSeen);
      return user;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  removeCurrentUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Messages operations
  getMessages: (): Message[] => {
    if (typeof window === 'undefined') return [];
    const messagesStr = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!messagesStr) return [];

    try {
      const messages = JSON.parse(messagesStr);
      // Convert string dates back to Date objects and filter to last 500
      return messages
        .map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt)
        }))
        .slice(-500);
    } catch {
      return [];
    }
  },

  setMessages: (messages: Message[]): void => {
    if (typeof window === 'undefined') return;
    // Keep only last 500 messages
    const limitedMessages = messages.slice(-500);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(limitedMessages));
  },

  addMessage: (message: Message): void => {
    const currentMessages = storage.getMessages();
    currentMessages.push(message);
    storage.setMessages(currentMessages);
  },

  clearAuth: (): void => {
    storage.removeToken();
    storage.removeCurrentUser();
  }
};