import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/types';

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

// Create avatar uploads directory if it doesn't exist
async function ensureUploadsDirectory() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    return uploadsDir;
  } catch (error) {
    console.error('Error ensuring uploads directory:', error);
    throw new Error('Failed to create uploads directory');
  }
}

// Generate unique filename for avatar
function generateAvatarFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  return `avatar_${timestamp}_${random}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      const error: ApiError = {
        message: 'No file provided',
        statusCode: 400
      };
      return NextResponse.json({ error }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error: ApiError = {
        message: 'File must be an image',
        statusCode: 400
      };
      return NextResponse.json({ error }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const error: ApiError = {
        message: 'Image must be less than 5MB',
        statusCode: 400
      };
      return NextResponse.json({ error }, { status: 400 });
    }

    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDirectory();

    // Generate unique filename
    const filename = generateAvatarFilename(file.name);
    const filepath = `${uploadsDir}/${filename}`;

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await (await import('fs/promises')).writeFile(filepath, buffer);

    // Generate URL for the uploaded file
    const avatarUrl = `/uploads/${filename}`;

    // Update user in database
    const usersList = await loadUsers();
    const userIndex = usersList.findIndex((u: any) => u.id === '1');

    if (userIndex === -1) {
      const error: ApiError = {
        message: 'User not found',
        statusCode: 404
      };
      return NextResponse.json({ error }, { status: 404 });
    }

    usersList[userIndex].avatar = avatarUrl;
    usersList[userIndex].lastSeen = new Date();

    users = usersList;
    await saveUsers();

    return NextResponse.json({
      success: true,
      data: {
        avatarUrl
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);

    const apiError: ApiError = {
      message: 'Failed to upload avatar',
      statusCode: 500
    };

    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Load users and find user
    const usersList = await loadUsers();
    const userIndex = usersList.findIndex((u: any) => u.id === '1');

    if (userIndex === -1) {
      const error: ApiError = {
        message: 'User not found',
        statusCode: 404
      };
      return NextResponse.json({ error }, { status: 404 });
    }

    // Get current avatar URL to delete file
    const currentAvatarUrl = usersList[userIndex].avatar;
    if (currentAvatarUrl) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const filepath = path.join(process.cwd(), 'public', currentAvatarUrl);
        await fs.unlink(filepath);
      } catch (fileError) {
        console.warn('Failed to delete avatar file:', fileError);
        // Continue even if file deletion fails
      }
    }

    // Remove avatar from user data
    delete usersList[userIndex].avatar;
    usersList[userIndex].lastSeen = new Date();

    users = usersList;
    await saveUsers();

    return NextResponse.json({
      success: true,
      data: {
        message: 'Avatar removed successfully'
      }
    });

  } catch (error) {
    console.error('Avatar deletion error:', error);

    const apiError: ApiError = {
      message: 'Failed to remove avatar',
      statusCode: 500
    };

    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}