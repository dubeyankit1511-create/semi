import React, { useState } from 'react';
import { CheckCircle, XCircle, Download, Eye, Clock, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getPendingDocuments, savePendingDocuments,
  getDocumentList, saveDocumentList, logActivity, addNotification
} from '../utils/dataStore';

const classificationColors: Record<string, { bg: string; border: string; text: string }> = {
  CONFIDENTIAL: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  RESTRICTED:   { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
  PUBLIC:       { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
};

export const DocVerification = () => {
  const { user } = useAuth();
  const [pending, setPending] = useState<any[]>([]);

  React.useEffect(() => {
    getPendingDocuments().then(setPending);
  }, []);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Shield className="w-16 h-16" style={{ color: '#334155' }} />
        <p className="text-lg font-bold" style={{ color: '#475569' }}>Access Denied</p>
        <p className="text-sm" style={{ color: '#334155' }}>Only administrators can access document verification.</p>
      </div>
    );
  }

  const handleApprove = async (doc: any) => {
    // API Call
    await import('../utils/dataStore').then(m => m.approveDocumentAPI(doc.id, user.name));

    // Remove from pending locally
    const updated = pending.filter((d: any) => d.id !== doc.id);
    setPending(updated);

    logActivity('MODIFY', `Approved & verified document: ${doc.title}`, user, '192.168.1.10', 'LOW', doc.id);
    addNotification('USER', `✅ Your document "${doc.title}" has been APPROVED and is now available in the Evidence Vault.`, 'success');
    alert(`✅ Document "${doc.title}" has been APPROVED and added to the Evidence Vault.`);
  };

  const handleReject = async (doc: any) => {
    const reason = prompt(`Enter reason for rejecting "${doc.title}":`);
    if (!reason) return;

    // API Call
    await import('../utils/dataStore').then(m => m.rejectDocumentAPI(doc.id));

    // Remove from pending locally
    const updated = pending.filter((d: any) => d.id !== doc.id);
    setPending(updated);

    logActivity('DELETE', `Rejected document: ${doc.title} — Reason: ${reason}`, user, '192.168.1.10', 'HIGH', doc.id);
    addNotification('USER', `❌ Your document "${doc.title}" was REJECTED by admin. Reason: ${reason}`, 'error');
    alert(`❌ Document "${doc.title}" has been REJECTED and permanently removed.`);
  };

  const handlePreview = (doc: any) => {
    if (doc.fileData) {
      const w = window.open();
      if (w) w.document.write(`<iframe src="${doc.fileData}" frameborder="0" style="border:0;top:0;left:0;bottom:0;right:0;width:100%;height:100%;" allowfullscreen></iframe>`);
    } else {
      alert('Preview not available for this document.');
    }
  };

  const handleDownload = (doc: any) => {
    if (doc.fileData) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.originalName || `${doc.title}`;
      a.click();
      logActivity('DOWNLOAD', `Downloaded for review: ${doc.title}`, user, '192.168.1.10', 'LOW', doc.id);
    } else {
      alert('File content not available.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>
          Document Verification Queue
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>
          Review and approve or reject documents submitted by officers
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
          <Clock className="w-4 h-4" />
          {pending.length} Pending Review
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            <AlertTriangle className="w-4 h-4" />
            Action Required
          </div>
        )}
      </div>

      {/* Empty state */}
      {pending.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: 'rgba(13,27,42,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CheckCircle className="w-16 h-16 mb-4" style={{ color: '#10b981' }} />
          <p className="text-lg font-bold" style={{ color: '#94a3b8' }}>All Clear</p>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>No documents pending verification</p>
        </div>
      )}

      {/* Pending Documents */}
      <div className="space-y-4">
        {pending.map((doc: any) => {
          const cls = classificationColors[doc.classification] || classificationColors['RESTRICTED'];
          const uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : doc.date;

          return (
            <div key={doc.id} className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(13,27,42,0.8)', border: '1px solid rgba(245,158,11,0.2)' }}>
              
              {/* Pending badge */}
              <div className="px-5 py-2 flex items-center gap-2 text-xs font-bold"
                style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                <Clock className="w-3.5 h-3.5" />
                PENDING ADMIN VERIFICATION
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Document title */}
                    <h3 className="text-base font-black mb-1" style={{ color: '#e2e8f0' }}>{doc.title}</h3>
                    
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                      <span className="font-bold px-2 py-0.5 rounded-full"
                        style={{ background: cls.bg, border: `1px solid ${cls.border}`, color: cls.text }}>
                        {doc.classification}
                      </span>
                      <span style={{ color: '#64748b' }}>Case: <span style={{ color: '#94a3b8' }}>{doc.caseId || 'N/A'}</span></span>
                      <span style={{ color: '#64748b' }}>Type: <span style={{ color: '#94a3b8' }}>{doc.type}</span></span>
                      <span style={{ color: '#64748b' }}>Size: <span style={{ color: '#94a3b8' }}>{doc.size}</span></span>
                    </div>

                    {/* Uploader info */}
                    <div className="flex items-center gap-2 text-xs p-3 rounded-xl mb-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Shield className="w-4 h-4 shrink-0" style={{ color: '#64748b' }} />
                      <div>
                        <span className="font-bold" style={{ color: '#94a3b8' }}>{doc.uploaderName}</span>
                        <span className="mx-2" style={{ color: '#334155' }}>·</span>
                        <span className="font-mono" style={{ color: '#64748b' }}>{doc.uploaderBadge}</span>
                        <span className="mx-2" style={{ color: '#334155' }}>·</span>
                        <span style={{ color: '#475569' }}>Submitted: {uploadDate}</span>
                      </div>
                    </div>

                    {/* Hash */}
                    <div className="text-[10px] font-mono" style={{ color: '#334155' }}>{doc.hash}</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button onClick={() => handlePreview(doc)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button onClick={() => handleDownload(doc)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>

                  <div className="flex-1" />

                  <button onClick={() => handleReject(doc)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all hover:bg-red-500/20"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => handleApprove(doc)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 0 16px rgba(16,185,129,0.3)' }}>
                    <CheckCircle className="w-4 h-4" /> Approve & Verify
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
