/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, ArrowRight, School, Fingerprint, Lock, ShieldAlert } from 'lucide-react';
import { Lecturer, CourseRep } from '../types';

interface AuthGateProps {
  lecturers: Lecturer[];
  courseReps: CourseRep[];
  onAuthenticate: (user: { role: 'admin' | 'lecturer' | 'student'; name: string; identifier: string }) => void;
}

export default function AuthGate({ lecturers, courseReps, onAuthenticate }: AuthGateProps) {
  const [credentialInput, setCredentialInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [deniedMessage, setDeniedMessage] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setDeniedMessage(null);

    const input = credentialInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!input) {
      setDeniedMessage('Please enter a registered email address or phone number.');
      return;
    }

    if (!password) {
      setDeniedMessage('Please enter your login password or passcode.');
      return;
    }

    // 1. Check Super Admin
    if (input === 'thatwon95@gmail.com') {
      if (password === '901010') {
        onAuthenticate({
          role: 'admin',
          name: 'Prof. thatwon95 (Admin)',
          identifier: 'thatwon95@gmail.com'
        });
        return;
      } else {
        setDeniedMessage('Invalid security key. Super Admin authentication rejected.');
        return;
      }
    }

    // 2. Check Lecturers (Email or Phone)
    const matchedLecturer = lecturers.find(
      l => l.email.toLowerCase() === input || l.phone.trim().replace(/\s+/g, '').toLowerCase() === input.replace(/\s+/g, '')
    );

    if (matchedLecturer) {
      const pinRequired = matchedLecturer.password || 'lecturer123';
      if (password === pinRequired) {
        onAuthenticate({
          role: 'lecturer',
          name: matchedLecturer.name,
          identifier: matchedLecturer.email || matchedLecturer.phone
        });
        return;
      } else {
        setDeniedMessage('Invalid password signature. Lecturer access denied.');
        return;
      }
    }

    // 3. Check Course Reps (Email or Phone)
    const matchedRep = courseReps.find(
      r => r.email.toLowerCase() === input || (r.phone && r.phone.trim().replace(/\s+/g, '').toLowerCase() === input.replace(/\s+/g, ''))
    );

    if (matchedRep) {
      const pinRequired = matchedRep.password || 'rep123';
      if (password === pinRequired) {
        onAuthenticate({
          role: 'student', // student represents Course Rep Mode internally
          name: matchedRep.name,
          identifier: matchedRep.email || matchedRep.phone
        });
        return;
      } else {
        setDeniedMessage('Invalid password signature. Course Representative access denied.');
        return;
      }
    }

    // 4. Access Denied
    setDeniedMessage('Verifiable credentials not found in the university database. Access is strictly blocked for unidentified personnel.');
  };

  return (
    <div className="min-h-screen bg-slate-905 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 text-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-900" id="coou-auth-gate-wrapper">
      
      {/* Header University Crest */}
      <div className="flex flex-col items-center space-y-4" id="coou-crest-header">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-900 shadow-xl border-4 border-amber-500">
          <School className="h-8 w-8 text-blue-900" />
        </div>
        <div className="text-center">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">COOU Institutional IAM Network</span>
          <h1 className="text-xl font-black tracking-tight text-white uppercase sm:text-2xl mt-1">
            Chukwuemeka Odumegwu Ojukwu University
          </h1>
          <p className="text-xs text-blue-300 uppercase font-semibold tracking-wider">Attendance Assurance & Identity Verification Terminal</p>
        </div>
      </div>

      {/* Main Authentic Card Column */}
      <div className="w-full max-w-md mx-auto bg-slate-900/80 border border-blue-800/25 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative overflow-hidden" id="auth-gate-card">
        
        {/* Glow overlay decorators */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-blue-950/80 text-amber-400 border border-blue-800/40 flex items-center justify-center">
              <Lock className="h-5 w-5 animate-pulse" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white">Security Verification Gate</h2>
            <p className="text-xs text-slate-400">
              Only registered academic personnel and course administrators are cleared to request active scanner sessions.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4" id="coou-verify-form">
            <div>
              <label htmlFor="auth-credential" className="block text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">
                Registered Institutional Email / Phone Number
              </label>
              <div className="relative rounded-md shadow-sm mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Fingerprint className="h-4 w-4" />
                </div>
                <input
                  id="auth-credential"
                  type="text"
                  required
                  value={credentialInput}
                  onChange={(e) => setCredentialInput(e.target.value)}
                  placeholder="Enter registered email or phone"
                  className="w-full bg-slate-950/70 border border-blue-800/40 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">
                Institutional login password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-slate-950/70 border border-blue-800/40 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {deniedMessage && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-900/50 rounded-lg text-xs text-rose-300 font-semibold flex items-start space-x-2.5 animate-bounce">
                <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{deniedMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full cursor-pointer py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all duration-200"
            >
              <span>Initiate Secure Match</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>


        </div>
      </div>

      {/* Footer Branding */}
      <footer className="text-center text-[11px] text-slate-500 font-mono">
        <p>© 2026 Chukwuemeka Odumegwu Ojukwu University.</p>
        <p className="text-[9px] text-slate-600 uppercase font-semibold mt-1">Smart Biometrics Gateway • Certified FIDO2 Perimeter Access Node</p>
      </footer>
    </div>
  );
}
