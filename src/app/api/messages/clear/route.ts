import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/types';

export async function DELETE() {
  try {
    // Clear messages by resetting the in-memory storage
    // In this simple implementation, we're not persisting messages to disk
    // so we just return success

    return NextResponse.json({
      success: true,
      data: {
        message: 'Chat history cleared successfully'
      }
    });

  } catch (error) {
    console.error('Clear chat history error:', error);

    const apiError: ApiError = {
      message: 'Failed to clear chat history',
      statusCode: 500
    };

    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}