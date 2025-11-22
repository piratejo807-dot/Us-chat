'use client';

import React from 'react';
import { Message as MessageType } from '@/types';
import Avatar from './Avatar';
import { useAuth } from '@/contexts/AuthContext';

interface MessageProps {
  message: MessageType;
  userName: string;
  userNumber: string;
  showAvatar?: boolean;
  isSameSenderAsPrevious?: boolean;
}

const Message: React.FC<MessageProps> = ({
  message,
  userName,
  userNumber,
  showAvatar = true,
  isSameSenderAsPrevious = false
}) => {
  const { user: currentUser } = useAuth();
  const isOwnMessage = currentUser?.id === message.userId;

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  return (
    <div
      className={`
        flex items-start space-x-3 mb-4
        ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}
        ${isSameSenderAsPrevious ? 'mt-1' : 'mt-4'}
      `}
    >
      {showAvatar && !isSameSenderAsPrevious && (
        <Avatar
          name={userName}
          size="small"
          className={isOwnMessage ? 'ml-3' : 'mr-3'}
        />
      )}

      {!showAvatar && !isSameSenderAsPrevious && (
        <div className={`w-10 h-10 ${isOwnMessage ? 'ml-3' : 'mr-3'}`} />
      )}

      <div
        className={`
          max-w-xs md:max-w-md lg:max-w-lg
          ${isOwnMessage ? 'text-right' : 'text-left'}
        `}
      >
        {!isSameSenderAsPrevious && (
          <div
            className={`
              text-sm font-medium text-gray-600 mb-1
              ${isOwnMessage ? 'text-right' : 'text-left'}
            `}
          >
            {userName} #{userNumber}
          </div>
        )}

        <div
          className={`
            inline-block rounded-2xl px-4 py-2
            ${isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 border border-gray-200'
            }
          `}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </div>

        {!isSameSenderAsPrevious && (
          <div
            className={`
              text-xs text-gray-400 mt-1
              ${isOwnMessage ? 'text-right' : 'text-left'}
            `}
          >
            {formatTimestamp(message.createdAt)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;