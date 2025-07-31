  import { Request, Response, NextFunction } from 'express';
  import { User } from './teams.model';
  import { Team } from './teams.model';
  import { v4 as uuidv4 } from 'uuid';
  import { promises } from 'dns';

  // Dummy in-memory storage
  const teams: Team[] = [];
  const users: User[] = [];
  const announcements: { teamId: string; message: string; createdById: string }[] = [];
  const sponsorDeals: { id: string; teamId: string; status: string }[] = [];
  let inviteTokens: { token: string; teamId: string }[] = [];

  // Helper Functions
  const hasPermission = (role: string, allowed: string[]) => allowed.includes(role);
  const findUser = (id: string) => users.find(u => u.id === id);
  const findTeam = (id: string) => teams.find(t => t.id === id);

  // =================== CREATE TEAM ===================
  export const createTeam = (req: Request, res: Response, next: NextFunction) : void => {
    const { name, description } = req.body;
    const userId = req.body.userId; // Simulate auth

    const user = findUser(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const team: Team = {
      id: uuidv4(),
      name,
      description,
      ownerId: user.id,
      members: [user],
    };

    teams.push(team);
    user.teamId = team.id;
    user.role = 'owner';

    res.status(201).json({ message: 'Team created', team });
  };

  // =================== GET TEAM INFO ===================
  export const getTeamInfo = (req: Request, res: Response, next : NextFunction) : void => {
    const userId = req.body.userId;
    const user = findUser(userId);
    if (!user || !user.teamId) {res.status(404).json({ message: 'User/team not found' }); return;}

    const team = findTeam(user.teamId);
    if (!team) {res.status(404).json({ message: 'Team not found' }); return;}

    res.status(200).json({ team });
  };

  // =================== EDIT TEAM SETTINGS ===================
  export const editTeamSettings = (req: Request, res: Response, next: NextFunction) : void => {
    const { userId, phone, email, description } = req.body;
    const user = findUser(userId);
    if (!user || !user.teamId){res.status(404).json({ message: 'User or team not found' }); return;}

    if (!hasPermission(user.role, ['owner', 'admin'])) {res.status(403).json({ message: 'Forbidden' }); return;}

    const team = findTeam(user.teamId);
    if (!team) {res.status(404).json({ message: 'Team not found' }); return;}

    team.phone = phone;
    team.email = email;
    if (description) team.description = description;

    res.status(200).json({ message: 'Team updated', team });
  };

  // =================== ADD MEMBER ===================
  export const addMember = (req: Request, res: Response, next: NextFunction) : void => {
    const { newMemberId } = req.body;
    const user = (req as any).user; // Get user from middleware
    const newMember = findUser(newMemberId);

    if (!user || !user.teamId || !newMember) {
      res.status(404).json({ message: 'User or member not found' }); 
      return;
    }
    if (!hasPermission(user.role, ['owner', 'admin'])) {res.status(403).json({ message: 'Forbidden' }); return;}

    const team = findTeam(user.teamId);
    if (!team) {res.status(404).json({ message: 'Team not found' }); return;}

    team.members.push(newMember);
    newMember.teamId = team.id;
    newMember.role = 'member';

    res.status(200).json({ message: 'Member added', team });
  };

  // =================== REMOVE MEMBER ===================
  export const removeMember = (req: Request, res: Response, next: NextFunction) : void=> {
    const { removeId } = req.body;
    const user = (req as any).user; // Get user from middleware
    const member = findUser(removeId);

    if (!user || !member || !user.teamId || user.teamId !== member.teamId) {
      res.status(404).json({ message: 'Not in the same team' }); 
      return;
    }

    if (!hasPermission(user.role, ['owner', 'admin'])) {res.status(403).json({ message: 'Forbidden' }); return;}
    if (member.role === 'owner')  {res.status(403).json({ message: 'Cannot remove owner' }); return;}

    const team = findTeam(user.teamId);
    if (!team) {res.status(404).json({ message: 'Team not found' }); return;}

    team.members = team.members.filter(m => m.id !== removeId);
    member.teamId = undefined;
    member.role = 'member';

    res.status(200).json({ message: 'Member removed' });
  };

  // =================== PROMOTE / DEMOTE ===================
  export const changeRole = (req: Request, res: Response, next: NextFunction): void => {
    const { userId, memberId, role } = req.body;
    const user = findUser(userId);
    const member = findUser(memberId);

    if (!user || !member || user.teamId !== member.teamId) {res.status(404).json({ message: 'Invalid team' }) 
    return;}
    if (user.role !== 'owner') { res.status(403).json({ message: 'Only owner can change roles' }) 
    return;}

    if (role === 'owner') res.status(400).json({ message: 'Cannot assign owner role directly' });
    member.role = role;

    res.status(200).json({ message: 'Role changed', member });
  };

  // =================== MAKE ANNOUNCEMENT ===================
  export const makeAnnouncement = (req: Request, res: Response, next : NextFunction) : void => {
    const { userId, message } = req.body;
    const user = findUser(userId);
    if (!user || !user.teamId){res.status(404).json({ message: 'User/team not found' }) 
    return;}
    if (!hasPermission(user.role, ['owner', 'admin'])){res.status(403).json({ message: 'Forbidden' })
    return;}

    announcements.push({ teamId: user.teamId, message, createdById: user.id });
    res.status(201).json({ message: 'Announcement posted' });
  };

  // =================== ACCEPT DEAL ===================
  export const acceptDeal = (req: Request, res: Response, next: NextFunction) : void => {
    const { userId, dealId } = req.body;
    const user = findUser(userId);

    if (!user || !user.teamId) {res.status(404).json({ message: 'Team not found' }) 
    return;}
    if (!hasPermission(user.role, ['owner', 'admin'])) {res.status(403).json({ message: 'Forbidden' }) 
    return;}

    const deal = sponsorDeals.find(d => d.id === dealId && d.teamId === user.teamId);
    if (!deal)  {res.status(404).json({ message: 'Deal not found' });
    return;}

    deal.status = 'ACCEPTED';
    res.status(200).json({ message: 'Deal accepted', deal });
  };

  // =================== ANALYTICS ===================
  export const getAnalytics = (req: Request, res: Response , next: NextFunction) : void  => {
    const userId = req.body.userId;
    const user = findUser(userId);
    if (!user || !user.teamId)  {res.status(404).json({ message: 'User/team not found' })
      return;}

    const teamId = user.teamId;
    const membersCount = users.filter(u => u.teamId === teamId).length;
    const announcementCount = announcements.filter(a => a.teamId === teamId).length;
    const dealCount = sponsorDeals.filter(d => d.teamId === teamId).length;

    res.status(200).json({ membersCount, announcementCount, dealCount });
  };

  // =================== INVITE LINK ===================
  export const generateInviteLink = (req: Request, res: Response, next:NextFunction) : void => {
    const { userId } = req.body;
    const user = findUser(userId);
    if (!user || !user.teamId || user.role !== 'owner') {res.status(403).json({ message: 'Only owner allowed' })
      return;}

    const token = uuidv4();
    inviteTokens.push({ token, teamId: user.teamId });

    res.status(200).json({ inviteLink: `https://app.com/invite/${token}` });
  };


  //========================  RESET INVITE LINK ====================
  export const resetInviteLink = (req: Request, res: Response, next: NextFunction) : void => {
    const { userId } = req.body;
    const user = findUser(userId);
    if (!user || !user.teamId || user.role !== 'owner') {res.status(403).json({ message: 'Only owner allowed' })
      return;}

    // Remove old invite tokens for the team
    inviteTokens = inviteTokens.filter(t => t.teamId !== user.teamId);

    // Generate new token
    const newToken = uuidv4();
    inviteTokens.push({ token: newToken, teamId: user.teamId });

    res.status(200).json({ inviteLink: `https://app.com/invite/${newToken}` });
  };


  //======================= TURNING OFF THE LINK ====================
  export const disableInviteLink = (req: Request, res: Response, next: NextFunction) : void => {
    const { userId } = req.body;
    const user = findUser(userId);
    if (!user || !user.teamId || user.role !== 'owner') {res.status(403).json({ message: 'Only owner allowed' })
      return;}

    // Remove all invite tokens for the team
    inviteTokens = inviteTokens.filter(t => t.teamId !== user.teamId);

    res.status(200).json({ message: 'Invite link disabled' });
  };


  // ==================== OTHER TEAM FUNCTIONALITIES ====================


  // Assume current user is extracted in `req.user`
  // TypeScript fix: extend Request type to include 'user'
  interface RequestWithUser extends Request {
    user?: User;
  }
  const getUserFromRequest = (req: RequestWithUser): User => {
    if (!req.user) {
      throw new Error('User not found in request');
    }
    return req.user;
  };

  // ==================== LEAVE TEAM ====================
  export const leaveTeam = (req: Request, res: Response , next: NextFunction) : void => {
    const user = getUserFromRequest(req as RequestWithUser);
    const team = teams.find(t => t.id === user.teamId);

    if (!team) {res.status(404).json({ message: 'Team not found' })
      return;}

    if (user.role === 'owner')
      {res.status(400).json({ message: 'Owner cannot leave. Transfer ownership first.' })
      return;}

    team.members = team.members.filter(m => m.id !== user.id);
    user.teamId = undefined;
    user.role = 'member';

    res.status(200).json({ message: 'Left team successfully' });
  };

  // ==================== TRANSFER OWNERSHIP ====================
  export const transferOwnership = (req: Request, res: Response, next: NextFunction) : void => {
    const user = getUserFromRequest(req);
    const { newOwnerId } = req.body;

    if (user.role !== 'owner') {res.status(403).json({ message: 'Only owner can transfer ownership' })
      return;}

    const team = teams.find(t => t.id === user.teamId);
    if (!team) { res.status(404).json({ message: 'Team not found' })
      return;}

    const newOwner = users.find(u => u.id === newOwnerId && u.teamId === team.id);
    if (!newOwner || newOwner.role !== 'admin')
      { res.status(400).json({ message: 'New owner must be an admin in the same team' });
      return;}

    user.role = 'admin';
    newOwner.role = 'owner';
    team.ownerId = newOwner.id;

    res.status(200).json({ message: 'Ownership transferred', newOwner });
  };


  // ==================== GET ALL MEMBERS WITH ROLES ====================
  export const getMembersByRole = (req: Request, res: Response , next: NextFunction) : void => {
    const user = getUserFromRequest(req);
    const team = teams.find(t => t.id === user.teamId);
    if (!team)  {res.status(404).json({ message: 'Team not found' })
    return;}

    const members = team.members.reduce((acc, member) => {
      acc[member.role] = acc[member.role] || [];
      acc[member.role].push(member);
      return acc;
    }, {} as Record<string, User[]>);

    res.status(200).json(members);
  };

  // ==================== UPDATE MEMBER INFO (ADMIN/OWNER) ====================
  export const updateMemberInfo = (req: Request, res: Response, next: NextFunction) : void => {
    const user = getUserFromRequest(req);
    const { memberId, name, phone } = req.body;

    if (!['owner', 'admin'].includes(user.role))
      {res.status(403).json({ message: 'Unauthorized' })
      return;}

    const member = users.find(u => u.id === memberId && u.teamId === user.teamId);
    if (!member) {res.status(404).json({ message: 'Member not found' })
      return;}

    member.name = name ?? member.name;
    member.phone = phone ?? member.phone;

    res.status(200).json({ message: 'Member info updated', member });
  };


  // ==================== SOFT DELETE (DISABLE) MEMBER ====================
  export const softDeleteMember = (req: Request, res: Response, next: NextFunction) : void => {
    const user = getUserFromRequest(req);
    const { memberId } = req.body;

    if (user.role !== 'owner') {res.status(403).json({ message: 'Only owner can disable a member' })
      return;}

    const team = teams.find(t => t.id === user.teamId);
    const member = team?.members.find(m => m.id === memberId);

    if (!member || member.role === 'owner')  {res.status(400).json({ message: 'Invalid member' })
      return;}

    team!.members = team!.members.filter(m => m.id !== memberId);
    member.teamId = undefined;
    member.role = 'member'; // optionally mark disabled

    res.status(200).json({ message: 'Member removed (soft delete)' });
  };

  // ==================== SEARCH TEAMS ====================
  export const searchTeams = (req: Request, res: Response , next: NextFunction): void  => {
    const { keyword } = req.query;
    const matches = teams.filter(t =>
      t.name.toLowerCase().includes((keyword as string).toLowerCase())
    );

    res.status(200).json(matches);
  };
  export function acceptSponsorDeal(arg0: string, arg1: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void, acceptSponsorDeal: any) {
      throw new Error('Function not implemented.');
  }

  export function changeMemberRole(arg0: string, arg1: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void, changeMemberRole: any) {
      throw new Error('Function not implemented.');
  }

  //------------------------------------ SEARCH MEMBER BY USERNAME -------------------------------------
  export const searchMemberByUsername = (req: Request, res: Response, next: NextFunction): void => {
    const { username } = req.query;
    if (!username) {
      res.status(400).json({ message: 'Username query parameter is required' });
      return;
    }

    const matches = users.filter(u =>
      u.username.toLowerCase().includes((username as string).toLowerCase())
    );

    res.status(200).json(matches);
  };

  export {teams, users, announcements, sponsorDeals, inviteTokens};