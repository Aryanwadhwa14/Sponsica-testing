import request from 'supertest';
import { app } from './index';
import { teams, users } from './teams/teams.controller';
import { Team, User } from './teams/teams.model';

describe('Teams API', () => {
  beforeEach(() => {
    // Reset in-memory data before each test
    teams.length = 0;
    users.length = 0;
  });

  describe('GET /api/team/info', () => {
    it('should return 404 when user has no team', async () => {
      const res = await request(app)
        .get('/api/team/info')
        .send({ userId: 'non-existent-user' });
      
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User/team not found');
    });

    it('should get team info for user with team', async () => {
      // Create a user first
      const user: User = {
        id: '0123456789',
        name: 'Aryan',
        username: 'Aryan14',
        role: 'owner',
        email: 'aryanwadhwa2005@gmail.com'
      };
      users.push(user);

      // Create team and link it to the user
      const team: Team = {
        id: '1345678',
        name: 'sponsica Team',
        description: 'sponsors near you !',
        ownerId: user.id,
        members: [user]
      };
      teams.push(team);
      
      // Link user to team
      user.teamId = team.id;

      const res = await request(app)
        .get('/api/team/info')
        .send({ userId: user.id });

      expect(res.status).toBe(200);
      expect(res.body.team).toEqual(team);
    });
  });

  describe('POST /api/team/create', () => {
    it('should create a new team', async () => {
      const user: User = {
        id: '0123456789',
        name: 'Aryan',
        username: 'Aryan14',
        role: 'owner',
        email: 'aryanwadhwa2005@gmail.com',
        teamId: '123456789'
      };
      users.push(user);

      const teamData = {
        name: 'New Team',
        description: 'A new test team',
        userId: user.id
      };

      const res = await request(app)
        .post('/api/team/create')
        .send(teamData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Team created');
      expect(res.body.team).toHaveProperty('id');
      expect(res.body.team.name).toBe(teamData.name);
      expect(res.body.team.description).toBe(teamData.description);
      expect(res.body.team.ownerId).toBe(user.id);
    });

    it('should return 404 for non-existent user', async () => {
      const teamData = {
        name: 'New Team',
        description: 'A new test team',
        userId: 'non-existent-user'
      };

      const res = await request(app)
        .post('/api/team/create')
        .send(teamData);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/team/settings', () => {
    it('should update team settings for owner', async () => {
      const user: User = {
        id: 'test-user-id',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        role: 'owner',
        teamId: 'test-team-id'
      };
      users.push(user);

      const team: Team = {
        id: 'test-team-id',
        name: 'Test Team',
        description: 'Old Description',
        ownerId: user.id,
        members: [user]
      };
      teams.push(team);

      const updateData = {
        userId: user.id,
        phone: '1234567890',
        email: 'test@example.com',
        description: 'Updated Description'
      };

      const res = await request(app)
        .put('/api/team/settings')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Team updated');
      expect(res.body.team.phone).toBe(updateData.phone);
      expect(res.body.team.email).toBe(updateData.email);
      expect(res.body.team.description).toBe(updateData.description);
    });
  });

  describe('POST /api/team/members/add', () => {
    it('should add member to team', async () => {
      const owner: User = {
        id: 'owner-id',
        name: 'Owner',
        username: 'owner',
        role: 'owner',
        email: 'test@example.com',
        teamId: '123456789' // Match the team ID
      };
      const newMember: User = {
        id: 'member-id',
        name: 'New Member',
        username: 'newmember',
        email: 'test@example.com',
        role: 'member'
      };
      users.push(owner, newMember);

      const team: Team = {
        id: '123456789', // This matches the user.teamId
        name: 'sponsica Team',
        description: 'sponsors near you !',
        ownerId: owner.id,
        members: [owner]
      };
      teams.push(team);

      const addData = {
        userId: owner.id, // This will be used by middleware to set req.user
        newMemberId: newMember.id
      };

      const res = await request(app)
        .post('/api/team/members/add')
        .send(addData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Member added');
      expect(team.members).toHaveLength(2);
      expect(newMember.teamId).toBe(team.id);
    });
  });

  describe('DELETE /api/team/members/remove', () => {
    it('should remove member from team', async () => {
      const owner: User = {
        id: '0123456789',
        name: 'Aryan',
        username: 'Aryan14',
        role: 'owner',
        email: 'aryanwadhwa2005@gmail.com',
        teamId: 'test-team-id' // Match the team ID
      };
      const member: User = {
        id: 'member-id',
        name: 'Member',
        username: 'member',
        role: 'member',
        email: 'member@example.com',
        teamId: 'test-team-id' // Match the team ID
      };
      users.push(owner, member);

      const team: Team = {
        id: 'test-team-id', // This matches the user.teamId
        name: 'Test Team',
        ownerId: owner.id,
        members: [owner, member]
      };
      teams.push(team);

      const removeData = {
        userId: owner.id, // This will be used by middleware to set req.user
        removeId: member.id
      };

      const res = await request(app)
        .delete('/api/team/members/remove')
        .send(removeData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Member removed');
      expect(team.members).toHaveLength(1);
      expect(member.teamId).toBeUndefined();
    });
  });

  describe('GET /api/team/analytics', () => {
    it('should get team analytics', async () => {
      const user: User = {
        id: '0123456789',
        name: 'Aryan',
        username: 'Aryan14',
        role: 'owner',
        email: 'aryanwadhwa2005@gmail.com',
        teamId: '123456789'
      };
      users.push(user);

      const res = await request(app)
        .get('/api/team/analytics')
        .send({ userId: user.id });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('membersCount');
      expect(res.body).toHaveProperty('announcementCount');
      expect(res.body).toHaveProperty('dealCount');
    });
  });

  describe('GET /api/team/search', () => {
    it('should search teams by keyword', async () => {
      const team1: Team = {
        id: 'team1',
        name: 'Test Team One',
        ownerId: 'user1',
        members: []
      };
      const team2: Team = {
        id: 'team2',
        name: 'Another Team',
        ownerId: 'user2',
        members: []
      };
      teams.push(team1, team2);

      const res = await request(app)
        .get('/api/team/search?keyword=Test');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Test Team One');
    });
  });
});