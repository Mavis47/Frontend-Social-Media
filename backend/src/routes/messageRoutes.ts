import express from 'express';
import { deleteMessage, getMessage, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/sendMessage',sendMessage);
router.get('/getMessage/:senderId/:receiverId', getMessage);
router.delete('/deleteMessage/:messageId', deleteMessage);

export default router;