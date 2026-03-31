const express = require('express');

const { authenticateJWT } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const queueController = require('../controllers/queueController');

const router = express.Router();

// Literal paths first (specific routes)
router.post('/create', authenticateJWT, requireRole('admin'), queueController.createQueue);
router.get('/admin/stats', authenticateJWT, requireRole('admin'), queueController.getAdminStats);
router.get('/admin/customers', authenticateJWT, requireRole('admin'), queueController.getAdminCompletedCustomers);
router.get('/my', authenticateJWT, requireRole('admin'), queueController.getMyQueues);
router.get('/completed', authenticateJWT, requireRole('user'), queueController.getCompletedQueues);
router.delete('/completed/:entryId', authenticateJWT, requireRole('user'), queueController.removeCompletedQueue);
router.get('/all', authenticateJWT, requireRole('user'), queueController.getAllQueues);
router.get('/joined', authenticateJWT, requireRole('user'), queueController.getJoinedQueues);
router.get('/search', authenticateJWT, queueController.searchQueues);

// Specific parameter paths
router.get('/details/:queueId', authenticateJWT, requireRole('user'), queueController.getQueueDetails);
router.get('/my/:queueId', authenticateJWT, requireRole('admin'), queueController.getQueueEntries);
router.get('/my/:queueId/entry/:entryId', authenticateJWT, requireRole('admin'), queueController.getEntryDetails);

// Generic parameter paths (less specific)
router.post('/join/:queueId', authenticateJWT, requireRole('user'), queueController.joinQueue);
router.delete('/leave/:queueId', authenticateJWT, requireRole('user'), queueController.leaveQueue);
router.put('/:queueId/rename', authenticateJWT, requireRole('admin'), queueController.renameQueue);
router.put('/:queueId/next', authenticateJWT, requireRole('admin'), queueController.nextQueue);
router.delete('/:queueId/remove/:id', authenticateJWT, requireRole('admin'), queueController.removeQueueItem);
router.delete('/:queueId', authenticateJWT, requireRole('admin'), queueController.deleteQueue);

module.exports = router;

