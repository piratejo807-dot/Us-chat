import { User } from '@/types';

// Load users from public/users.json
let users: any[] = [];

export async function loadUsers() {
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

export async function saveUsers() {
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

export async function authenticateUser(request: any): Promise<User | null> {
  try {
    // For this simple implementation, we'll just return the first user
    // In a real app, you'd extract the token from the request and validate it
    const usersList = await loadUsers();

    // For demo purposes, return the first user
    // In production, you'd validate the token and find the corresponding user
    const userData = usersList[0];

    if (!userData) return null;

    return {
      ...userData,
      createdAt: new Date(userData.createdAt),
      lastSeen: new Date(userData.lastSeen)
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function generateToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}