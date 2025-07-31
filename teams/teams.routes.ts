import express from 'express';
import * as teamController from './teams.controller';
import { roleMiddleware } from './role.middleware';


const router = express.Router();


// Team Info    
router.get('/info', teamController.getTeamInfo);

// Create Team - only if you want exposed   
router.post('/create', teamController.createTeam);

// Edit team settings - owner/admin
router.put('/settings', roleMiddleware(['owner', 'admin']), teamController.editTeamSettings);

// Add member - owner/admin
router.post('/members/add', roleMiddleware(['owner', 'admin']), teamController.addMember);

// Remove member - owner/admin
router.delete('/members/remove', roleMiddleware(['owner', 'admin']), teamController.removeMember);

// Promote/Demote member - owner only
router.put('/members/role', roleMiddleware(['owner']), teamController.changeRole);

// Update member info - owner/admin
router.put('/members/update', roleMiddleware(['owner', 'admin']), teamController.updateMemberInfo);

// Get members segregated by role
router.get('/members', roleMiddleware(['owner', 'admin', 'member']), teamController.getMembersByRole);

// Leave team - any member except owner
router.post('/leave', roleMiddleware(['admin', 'member']), teamController.leaveTeam);

// Transfer ownership - owner only
router.post('/transfer-ownership', roleMiddleware(['owner']), teamController.transferOwnership);

// Announcements - owner/admin
router.post('/announcements', roleMiddleware(['owner', 'admin']), teamController.makeAnnouncement);

// Get team analytics - all roles allowed
router.get('/analytics', teamController.getAnalytics);

// Accept sponsor deal - owner/admin
router.post('/sponsor/accept', roleMiddleware(['owner', 'admin']), teamController.acceptDeal);

// Invite link generation - owner only
router.get('/invite/generate', roleMiddleware(['owner']), teamController.generateInviteLink);

// Reset invite link - owner only
router.get('/invite/reset', roleMiddleware(['owner']), teamController.resetInviteLink);

// Turning off invite link - owner only
router.post('/invite/disable', roleMiddleware(['owner']), teamController.disableInviteLink);

// Search teams (public)
router.get('/search', teamController.searchTeams);

// Soft delete member (disable) - owner only 
router.post('/members/disable', roleMiddleware(['owner']), teamController.softDeleteMember);

// Search members by name - owner/admin (not used for searching in chat)
router.get('/members/search', roleMiddleware(['owner', 'admin']), teamController.searchMemberByUsername);

export default router;
