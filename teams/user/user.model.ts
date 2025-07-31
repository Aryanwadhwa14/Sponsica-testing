export interface User {
    [x: string]: any;
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    phone?: string;
    teamId?: string;
}
