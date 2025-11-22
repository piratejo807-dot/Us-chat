'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePreview: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [isAutoRedirect, setIsAutoRedirect] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    let interval: NodeJS.Timeout;
    if (isAutoRedirect && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isAutoRedirect && countdown === 0) {
      router.push('/chat');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, isAutoRedirect, user, router]);

  const handleContinueClick = () => {
    setIsAutoRedirect(false);
    router.push('/chat');
  };

  const formatJoinDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">
            Welcome, {user.displayName || user.name}!
          </h1>

          <div className="flex flex-col items-center space-y-6">
            <Avatar
              name={user.displayName || user.name}
              size="large"
              imageUrl={user.avatar}
              className="ring-4 ring-blue-100"
            />

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {user.displayName || user.name}
              </h2>

              <p className="text-lg text-gray-600">
                Matricule: {user.number}
              </p>

              <div className="text-sm text-gray-500">
                <p>Member since {formatJoinDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleContinueClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue to Group Chat
            </button>

            {isAutoRedirect && (
              <div className="text-sm text-gray-500">
                Auto-redirecting in {countdown} seconds...
              </div>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-400">
            You're being added to the group chat with all members
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;