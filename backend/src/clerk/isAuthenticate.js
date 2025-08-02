import { getAuth, clerkClient } from '@clerk/express';

export const isAuthenticated = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await clerkClient.users.getUser(userId);
    req.user = user; // Add user to request for later use
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};
