import { Router } from 'express';
import { getUsers, getDocuments, createDocument, updateDocument, deleteDocument, getAuditLogs, createAuditLog } from '../controllers/apiController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all API routes
router.use(authenticateToken);

// Users
router.get('/users', getUsers);

// Documents
router.get('/documents', getDocuments);
router.post('/documents', createDocument);
router.put('/documents/:id', updateDocument);
router.delete('/documents/:id', deleteDocument);

// Audit Logs
router.get('/audit', getAuditLogs);
router.post('/audit', createAuditLog);

export default router;
