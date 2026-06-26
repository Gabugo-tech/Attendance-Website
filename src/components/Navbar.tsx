/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { School, User, ClipboardList, ShieldAlert, Wifi, LogOut } from 'lucide-react';

export interface AuthUser {
  role: 'admin' | 'lecturer' | 'student';
  name: string;
  identifier: string;
}

interface NavbarProps {
  currentRole: 'student' | 'lecturer' | 'admin';
  onRoleChange: (role: 'student' | 'lecturer' | 'admin') => void;
  onlineCount: number;
  authUser: AuthUser | null;
  onSignOut: () => void;
}

export default function Navbar({ currentRole, onRoleChange, onlineCount, authUser, onSignOut }: NavbarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Nigerian time is UTC + 1
      const localTime = new Date(now.getTime() + (now.getTimezoneOffset() + 60) * 60000);
      
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      };
      setCurrentTime(localTime.toLocaleString('en-US', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-amber-500 bg-blue-900 text-white backdrop-blur shadow-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* University Brand Logo & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-900 shadow-md">
            <School className="h-6 w-6 text-blue-900" id="coou-logo-icon" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">COOU System</span>
            <h1 className="text-sm font-bold tracking-tight text-white sm:text-base uppercase leading-tight">
              Chukwuemeka Odumegwu Ojukwu University
            </h1>
            <p className="hidden text-[10px] text-blue-200 uppercase font-semibold tracking-wider sm:block leading-none mt-0.5">Attendance & Biometric Verification System</p>
          </div>
        </div>

        {/* Live Clock & Server Indicator */}
        <div className="hidden items-center space-x-4 md:flex">
          <div className="flex items-center space-x-1.5 rounded bg-blue-800/80 px-2.5 py-1 text-xs border border-blue-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="text-blue-100 text-[11px] font-mono font-medium">{currentTime}</span>
          </div>

          <div className="flex items-center space-x-1 rounded bg-blue-800/80 px-2.5 py-1 text-xs border border-blue-700 text-amber-400">
            <Wifi className="h-3.5 w-3.5" />
            <span className="font-mono text-[10px] font-semibold">{onlineCount} Active Scanner Nodes</span>
          </div>
        </div>

        {/* Authorized Mode Display with Integrated Logout Button */}
        <div className="flex items-center space-x-2 animate-fade-in">
          {authUser ? (
            <div className="flex items-center space-x-2.5 bg-blue-950/60 border border-blue-800 px-3 py-1.5 rounded-lg">
              <div className="text-right hidden sm:block">
                <span className="block text-[8px] font-black uppercase text-amber-400 tracking-wider leading-none">
                  {authUser.role === 'admin' ? 'Super Admin' : authUser.role === 'lecturer' ? 'Lecturer' : 'Course Rep'}
                </span>
                <span className="block text-[11px] font-extrabold text-white truncate max-w-[140px] leading-tight">
                  {authUser.name}
                </span>
              </div>
              
              <div className="inline-flex rounded bg-blue-900 p-0.5 border border-blue-800">
                {authUser.role === 'admin' ? (
                  <div className="flex items-center space-x-1">
                    <button
                      id="admin-view-student-btn"
                      onClick={() => onRoleChange('student')}
                      className={`flex items-center space-x-1.5 rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition-all ${
                        currentRole === 'student'
                          ? 'bg-amber-500 text-slate-900 shadow-md font-extrabold'
                          : 'text-blue-200 hover:text-white hover:bg-blue-800/40'
                      }`}
                      title="Switch to Course Rep view"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Rep Mode</span>
                    </button>
                    <button
                      id="admin-view-lecturer-btn"
                      onClick={() => onRoleChange('lecturer')}
                      className={`flex items-center space-x-1.5 rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition-all ${
                        currentRole === 'lecturer'
                          ? 'bg-amber-500 text-slate-900 shadow-md font-extrabold'
                          : 'text-blue-200 hover:text-white hover:bg-blue-800/40'
                      }`}
                      title="Switch to Lecturer view"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Lecturer</span>
                    </button>
                    <button
                      id="admin-view-admin-btn"
                      onClick={() => onRoleChange('admin')}
                      className={`flex items-center space-x-1.5 rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition-all ${
                        currentRole === 'admin'
                          ? 'bg-amber-500 text-slate-900 shadow-md font-extrabold'
                          : 'text-blue-200 hover:text-white hover:bg-blue-800/40'
                      }`}
                      title="Switch to Admin Dashboard"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Admin</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {authUser.role === 'student' && (
                      <div className="flex items-center space-x-1.5 rounded bg-amber-500 text-slate-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                        <User className="h-3.5 w-3.5 animate-pulse" />
                        <span>Course Rep</span>
                      </div>
                    )}
                    {authUser.role === 'lecturer' && (
                      <div className="flex items-center space-x-1.5 rounded bg-amber-500 text-slate-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                        <ClipboardList className="h-3.5 w-3.5 animate-pulse" />
                        <span>Lecturer</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <button
                id="sign-out-btn"
                onClick={onSignOut}
                className="p-1.5 rounded bg-rose-955/40 hover:bg-rose-900 hover:text-white border border-rose-800 text-rose-200 transition-all cursor-pointer flex items-center justify-center"
                title="Sign Out of Portal"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-blue-200 uppercase font-bold tracking-widest px-2">
              🔒 Portal Locked
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
