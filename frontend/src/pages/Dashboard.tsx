import React, { useState, useEffect } from 'react';
import { ShieldAlert, FileText, Users, Activity, TrendingUp, Lock, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { getDocumentList, getAuditLogs, getPendingDocuments } from '../utils/dataStore';
import { getUserDirectory } from '../utils/userStore';

const actionColors: Record<string, string> = {
  DOWNLOAD: '#0ea5e9', UPLOAD: '#10b981', SHARE: '#a855f7',
  VIEW: '#64748b', MODIFY: '#f59e0b', DELETE: '#ef4444'
};
const riskColors: Record<string, string> = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

export const Dashboard = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  
  useEffect(() => {
    getDocumentList().then(setDocs);
    getAuditLogs().then(setLogs);
    getPendingDocuments().then(setPending);
  }, []);

  const users = getUserDirectory();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = logs.filter((l: any) => (l.timestamp || '').startsWith(todayStr));
  const recentActivity = logs.slice(0, 5);
  const userCount = Object.keys(users).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>
            Command Center
          </h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            Real-time overview of all evidence assets and department activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
            <CheckCircle className="w-4 h-4" /> All Systems Operational
          </div>
          {pending.length > 0 && (
            <div className="px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              <AlertTriangle className="w-4 h-4" /> {pending.length} Docs Pending Verification
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Secured Documents */}
        <div className="relative rounded-2xl p-5 overflow-hidden card-glass" style={{ borderColor: '#0ea5e930' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5"
            style={{ background: '#0ea5e9', transform: 'translate(30%,-30%)' }} />
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#0ea5e915', border: '1px solid #0ea5e930' }}>
              <FileText className="w-5 h-5" style={{ color: '#0ea5e9' }} />
            </div>
            {docs.length > 0 && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                <TrendingUp className="w-3 h-3" />Live
              </span>
            )}
          </div>
          <div className="text-2xl font-black mb-1" style={{ color: '#e2e8f0' }}>{docs.length}</div>
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Secured Documents</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-30" style={{ background: 'linear-gradient(90deg,#0ea5e9,transparent)' }} />
        </div>

        {/* Audit Events Today */}
        <div className="relative rounded-2xl p-5 overflow-hidden card-glass" style={{ borderColor: '#10b98130' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5"
            style={{ background: '#10b981', transform: 'translate(30%,-30%)' }} />
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#10b98115', border: '1px solid #10b98130' }}>
              <Activity className="w-5 h-5" style={{ color: '#10b981' }} />
            </div>
          </div>
          <div className="text-2xl font-black mb-1" style={{ color: '#e2e8f0' }}>{todayEvents.length}</div>
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Audit Events Today</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-30" style={{ background: 'linear-gradient(90deg,#10b981,transparent)' }} />
        </div>

        {/* Active Personnel */}
        <div className="relative rounded-2xl p-5 overflow-hidden card-glass" style={{ borderColor: '#a855f730' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5"
            style={{ background: '#a855f7', transform: 'translate(30%,-30%)' }} />
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#a855f715', border: '1px solid #a855f730' }}>
              <Users className="w-5 h-5" style={{ color: '#a855f7' }} />
            </div>
          </div>
          <div className="text-2xl font-black mb-1" style={{ color: '#e2e8f0' }}>{userCount}</div>
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Active Personnel</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-30" style={{ background: 'linear-gradient(90deg,#a855f7,transparent)' }} />
        </div>

        {/* Pending Verification */}
        <div className="relative rounded-2xl p-5 overflow-hidden card-glass" style={{ borderColor: '#f59e0b30' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5"
            style={{ background: '#f59e0b', transform: 'translate(30%,-30%)' }} />
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#f59e0b15', border: '1px solid #f59e0b30' }}>
              <ShieldAlert className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            {pending.length > 0 && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                !
              </span>
            )}
          </div>
          <div className="text-2xl font-black mb-1" style={{ color: '#e2e8f0' }}>{pending.length}</div>
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Pending Verification</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-30" style={{ background: 'linear-gradient(90deg,#f59e0b,transparent)' }} />
        </div>

      </div>

      {/* Content row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="col-span-2 rounded-2xl overflow-hidden card-glass">
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(240,165,0,0.1)' }}>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: '#f0a500' }} />
              <span className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Recent Audit Activity</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(240,165,0,0.1)', color: '#f0a500', border: '1px solid rgba(240,165,0,0.2)' }}>
              Live
            </span>
          </div>

          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
            {recentActivity.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: '#475569' }}>
                No activity recorded yet. Start uploading documents to see live activity here.
              </div>
            ) : (
              recentActivity.map((log: any, i: number) => {
                const dateObj = new Date(log.timestamp);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const color = actionColors[log.action] || '#64748b';
                return (
                  <div key={i} className="px-5 py-3 flex items-center gap-4 transition-all hover:bg-white/5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                      {log.action.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#cbd5e1' }}>{log.details}</p>
                      <p className="text-xs truncate" style={{ color: '#475569' }}>
                        {log.user} {log.badge ? `· ${log.badge}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-2 h-2 rounded-full" style={{ background: riskColors[log.risk] || '#10b981' }} />
                      <span className="text-xs font-mono" style={{ color: '#334155' }}>{timeStr}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Integrity Status */}
        <div className="rounded-2xl card-glass overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(240,165,0,0.1)' }}>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" style={{ color: '#f0a500' }} />
              <span className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Vault Status</span>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Verified Documents', value: docs.filter((d: any) => d.status === 'Verified').length, total: docs.length, color: '#10b981' },
              { label: 'Pending Review', value: pending.length, total: pending.length + docs.length, color: '#f59e0b' },
              { label: 'Total Logs', value: logs.length, total: logs.length, color: '#0ea5e9' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold" style={{ color: '#64748b' }}>{item.label}</span>
                  <span className="text-xs font-black" style={{ color: item.color }}>{item.value}</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: item.total > 0 ? `${Math.min(100, Math.round((item.value / item.total) * 100))}%` : '0%', background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                </div>
              </div>
            ))}

            <div className="pt-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                <span className="text-xs" style={{ color: '#475569' }}>Blockchain integrity active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
