import React, { useState } from 'react';
import { Activity, User, Search, Filter, Shield, Link2, Clock, ChevronDown, X, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuditLogs, getDocumentList, logActivity } from '../utils/dataStore';

const actionStyles: Record<string, { bg: string; border: string; color: string }> = {
  DOWNLOAD: { bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.3)', color: '#38bdf8' },
  UPLOAD:   { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#34d399' },
  SHARE:    { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', color: '#c084fc' },
  VIEW:     { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', color: '#94a3b8' },
  MODIFY:   { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  color: '#fbbf24' },
  DELETE:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   color: '#f87171' },
};

const riskDot: Record<string, string> = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

export const AuditViewer = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  React.useEffect(() => {
    getDocumentList().then(setAllDocs);
    getAuditLogs().then(setLogs);
  }, []);

  const filtered = logs.filter((l: any) => {
    return !search || 
      (l.user && l.user.toLowerCase().includes(search.toLowerCase())) || 
      (l.badge && l.badge.toLowerCase().includes(search.toLowerCase())) || 
      (l.details && l.details.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>
            Immutable Audit Trail
          </h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            Blockchain-anchored system activity log - Every action is permanently recorded
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
          <input
            type="text"
            placeholder="Search by officer name, badge number, or document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'rgba(13,27,42,0.8)', border: search ? '1px solid rgba(240,165,0,0.3)' : '1px solid rgba(255,255,255,0.06)', color: '#e2e8f0' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4" style={{ color: '#475569' }} />
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center gap-2">
        <Filter className="w-3 h-3" style={{ color: '#475569' }} />
        <span className="text-xs" style={{ color: '#475569' }}>
          Showing <span className="font-bold" style={{ color: '#f0a500' }}>{filtered.length}</span> audit entries
        </span>
      </div>

      {/* Timeline / Log list */}
      <div className="space-y-2">
        {filtered.map((log: any) => {
          const style = actionStyles[log.action] || actionStyles.VIEW;
          const isExpanded = expandedId === log.id;
          
          let logDate = "Unknown Date";
          let logTime = "Unknown Time";
          if (log.timestamp) {
            const d = new Date(log.timestamp);
            logDate = d.toISOString().split('T')[0];
            logTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (log.date) {
            logDate = log.date;
            logTime = log.time || "Unknown Time";
          }

          return (
            <div key={log.id}
              className="rounded-xl overflow-hidden transition-all cursor-pointer card-glass"
              onClick={() => setExpandedId(isExpanded ? null : log.id)}>

              <div className="px-5 py-4 flex items-center gap-4">
                {/* Action badge */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-black"
                  style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color }}>
                  {log.action.slice(0, 3)}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#cbd5e1' }}>{log.details || log.doc || "System Event"}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#475569' }}>
                      <User className="w-3 h-3" /> {log.user}
                    </span>
                    {log.badge && (
                      <span className="text-xs font-mono" style={{ color: '#334155' }}>
                        {log.badge}
                      </span>
                    )}
                    {log.dept && (
                      <span className="text-xs" style={{ color: '#334155' }}>
                        {log.dept}
                      </span>
                    )}
                  </div>
                </div>

                {/* Risk + time */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: riskDot[log.risk?.toLowerCase() || 'low'], boxShadow: `0 0 8px ${riskDot[log.risk?.toLowerCase() || 'low']}` }} />
                  <div className="text-right">
                    <div className="text-xs font-mono" style={{ color: '#475569' }}>{logTime}</div>
                    <div className="text-[10px]" style={{ color: '#334155' }}>{logDate}</div>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-0 animate-fade-in-up">
                  <div className="rounded-xl p-4 space-y-3"
                    style={{ background: 'rgba(3,7,18,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                      <div>
                        <span className="block tracking-widest uppercase font-bold mb-0.5" style={{ color: '#334155' }}>IP Address</span>
                        <span className="font-mono" style={{ color: '#94a3b8' }}>{log.ip}</span>
                      </div>
                      <div>
                        <span className="block tracking-widest uppercase font-bold mb-0.5" style={{ color: '#334155' }}>Risk Level</span>
                        <span className="font-semibold capitalize" style={{ color: riskDot[log.risk?.toLowerCase() || 'low'] }}>{log.risk}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block tracking-widest uppercase font-bold mb-0.5" style={{ color: '#334155' }}>Blockchain Transaction</span>
                        <div className="flex items-center gap-2">
                          <Link2 className="w-3 h-3 shrink-0" style={{ color: '#0ea5e9' }} />
                          <span className="font-mono" style={{ color: '#38bdf8' }}>{log.txId || log.hash}</span>
                          <Shield className="w-3 h-3 shrink-0" style={{ color: '#10b981' }} />
                          <span className="text-[10px] font-bold" style={{ color: '#10b981' }}>Anchored</span>
                        </div>
                      </div>
                    </div>
                    
                    {log.action === 'UPLOAD' && (
                      <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const doc = allDocs.find((d: any) => d.id === log.docId || (log.details && log.details.includes(d.title)));
                            if (doc && doc.fileData) {
                              const a = document.createElement('a');
                              a.href = doc.fileData;
                              a.download = doc.originalName || `${doc.title}.${doc.type.toLowerCase()}`;
                              a.click();
                              logActivity('DOWNLOAD', `Downloaded document for verification: ${doc.title}`, user || 'Unknown Admin', '192.168.1.10', 'LOW');
                            } else {
                              alert('Original file content is no longer available or was not cached in this browser session.');
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/10 w-max"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                        >
                          <Download className="w-3.5 h-3.5" /> Download Document for Verification
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 pt-1 mt-2">
                      <Clock className="w-3 h-3" style={{ color: '#334155' }} />
                      <span className="text-[10px]" style={{ color: '#334155' }}>Timestamp recorded in UTC - Cannot be modified or deleted</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
