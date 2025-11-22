import { NextRequest, NextResponse } from 'next/server';
import { UpdateProfileRequest, ApiError } from '@/types';

// Load users from public/users.json
let users: any[] = [];

async function loadUsers() {
  if (users.length > 0) return users;

  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const usersPath = path.join(process.cwd(), 'public', 'users.json');
    const usersData = await fs.readFile(usersPath, 'utf8');
    users = JSON.parse(usersData);

    return users;
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

async function saveUsers() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const usersPath = path.join(process.cwd(), 'public', 'users.json');
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
    throw new Error('Failed to save user data');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: UpdateProfileRequest = await request.json();

    // Validate input
    if (!body.displayName && !body.avatar) {
      const error: ApiError = {
        message: 'At least one field must be provided',
        statusCode: 400
      };
      return NextResponse.json({ error }, { status: 400 });
    }

    if (body.displayName) {
      if (body.displayName.trim() === '') {
        const error: ApiError = {
          message: 'Display name cannot be empty',
          statusCode: 400
        };
        return NextResponse.json({ error }, { status: 400 });
      }

      if (body.displayName.length > 50) {
        const error: ApiError = {
          message: 'Display name must be 50 characters or less',
          statusCode: 400
        };
        return NextResponse.json({ error }, { status: 400 });
      }
    }

    // Load users and find matching user
    const usersList = await loadUsers();

    // For this simple implementation, we'll update the first user
    // In a real app, you'd authenticate and find the specific user
    const userIndex = usersList.findIndex((u: any) => u.id === '1');

    if (userIndex === -1) {
      const error: ApiError = {
        message: 'User not found',
        statusCode: 404
      };
      return NextResponse.json({ error }, { status: 404 });
    }

    // Update user data
    if (body.displayName) {
      usersList[userIndex].displayName = body.displayName.trim();
    }
    if (body.avatar) {
      usersList[userIndex].avatar = body.avatar;
    }
    usersList[userIndex].lastSeen = new Date();

    // Save updated users
    users = usersList;
    await saveUsers();

    const updatedUser = {
      ...usersList[userIndex],
      createdAt: new Date(usersList[userIndex].createdAt),
      lastSeen: new Date(usersList[userIndex].lastSeen)
    };

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);

    const apiError: ApiError = {
      message: 'Failed to update profile',
      statusCode: 500
    };

    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}