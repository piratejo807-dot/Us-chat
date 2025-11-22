'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Message from './Message';
import { useAuth } from '@/contexts/AuthContext';
import { Message as MessageType, User } from '@/types';
import { validateMessage } from '@/utils/validation';
import { storage } from '@/utils/storage';

interface MessageWithUser extends MessageType {
  userName: string;
  userNumber: string;
}

const GroupChat: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/users.json');
        if (response.ok) {
          const usersData = await response.json();
          const formattedUsers = usersData.map((u: any) => ({
            ...u,
            createdAt: new Date(u.createdAt),
            lastSeen: new Date(u.lastSeen)
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, []);

  // Get user details by ID
  const getUserDetails = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return {
      userName: foundUser?.name || 'Unknown User',
      userNumber: foundUser?.number || '????????'
    };
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        const messagesWithUsers: MessageWithUser[] = data.data.messages.map((msg: MessageType) => {
          const { userName, userNumber } = getUserDetails(msg.userId);
          return {
            ...msg,
            createdAt: new Date(msg.createdAt),
            userName,
            userNumber
          };
        });
        setMessages(messagesWithUsers);
        storage.setMessages(messagesWithUsers);
        setError('');
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Use cached messages if available
      const cachedMessages = storage.getMessages();
      if (cachedMessages.length > 0) {
        const messagesWithUsers: MessageWithUser[] = cachedMessages.map((msg: MessageType) => {
          const { userName, userNumber } = getUserDetails(msg.userId);
          return {
            ...msg,
            userName,
            userNumber
          };
        });
        setMessages(messagesWithUsers);
      }
      setError('Unable to fetch messages. Showing cached messages.');
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and polling
  useEffect(() => {
    if (users.length === 0) return;

    fetchMessages();

    // Set up polling for new messages every 2 seconds
    pollingIntervalRef.current = setInterval(fetchMessages, 2000);

    // Set up page visibility handling
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      } else {
        fetchMessages();
        pollingIntervalRef.current = setInterval(fetchMessages, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [users]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if message is from same sender as previous
  const isSameSenderAsPrevious = (index: number) => {
    if (index === 0) return false;
    return messages[index].userId === messages[index - 1].userId;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    const validationError = validateMessage(newMessage);
    if (validationError) {
      setError(validationError.message);
      return;
    }

    if (!user) {
      setError('You must be logged in to send messages');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          userId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send message');
      }

      // Clear input and refresh messages
      setNewMessage('');
      fetchMessages();
      setIsOffline(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);

      // Store message locally for retry
      const tempMessage: MessageWithUser = {
        id: `temp-${Date.now()}`,
        userId: user.id,
        content: newMessage.trim(),
        createdAt: new Date(),
        userName: user.name,
        userNumber: user.number
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Group Chat</h1>
            <p className="text-sm text-gray-600">All Members</p>
          </div>
          <div className="flex items-center space-x-4">
            {isOffline && (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                Offline
              </span>
            )}
            <button
              onClick={handleSettings}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <Message
                key={message.id}
                message={message}
                userName={message.userName}
                userNumber={message.userNumber}
                showAvatar={true}
                isSameSenderAsPrevious={isSameSenderAsPrevious(index)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 px-4 py-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 sm:px-6">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className={`
                px-6 py-2 rounded-lg font-medium transition-colors duration-200
                ${isSending || !newMessage.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }
              `}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;