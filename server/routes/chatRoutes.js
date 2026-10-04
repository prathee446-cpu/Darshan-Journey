import express from 'express';
import { handleChatMessage, getChatHistory, resetChatHistory, getDbTest } from '../controllers/chatController.js';

const router = express.Router();

router.post('/message', handleChatMessage);
router.get('/history', getChatHistory);
router.post('/reset', resetChatHistory);
router.get('/db-test', getDbTest);

export default router;
