import { NextRequest, NextResponse } from 'next/server';
import { Message, CreateMessageRequest, ApiError } from '@/types';
import { validateMessage } from '@/utils/validation';

// For this implementation, we'll use a simple in-memory storage
// In production, you'd want to use a proper database
let messages: Message[] = [];

// Generate message ID (UUID)
function generateMessageId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Load users for name lookup
async function loadUsers() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const usersPath = path.join(process.cwd(), 'public', 'users.json');
    const usersData = await fs.readFile(usersPath, 'utf8');
    return JSON.parse(usersData);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

export async function GET() {
  try {
    // Return messages with user details, sorted by createdAt ascending (oldest first)
    const sortedMessages = messages
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-500); // Return last 500 messages

    return NextResponse.json({
      success: true,
      data: {
        messages: sortedMessages
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);

    const apiError: ApiError = {
      message: 'Failed to fetch messages',
      statusCode: 500
    };

    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMessageRequest = await request.json();

    // Validate input
    const validationError = validateMessage(body.content);
    if (validationError) {
      const error: ApiError = {
        message: validationError.message,
        statusCode: 400
      };
      return NextResponse.json({ error }, { status: 400 });
    }

    // Validate userId
    if (!body.userId || body.userId.trim() === '') {
      const error: ApiError = {
        message: 'User ID is required',
        statusCode: 400
      };
      return NextResponse.json({ error }, { status: 400 });
    }

    // Load users to verify user exists
    const users = await loadUsers();
    const user = users.find((u: any) => u.id === body.userId);

    if (!user) {
      const error: ApiError = {
        message: 'Invalid user',
        statusCode: 400
      };
      return NextResponse.json({ error }, { status: 400 });
    }

    // Create new message
    const newMessage: Message = {
      id: generateMessageId(),
      userId: body.userId,
      content: body.content.trim(),
      createdAt: new Date()
    };

    // Add to messages array
    messages.push(newMessage);

    // Keep only last 500 messages in memory
    if (messages.length > 500) {
      messages = messages.slice(-500);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: newMessage
      }
    });

  } catch (error) {
    console.error('Error creating message:', error);

    const apiError: ApiError = {
      message: 'Failed to create message',
      statusCode: 500
    };

    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}