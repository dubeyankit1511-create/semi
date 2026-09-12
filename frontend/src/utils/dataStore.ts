import { apiClient } from './apiClient';

export const getDocumentList = async () => {
  try {
    const res = await apiClient.get('/api/data/documents');
    return res.data;
  } catch {
    return [];
  }
};

export const saveDocumentList = async (docs: any[]) => {
  // Not used typically with API, but keeping for legacy
};

export const getPendingDocuments = async () => {
  try {
    const res = await apiClient.get('/api/data/documents');
    return res.data.filter((d: any) => d.status === 'PENDING');
  } catch {
    return [];
  }
};

export const savePendingDocuments = async (docs: any[]) => {
  // Not used in full API
};

export const addPendingDocument = async (doc: any) => {
  try {
    await apiClient.post('/api/data/documents', { ...doc, status: 'PENDING' });
  } catch (e) {
    console.error(e);
  }
};

export const approveDocumentAPI = async (docId: string, verifiedBy: string) => {
  try {
    await apiClient.put(`/api/data/documents/${docId}`, { status: 'ACTIVE', verifiedBy });
  } catch (e) {
    console.error(e);
  }
};

export const rejectDocumentAPI = async (docId: string) => {
  try {
    await apiClient.delete(`/api/data/documents/${docId}`);
  } catch (e) {
    console.error(e);
  }
};

export const getAuditLogs = async () => {
  try {
    const res = await apiClient.get('/api/data/audit');
    return res.data;
  } catch {
    return [];
  }
};

export const logActivity = async (action: string, details: string, userObj: any, ip: string = '192.168.1.100', risk: string = 'LOW', docId?: string) => {
  try {
    const name = userObj?.name || (typeof userObj === 'string' ? userObj : 'System');
    await apiClient.post('/api/data/audit', {
      action,
      userId: userObj?.id || 'SUPER-ADMIN-001',
      ipAddress: ip,
      details: JSON.stringify({ name, details, risk, badge: userObj?.badge }),
      documentId: docId || null
    });
  } catch (e) {
    console.error(e);
  }
};

// Access logs
export const getAccessLogs = () => {
  const saved = localStorage.getItem('SECURE_SYNC_ACCESS_LOGS');
  return saved ? JSON.parse(saved) : [];
};

export const saveAccessLogs = (logs: any[]) => {
  localStorage.setItem('SECURE_SYNC_ACCESS_LOGS', JSON.stringify(logs));
};

export const logAccess = (action: 'LOGIN' | 'LOGOUT', userObj: any, ip: string = '192.168.1.10') => {
  const logs = getAccessLogs();
  const name = userObj?.name || (typeof userObj === 'string' ? userObj : 'Unknown');
  const badge = userObj?.badge || '';
  const dept = userObj?.department || userObj?.dept || '';
  const newLog = { id: Date.now().toString(), timestamp: new Date().toISOString(), user: name, badge, dept, action, ip };
  saveAccessLogs([newLog, ...logs]);
};

// Notifications
export const getNotifications = (role: string) => {
  const key = role === 'ADMIN' ? 'SECURE_SYNC_NOTIF_ADMIN' : 'SECURE_SYNC_NOTIF_USER';
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : [];
};

export const saveNotifications = (role: string, notifs: any[]) => {
  const key = role === 'ADMIN' ? 'SECURE_SYNC_NOTIF_ADMIN' : 'SECURE_SYNC_NOTIF_USER';
  localStorage.setItem(key, JSON.stringify(notifs));
};

export const addNotification = (role: 'ADMIN' | 'USER', message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const notifs = getNotifications(role);
  const newNotif = { id: Date.now().toString(), message, type, read: false, timestamp: new Date().toISOString() };
  saveNotifications(role, [newNotif, ...notifs]);
};

export const markAllNotificationsRead = (role: string) => {
  const notifs = getNotifications(role);
  const updated = notifs.map((n: any) => ({ ...n, read: true }));
  saveNotifications(role, updated);
};

export const clearNotifications = (role: string) => {
  saveNotifications(role, []);
};
