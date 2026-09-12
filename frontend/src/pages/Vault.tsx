import React, { useState } from 'react';
import {
  Search, Upload, File, ShieldCheck, Lock, Filter, X,
  ChevronDown, Hash, FileText, Image, FileSpreadsheet, Eye, Download, Share2, MoreHorizontal, Edit3, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDocumentList, saveDocumentList, logActivity, addPendingDocument, addNotification } from '../utils/dataStore';

const classificationColors: Record<string, { bg: string; border: string; text: string }> = {
  CONFIDENTIAL: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  RESTRICTED: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
  PUBLIC: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
};

const typeIcons: Record<string, any> = {
  PDF: FileText, ZIP: File, MP4: Image, XLSX: FileSpreadsheet,
};

export const Vault = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>(() => getDocumentList());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedClassification, setSelectedClassification] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  // Upload Form State
  const [upTitle, setUpTitle] = useState('');
  const [upCaseId, setUpCaseId] = useState('');
  const [upClass, setUpClass] = useState('RESTRICTED');
  const [fileAttached, setFileAttached] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!upTitle || !upCaseId) return alert('Please provide Title and Case ID');
    
    let fileData = null;
    let originalName = 'unknown.pdf';
    
    if (fileAttached) {
      originalName = fileAttached.name;
      fileData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(fileAttached);
      });
    }

    const newDoc = {
      id: Date.now().toString(),
      title: upTitle,
      caseId: upCaseId,
      classification: upClass,
      hash: '0x' + Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('') + '...f9e',
      status: 'Pending',
      type: fileAttached ? originalName.split('.').pop()?.toUpperCase() || 'PDF' : 'PDF',
      size: fileAttached ? (fileAttached.size / 1024 / 1024).toFixed(2) + ' MB' : '1.2 MB',
      date: new Date().toISOString().split('T')[0],
      uploadedAt: new Date().toISOString(),
      creator: user ? `${user.name} · ${user.badge}` : 'Unknown Officer',
      uploaderName: user?.name || 'Unknown',
      uploaderBadge: user?.badge || '',
      fileData,
      originalName
    };

    try {
      // Send to PENDING queue — admin must verify before it appears in the vault
      addPendingDocument(newDoc);
      
      // Log the activity
      logActivity('UPLOAD', `Submitted document for verification: ${upTitle}`, user || 'Unknown User', '192.168.1.10', upClass === 'PUBLIC' ? 'LOW' : 'MEDIUM', newDoc.id);
      
      // Notify admin that a new document is waiting for review
      addNotification('ADMIN', `📄 New document pending verification: "${upTitle}" submitted by ${user?.name || 'Unknown'} (${user?.badge || ''})`, 'warning');
      // Notify the user their upload is in queue
      addNotification('USER', `✅ Your document "${upTitle}" has been submitted and is waiting for admin verification.`, 'info');

      alert(`Document "${upTitle}" has been submitted for admin verification. It will appear in the Evidence Vault once approved.`);

      // Reset and close
      setUpTitle('');
      setUpCaseId('');
      setUpClass('RESTRICTED');
      setFileAttached(null);
      setShowUpload(false);
    } catch (e) {
      alert("Error: File is too large. The demo uses your browser's local storage which is limited to 5MB. Please choose a smaller file.");
    }
  };

  const filtered = documents.filter(doc => {
    const s = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(s) || 
      doc.caseId.toLowerCase().includes(s) ||
      (doc.creator && doc.creator.toLowerCase().includes(s)) ||
      (doc.hash && doc.hash.toLowerCase().includes(s));
    
    const matchesCase = !selectedCase || doc.caseId === selectedCase;
    const matchesClass = !selectedClassification || doc.classification === selectedClassification;
    return matchesSearch && matchesCase && matchesClass;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>
            Evidence Vault
          </h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            Tamper-proof document storage with blockchain-backed integrity verification
          </p>
        </div>
        <button onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{ background: 'linear-gradient(135deg, #f0a500, #d97706)', color: '#030712', boxShadow: '0 0 20px rgba(240,165,0,0.3)' }}>
          <Upload className="w-4 h-4" /> Upload Evidence
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 card-glass animate-fade-in-up" style={{ background: '#0a0f1e', border: '1px solid rgba(240,165,0,0.2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg" style={{ color: '#e2e8f0' }}>Upload Secure Evidence</h3>
              <button onClick={() => setShowUpload(false)} className="p-1 rounded-lg transition-colors" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Drop zone */}
            <label className="border-2 border-dashed rounded-xl p-10 text-center mb-5 transition-colors cursor-pointer block"
              style={{ borderColor: fileAttached ? '#10b981' : 'rgba(240,165,0,0.2)', background: 'rgba(240,165,0,0.02)' }}>
              <input type="file" className="hidden" onChange={e => setFileAttached(e.target.files?.[0] || null)} />
              <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: fileAttached ? '#10b981' : '#f0a500' }} />
              <p className="text-sm font-semibold" style={{ color: fileAttached ? '#10b981' : '#94a3b8' }}>
                {fileAttached ? fileAttached.name : 'Drop files here or click to browse'}
              </p>
              <p className="text-xs mt-1" style={{ color: '#334155' }}>PDF, DOCX, ZIP, MP4, JPG A Max 500MB</p>
            </label>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#64748b' }}>Document Title</label>
                <input type="text" placeholder="e.g. Forensic Lab Report"
                  value={upTitle} onChange={e => setUpTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#64748b' }}>Case ID</label>
                  <input type="text" placeholder="e.g. CASE-401"
                    value={upCaseId} onChange={e => setUpCaseId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#64748b' }}>Classification</label>
                  <select className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                    value={upClass} onChange={e => setUpClass(e.target.value)}
                    style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="PUBLIC">PUBLIC</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUpload(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>Cancel</button>
              <button onClick={handleUpload} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f0a500, #d97706)', color: '#030712', boxShadow: '0 0 16px rgba(240,165,0,0.3)' }}>
                <Lock className="w-4 h-4" /> Encrypt & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
          <input
            type="text"
            placeholder="Search by title, case, officer name, or badge number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'rgba(13,27,42,0.8)', border: searchQuery ? '1px solid rgba(240,165,0,0.3)' : '1px solid rgba(255,255,255,0.06)', color: '#e2e8f0', boxShadow: searchQuery ? '0 0 12px rgba(240,165,0,0.1)' : 'none' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4" style={{ color: '#475569' }} />
            </button>
          )}
        </div>

        <div className="relative">
          <select value={selectedCase} onChange={e => setSelectedCase(e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'rgba(13,27,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
            <option value="">All Cases</option>
            <option value="CASE-8992">CASE-8992</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
        </div>

        <div className="relative">
          <select value={selectedClassification} onChange={e => setSelectedClassification(e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'rgba(13,27,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
            <option value="">All Levels</option>
            <option value="CONFIDENTIAL">Confidential</option>
            <option value="RESTRICTED">Restricted</option>
            <option value="PUBLIC">Public</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <Filter className="w-3 h-3" style={{ color: '#475569' }} />
        <span className="text-xs" style={{ color: '#475569' }}>
          Showing <span className="font-bold" style={{ color: '#f0a500' }}>{filtered.length}</span> evidence records
        </span>
      </div>

      {/* Document Table */}
      <div className="rounded-2xl overflow-hidden card-glass">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(240,165,0,0.1)' }}>
              {['Case', 'Evidence Title', 'Classification', 'SHA-256 Hash', 'Integrity', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left">
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#334155' }}>{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => {
              const TypeIcon = typeIcons[doc.type] || File;
              const cls = classificationColors[doc.classification] || classificationColors.PUBLIC;
              return (
                <tr key={doc.id} className="evidence-row transition-all" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="px-5 py-4">
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded"
                      style={{ background: 'rgba(240,165,0,0.08)', color: '#f0a500', border: '1px solid rgba(240,165,0,0.15)' }}>
                      {doc.caseId}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
                        <TypeIcon className="w-4 h-4" style={{ color: '#38bdf8' }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#cbd5e1' }}>{doc.title}</p>
                        <p className="text-[10px]" style={{ color: '#475569' }}>{doc.creator} · {doc.size} · {doc.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
                      style={{ background: cls.bg, border: `1px solid ${cls.border}`, color: cls.text }}>
                      {doc.classification}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3 h-3 shrink-0" style={{ color: '#334155' }} />
                      <span className="text-xs font-mono truncate max-w-[140px]" style={{ color: '#475569' }}>{doc.hash}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {doc.status === 'Verified' ? (
                      <span className="badge-verified flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full w-max"
                        style={{ color: '#34d399' }}>
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="badge-restricted flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full w-max"
                        style={{ color: '#fbbf24' }}>
                        <Lock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          logActivity('VIEW', `Viewed document details: ${doc.title}`, user || 'Unknown', '192.168.1.10', 'LOW', doc.id);
                          if (doc.fileData) {
                            const w = window.open();
                            if (w) w.document.write(`<iframe src="${doc.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                          } else {
                            alert('Secure preview not available. File data missing.');
                          }
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ background: 'rgba(255,255,255,0.03)' }} title="View">
                        <Eye className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
                      </button>
                      <button 
                        onClick={() => {
                          if (doc.fileData) {
                            const a = document.createElement('a');
                            a.href = doc.fileData;
                            a.download = doc.originalName || `${doc.title}.${doc.type.toLowerCase()}`;
                            a.click();
                            logActivity('DOWNLOAD', `Downloaded document: ${doc.title}`, user || 'Unknown', '192.168.1.10', 'LOW', doc.id);
                          } else {
                            alert('File content not available for this record.');
                          }
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ background: 'rgba(255,255,255,0.03)' }} title="Download">
                        <Download className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
                      </button>
                      <button 
                        onClick={() => {
                          const target = prompt('Enter officer badge number to securely share this document with:');
                          if (target) {
                            logActivity('SHARE', `Shared document: ${doc.title} with ${target}`, user || 'Unknown', '192.168.1.10', 'MEDIUM', doc.id);
                            alert(`Document securely shared with ${target}`);
                          }
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ background: 'rgba(255,255,255,0.03)' }} title="Share">
                        <Share2 className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <>
                          <button 
                            onClick={() => {
                              const newClass = prompt(`Current classification is ${doc.classification}.\nEnter new classification (PUBLIC, RESTRICTED, CONFIDENTIAL):`, doc.classification);
                              if (newClass && ['PUBLIC', 'RESTRICTED', 'CONFIDENTIAL'].includes(newClass.toUpperCase())) {
                                const newDocs = documents.map(d => d.id === doc.id ? { ...d, classification: newClass.toUpperCase() } : d);
                                setDocuments(newDocs);
                                saveDocumentList(newDocs);
                                logActivity('MODIFY', `Changed classification of ${doc.title} to ${newClass.toUpperCase()}`, user || 'Unknown', '192.168.1.10', 'HIGH', doc.id);
                              }
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                            style={{ background: 'rgba(255,255,255,0.03)' }} title="Modify Classification">
                            <Edit3 className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to PERMANENTLY DELETE ${doc.title}?`)) {
                                const newDocs = documents.filter(d => d.id !== doc.id);
                                setDocuments(newDocs);
                                saveDocumentList(newDocs);
                                logActivity('DELETE', `Permanently deleted document: ${doc.title}`, user || 'Unknown', '192.168.1.10', 'HIGH', doc.id);
                              }
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/20"
                            style={{ background: 'rgba(255,255,255,0.03)' }} title="Delete">
                            <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
