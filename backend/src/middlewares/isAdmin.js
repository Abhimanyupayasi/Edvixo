// src/middleware/authMiddleware.js
import { clerkClient, getAuth } from '@clerk/express';

export const isAdmin = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);
    
    // Check if user has admin role in public metadata
    if (user.publicMetadata?.role === 'admin') {
      return next();
    }
    
    res.status(403).json({ error: 'Admin access required' });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};