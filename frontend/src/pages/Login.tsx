import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Shield, Eye, EyeOff, Fingerprint, AlertCircle, ScanLine } from 'lucide-react';
import { getUserDirectory } from '../utils/userStore';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [badge, setBadge] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── PARALLAX BACKGROUND STATE ──────────────────────────────────────
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Calculate mouse position relative to the center of the screen
    const x = (e.clientX / window.innerWidth - 0.5) * 20; // max 20px movement
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Inside component
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        badgeNumber: badge,
        password: password
      });

      if (response.data.token) {
        // Adapt the backend user object to what the frontend AuthContext expects
        const apiUser = response.data.user;
        login(response.data.token, {
          name: apiUser.firstName + ' ' + apiUser.lastName,
          role: apiUser.role,
          badge: apiUser.badge,
          department: apiUser.department,
          isSuperAdmin: apiUser.isSuperAdmin,
        });
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid badge number or access code. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #030712 0%, #0a0f1e 50%, #0d1b2a 100%)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      {/* ═══════════════════════ PARALLAX BACKGROUND ═══════════════════════ */}
      
      {/* Background Grid - Moves opposite to mouse */}
      <div 
        className="absolute inset-[-50px] opacity-10 transition-transform duration-300 ease-out"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(240,165,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(240,165,0,0.3) 1px, transparent 1px)', 
          backgroundSize: '60px 60px',
          transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)`
        }} 
      />

      {/* Security Scanning Laser Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div 
          className="w-full h-32 absolute top-[-30%]"
          style={{ 
            background: 'linear-gradient(to bottom, transparent, rgba(240,165,0,0.05) 50%, rgba(240,165,0,0.3) 95%, rgba(240,165,0,0.8) 100%)',
            borderBottom: '2px solid rgba(240,165,0,0.8)',
            animation: 'scanline-vertical 4s ease-in-out infinite alternate',
          }} 
        />
      </div>

      {/* Floating orbs - Parallax movement */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-float-slow transition-transform duration-300 ease-out"
        style={{ 
          background: 'radial-gradient(circle, #f0a500, transparent)',
          transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` 
        }} 
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 animate-float-medium transition-transform duration-300 ease-out"
        style={{ 
          background: 'radial-gradient(circle, #0ea5e9, transparent)',
          transform: `translate(${mousePos.x * -2}px, ${mousePos.y * -2}px)`
        }} 
      />
      
      {/* Hexagon Security Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23f0a500' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          transition: 'transform 0.2s ease-out'
        }} 
      />

      {/* ═══════════════════════ STATIONARY FOREGROUND ═══════════════════════ */}
      <div className="relative w-full max-w-md px-6 z-10">

        {/* Floating shield badge */}
        <div className="flex justify-center mb-8">
          <div className="relative animate-float-badge">
            <div className="absolute inset-0 rounded-full animate-ping-slow"
              style={{ background: '#f0a500', opacity: 0.2 }} />
            <div className="absolute -inset-3 rounded-full animate-spin-slow opacity-30 pointer-events-none"
              style={{ background: 'conic-gradient(from 0deg, transparent, #f0a500, transparent, #f0a500, transparent)' }} />
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #0a0f1e)', border: '2px solid #f0a500', boxShadow: '0 0 30px rgba(240,165,0,0.4), 0 0 60px rgba(240,165,0,0.1)' }}>
              <Shield className="w-10 h-10 animate-pulse-subtle" style={{ color: '#f0a500' }} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-widest uppercase mb-1 gradient-text drop-shadow-md">
            SECURE SYNC
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: '#64748b' }}>
            Evidence & Asset Management System
          </p>
          <div className="mt-3 h-px mx-auto w-32 relative overflow-hidden" style={{ background: 'rgba(240,165,0,0.2)' }}>
            <div className="absolute inset-0 w-1/2 h-full" style={{ background: 'linear-gradient(90deg, transparent, #f0a500, transparent)', animation: 'shimmer 2s infinite linear' }} />
          </div>
        </div>

        {/* Login Card - Flat and highly clickable */}
        <div
          className="relative rounded-2xl p-8"
          style={{
            background: 'rgba(13, 27, 42, 0.85)',
            border: '1px solid rgba(240, 165, 0, 0.3)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(240,165,0,0.05)',
          }}>

          <div className="flex items-center gap-2 mb-6">
            <ScanLine className="w-5 h-5 animate-pulse-subtle" style={{ color: '#f0a500' }} />
            <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: '#94a3b8' }}>
              Identity Verification
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm animate-shake"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#64748b' }}>
                Badge Number
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. PD-8821"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                style={{
                  background: 'rgba(3, 7, 18, 0.6)',
                  border: badge ? '1px solid rgba(240,165,0,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                  boxShadow: badge ? '0 0 12px rgba(240,165,0,0.15) inset' : 'none'
                }}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#64748b' }}>
                Access Code
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: 'rgba(3, 7, 18, 0.6)',
                    border: password ? '1px solid rgba(240,165,0,0.6)' : '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                    boxShadow: password ? '0 0 12px rgba(240,165,0,0.15) inset' : 'none'
                  }}
                  required
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded transition-colors"
                  style={{ color: '#64748b' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm tracking-widest uppercase transition-all relative overflow-hidden group hover:brightness-110 active:scale-[0.98]"
              style={{
                background: loading ? 'rgba(240,165,0,0.3)' : 'linear-gradient(135deg, #f0a500, #d97706)',
                color: '#030712',
                boxShadow: loading ? 'none' : '0 0 24px rgba(240,165,0,0.3)',
              }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)', animation: 'shimmer 2s infinite' }} />
              {loading ? (
                <span className="flex items-center justify-center gap-2 relative z-10">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeLinecap="round" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 relative z-10">
                  <Shield className="w-4 h-4" /> Authenticate & Enter
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs" style={{ color: '#475569' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ boxShadow: '0 0 8px #10b981' }} />
            <span>Secure End-to-End Encryption Enabled</span>
          </div>
        </div>

        {/* Warning footer */}
        <p className="text-center text-[10px] mt-6 tracking-widest uppercase" style={{ color: '#1e3a5f' }}>
          UNAUTHORIZED ACCESS IS PUNISHABLE UNDER PENAL CODE §66C
        </p>
      </div>
    </div>
  );
};
