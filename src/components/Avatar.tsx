'use client';

import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  imageUrl?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'medium',
  imageUrl,
  className = ''
}) => {
  // Generate initials from name
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    // Take first letter of first and last names
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Generate consistent color based on name
  const getAvatarColor = (fullName: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];

    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      const char = fullName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-16 h-16 text-xl'
  };

  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);
  const sizeClass = sizeClasses[size];

  if (imageUrl) {
    return (
      <div
        className={`rounded-full overflow-hidden flex-shrink-0 ${sizeClass} ${className}`}
      >
        <img
          src={imageUrl}
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.classList.add(...avatarColor.split(' '));
              parent.innerHTML = `<span class="text-white font-medium flex items-center justify-center w-full h-full">${initials}</span>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`
        ${avatarColor}
        ${sizeClass}
        rounded-full
        flex
        items-center
        justify-center
        text-white
        font-medium
        flex-shrink-0
        ${className}
      `}
    >
      <span className="select-none">{initials}</span>
    </div>
  );
};

export default Avatar;