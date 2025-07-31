import { User } from "./user/user.model";

export interface Team {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    phone?: string;
    email?: string;
    members: User[];
  }

export { User };
  