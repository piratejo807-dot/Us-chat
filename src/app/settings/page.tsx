'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/Avatar';
import { storage } from '@/utils/storage';

const SettingsPage: React.FC = () => {
  const { user, login } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    setDisplayName(user.displayName || user.name);
    setAvatarUrl(user.avatar || '');
  }, [user, router]);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      showMessage('Name cannot be empty', 'error');
      return;
    }

    if (trimmedName === (user.displayName || user.name)) {
      showMessage('No changes made', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: trimmedName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update name');
      }

      // Update user object in context
      const updatedUser = {
        ...user,
        displayName: trimmedName
      };

      login(updatedUser, storage.getToken() || '');
      showMessage('Name updated successfully!', 'success');

    } catch (error) {
      console.error('Error updating name:', error);
      showMessage('Failed to update name', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Image must be less than 5MB', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();

      // Update user object in context
      const updatedUser = {
        ...user,
        avatar: data.avatarUrl
      };

      login(updatedUser, storage.getToken() || '');
      setAvatarUrl(data.avatarUrl);
      showMessage('Avatar updated successfully!', 'success');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      showMessage('Failed to upload avatar', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !user.avatar) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove avatar');
      }

      // Update user object in context
      const updatedUser = {
        ...user,
        avatar: undefined
      };

      login(updatedUser, storage.getToken() || '');
      setAvatarUrl('');
      showMessage('Avatar removed successfully!', 'success');

    } catch (error) {
      console.error('Error removing avatar:', error);
      showMessage('Failed to remove avatar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChatHistory = async () => {
    if (!user) return;

    if (!confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/messages/clear', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear chat history');
      }

      // Clear local storage
      storage.setMessages([]);
      showMessage('Chat history cleared successfully!', 'success');

    } catch (error) {
      console.error('Error clearing chat history:', error);
      showMessage('Failed to clear chat history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToChat = () => {
    router.push('/chat');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToChat}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Chat
          </button>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your profile and chat settings</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <p className="font-medium">{message}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>

            {/* Avatar */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
              <div className="flex items-center space-x-4">
                <Avatar
                  name={user.displayName || user.name}
                  size="large"
                  imageUrl={avatarUrl || user.avatar}
                />
                <div className="space-y-2">
                  <label className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="sr-only"
                      disabled={isUploading}
                    />
                  </label>
                  {(avatarUrl || user.avatar) && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={isLoading}
                      className="block text-sm text-red-600 hover:text-red-700 disabled:text-gray-400"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Display Name Form */}
            <form onSubmit={handleNameChange} className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your display name"
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  This is how other users will see you in the chat
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !displayName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Name'}
              </button>
            </form>
          </div>

          {/* Chat Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Chat Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Clear Chat History</h3>
                  <p className="text-sm text-gray-500">Delete all messages from the chat</p>
                </div>
                <button
                  onClick={handleClearChatHistory}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Official Name:</span>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Matricule Number:</span>
                <p className="text-gray-900">{user.number}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Member Since:</span>
                <p className="text-gray-900">
                  {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }).format(new Date(user.createdAt))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;