import { Request, Response, NextFunction } from 'express';
import { User } from './user/user.model';

export const roleMiddleware = (allowedRoles: User['role'][]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Try to get user from req.user first
    let user = (req as any).user as User;
    
    // If not found in req.user, try to get from body (for testing)
    if (!user && req.body.userId) {
      // Import users from the controller
      const { users } = require('./teams.controller');
      user = users.find((u: User) => u.id === req.body.userId);
    }

    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient role' });
      return;
    }

    // Set the user in req.user for the controller to use
    (req as any).user = user;
    next();
  };
};

