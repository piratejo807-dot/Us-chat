import { NextRequest, NextResponse } from 'next/server';
import { User, LoginRequest, LoginResponse, ApiError } from '@/types';
import { validateMatriculeNumber } from '@/utils/validation';

// Load users from public/users.json
let users: User[] = [];

async function loadUsers(): Promise<User[]> {
  if (users.length > 0) return users;

  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const usersPath = path.join(process.cwd(), 'public', 'users.json');
    const usersData = await fs.readFile(usersPath, 'utf8');
    const parsedUsers = JSON.parse(usersData);

    // Convert date strings to Date objects
    users = parsedUsers.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastSeen: new Date(user.lastSeen)
    }));

    return users;
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

// Generate simple session token (UUID)
function generateToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // Validate input
    const validationError = validateMatriculeNumber(body.number);
    if (validationError) {
      const error: ApiError = {
        message: validationError.message,
        statusCode: 400
      };
      return NextResponse.json({ error }, { status: 400 });
    }

    // Load users and find matching user
    const usersList = await loadUsers();
    const normalizedInput = body.number.trim().toUpperCase();
    const user = usersList.find(u => u.number.trim().toUpperCase() === normalizedInput);

    if (!user) {
      const error: ApiError = {
        message: 'Number not recognized. Please check and try again.',
        statusCode: 404
      };
      return NextResponse.json({ error }, { status: 404 });
    }

    // Update last seen
    user.lastSeen = new Date();

    // Generate session token
    const token = generateToken();

    const response: LoginResponse = {
      user: {
        ...user,
        lastSeen: new Date()
      },
      token
    };

    return NextResponse.json({ success: true, data: response });

  } catch (error) {
    console.error('Login error:', error);

    const apiError: ApiError = {
      message: 'Connection error. Please try again',
      statusCode: 500
    };

    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}