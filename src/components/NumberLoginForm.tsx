'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { validateMatriculeNumber } from '@/utils/validation';

const NumberLoginForm: React.FC = () => {
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Client-side validation
    const validationError = validateMatriculeNumber(number);
    if (validationError) {
      setError(validationError.message);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: number.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      // Success - store user data and redirect to profile
      const { user, token } = data.data;
      login(user, token);

      // Show welcome message
      const welcomeMessage = `Welcome ${user.name}!`;
      console.log(welcomeMessage); // You could use a toast/notification here

      router.push('/profile');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^[0-9]*$/.test(value)) {
      setNumber(value);
      setError(''); // Clear error when user starts typing
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Enter Your Matricule Number
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
              Matricule Number
            </label>
            <input
              id="number"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={number}
              onChange={handleInputChange}
              placeholder="e.g., 25BS1046"
              className={`
                w-full px-4 py-3 border rounded-lg text-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors duration-200
                ${error ? 'border-red-500' : 'border-gray-300'}
                ${isLoading ? 'bg-gray-100' : 'bg-white'}
              `}
              disabled={isLoading}
              autoComplete="off"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || number.trim() === ''}
            className={`
              w-full py-3 px-4 rounded-lg text-white font-semibold
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-all duration-200
              ${isLoading || number.trim() === ''
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Enter Chat'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Enter your assigned matricule number to join the group chat</p>
        </div>
      </div>
    </div>
  );
};

export default NumberLoginForm;