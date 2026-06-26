/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lecturer, CourseRep, Course, VerificationAuditLog } from '../types';
import { UserCheck, Users, PlusCircle, Trash2, Mail, Phone, BookOpen, ShieldCheck, GraduationCap, Award, Calendar } from 'lucide-react';

interface AdminDashboardProps {
  courses: Course[];
  lecturers: Lecturer[];
  onRegisterLecturer: (lecturer: Lecturer) => void;
  onDeleteLecturer: (id: string) => void;
  courseReps: CourseRep[];
  onRegisterCourseRep: (courseRep: CourseRep) => void;
  onDeleteCourseRep: (id: string) => void;
  auditLogs?: VerificationAuditLog[];
}

export default function AdminDashboard({
  courses,
  lecturers,
  onRegisterLecturer,
  onDeleteLecturer,
  courseReps,
  onRegisterCourseRep,
  onDeleteCourseRep,
  auditLogs = []
}: AdminDashboardProps) {
  // Lecturer Form States
  const [lecName, setLecName] = useState('');
  const [lecId, setLecId] = useState('');
  const [lecEmail, setLecEmail] = useState('');
  const [lecPhone, setLecPhone] = useState('');
  const [lecPassword, setLecPassword] = useState('');
  
  // Course Rep Form States
  const [repName, setRepName] = useState('');
  const [repRegNo, setRepRegNo] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repLevel, setRepLevel] = useState('400 Level');
  const [repCourse, setRepCourse] = useState('');
  const [repPassword, setRepPassword] = useState('');

  // Active view toggle: 'lecturers' | 'reps' | 'audit_logs'
  const [activeTab, setActiveTab] = useState<'lecturers' | 'reps' | 'audit_logs'>('lecturers');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Deletion confirmations
  const [deletingLecturer, setDeletingLecturer] = useState<Lecturer | null>(null);
  const [deletingCourseRep, setDeletingCourseRep] = useState<CourseRep | null>(null);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCreateLecturer = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!lecName || !lecId || !lecEmail) {
      setErrorMessage('Full Name, Employee ID, and Email are required.');
      return;
    }

    // Detect duplicate employee ID
    if (lecturers.some(l => l.employeeId.toLowerCase() === lecId.toLowerCase())) {
      setErrorMessage(`Lecturer with ID ${lecId} already exists.`);
      return;
    }

    const newLec: Lecturer = {
      id: `lec-${Date.now()}`,
      name: lecName,
      employeeId: lecId.toUpperCase(),
      department: 'Computer Science',
      email: lecEmail,
      phone: lecPhone || 'N/A',
      dateRegistered: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      password: lecPassword || 'lecturer123'
    };

    onRegisterLecturer(newLec);
    setSuccessMessage(`Lecturer ${lecName} registered successfully!`);
    
    // Reset form
    setLecName('');
    setLecId('');
    setLecEmail('');
    setLecPhone('');
    setLecPassword('');
  };

  const handleCreateCourseRep = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!repName || !repRegNo || !repEmail || !repCourse) {
      setErrorMessage('Please fill in all required fields, including assigning a course.');
      return;
    }

    // Detect duplicate registration number
    if (courseReps.some(r => r.regNo === repRegNo)) {
      setErrorMessage(`Course Representative with Reg No ${repRegNo} is already registered.`);
      return;
    }

    const newRep: CourseRep = {
      id: `rep-${Date.now()}`,
      name: repName,
      regNo: repRegNo,
      department: 'Computer Science',
      email: repEmail,
      phone: repPhone || 'N/A',
      level: repLevel,
      assignedCourseCode: repCourse,
      dateRegistered: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      password: repPassword || 'rep123'
    };

    onRegisterCourseRep(newRep);
    setSuccessMessage(`Course Representative ${repName} assigned and registered!`);

    // Reset form
    setRepName('');
    setRepRegNo('');
    setRepEmail('');
    setRepPhone('');
    setRepCourse('');
    setRepPassword('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6" id="admin-dashboard-container">
      
      {/* Upper Status Banner */}
      <div className="bg-blue-900/5 border border-blue-900/10 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold shadow">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider">Super Administrator Enclave</h3>
            <p className="text-[11px] text-slate-500 font-medium">Campus: <strong className="text-slate-800">Uli Campus (Computer Science Dept ONLY)</strong></p>
          </div>
        </div>
        
        {/* Statistics Widgets */}
        <div className="flex space-x-6">
          <div className="text-right">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Lecturers Registered</span>
            <span className="text-lg font-black text-blue-900 font-mono leading-none">{lecturers.length}</span>
          </div>
          <div className="border-l border-slate-200 pl-6 text-right">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Course Reps Active</span>
            <span className="text-lg font-black text-amber-600 font-mono leading-none">{courseReps.length}</span>
          </div>
        </div>
      </div>

      {/* Alert Panels */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center space-x-2"
          >
            <span>❌</span>
            <span className="flex-1">{errorMessage}</span>
            <button onClick={clearMessages} className="hover:underline text-[10px] text-rose-500 uppercase font-bold">dismiss</button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center space-x-2 animate-pulse"
          >
            <span>✓</span>
            <span className="flex-1">{successMessage}</span>
            <button onClick={clearMessages} className="hover:underline text-[10px] text-emerald-500 uppercase font-bold">dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Registration Enrolment Forms */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Form Toggle Selection Headers */}
          <div className="bg-white rounded-xl border border-slate-200 p-1 flex shadow-sm gap-1 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => { setActiveTab('lecturers'); clearMessages(); }}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-lg flex items-center justify-center space-x-1 transition min-h-[32px] ${
                activeTab === 'lecturers' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Users className="h-3 w-3" />
              <span>Enroll Lecturer</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('reps'); clearMessages(); }}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-lg flex items-center justify-center space-x-1 transition min-h-[32px] ${
                activeTab === 'reps' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <UserCheck className="h-3 w-3" />
              <span>Enroll Rep</span>
            </button>

            <button
              onClick={() => { setActiveTab('audit_logs'); clearMessages(); }}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-lg flex items-center justify-center space-x-1 transition min-h-[32px] ${
                activeTab === 'audit_logs' ? 'bg-indigo-950 text-white shadow-sm border border-indigo-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="h-3 w-3 text-indigo-400" />
              <span>Audit Logs</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            {activeTab === 'lecturers' ? (
              // LECTURER REGISTRATION CARD
              <form onSubmit={handleCreateLecturer} className="space-y-4" id="admin-lec-form">
                <div className="border-b border-light-slate pb-2">
                  <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-widest">Lecturer Credentials</h4>
                  <p className="text-[11px] text-slate-400">Add an academic staff member to the Computer Science department.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name (including Title)</label>
                    <input
                      type="text"
                      required
                      value={lecName}
                      onChange={(e) => setLecName(e.target.value)}
                      placeholder="e.g. Prof. Chukwuemeka O. Okafor"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employee ID</label>
                      <input
                        type="text"
                        required
                        value={lecId}
                        onChange={(e) => setLecId(e.target.value)}
                        placeholder="e.g. COOU-LEC-109"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 font-mono uppercase focus:border-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                      <input
                        type="text"
                        readOnly
                        value="Computer Science"
                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-400 font-bold cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email representation</label>
                    <input
                      type="email"
                      required
                      value={lecEmail}
                      onChange={(e) => setLecEmail(e.target.value)}
                      placeholder="e.g. c.okafor@coou.edu.ng"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone number (Direct Line)</label>
                    <input
                      type="tel"
                      value={lecPhone}
                      onChange={(e) => setLecPhone(e.target.value)}
                      placeholder="e.g. +234 803 000 0000"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Login Password (Default: lecturer123)</label>
                    <input
                      type="password"
                      value={lecPassword}
                      onChange={(e) => setLecPassword(e.target.value)}
                      placeholder="Optional layout override passcode"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-extrabold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Register Lecturer</span>
                </button>
              </form>
            ) : activeTab === 'reps' ? (
              <form onSubmit={handleCreateCourseRep} className="space-y-4" id="admin-rep-form">
                <div className="border-b border-light-slate pb-2">
                  <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-widest">Course Representative</h4>
                  <p className="text-[11px] text-slate-400">Designate an authorized student coordinator for high-security biometrics.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Student Coordinator Name</label>
                    <input
                      type="text"
                      required
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      placeholder="e.g. Chinedu Eze"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reg Number</label>
                      <input
                        type="text"
                        required
                        value={repRegNo}
                        onChange={(e) => setRepRegNo(e.target.value)}
                        placeholder="e.g. 2021024340"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 font-mono focus:border-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Academic Level</label>
                      <select
                        value={repLevel}
                        onChange={(e) => setRepLevel(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                      >
                        <option value="100 Level">100 Level</option>
                        <option value="200 Level">200 Level</option>
                        <option value="300 Level">300 Level</option>
                        <option value="400 Level">400 Level</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Institutional Student Email</label>
                    <input
                      type="email"
                      required
                      value={repEmail}
                      onChange={(e) => setRepEmail(e.target.value)}
                      placeholder="e.g. c.eze@student.coou.edu.ng"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number (Direct Line)</label>
                    <input
                      type="tel"
                      value={repPhone}
                      onChange={(e) => setRepPhone(e.target.value)}
                      placeholder="e.g. +234 803 000 0000"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Course Code</label>
                    <select
                      required
                      value={repCourse}
                      onChange={(e) => setRepCourse(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    >
                      <option value="">-- Select Assignment Target --</option>
                      {courses.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Login Password (Default: rep123)</label>
                    <input
                      type="password"
                      value={repPassword}
                      onChange={(e) => setRepPassword(e.target.value)}
                      placeholder="Optional layout override passcode"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Register Course Rep</span>
                </button>
              </form>
            ) : (
              // BIOMETRIC SECURITY INSIGHT DIAGNOSTIC SCREEN
              <div className="space-y-4 font-sans text-xs">
                <div className="border-b border-light-slate pb-2">
                  <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest text-[11px] leading-tight">Biometric intelligence</h4>
                  <p className="text-[11px] text-zinc-400">Security event monitors and terminal log telemetry.</p>
                </div>
                
                <div className="space-y-2 bg-slate-950 text-slate-150 p-4 rounded-xl border border-slate-900 shadow-inner">
                  <div className="flex items-center justify-between border-b border-indigo-900/45 pb-2 mb-2">
                    <span className="text-[9px] text-indigo-400 font-mono font-black uppercase tracking-widest">Enforced Protocols</span>
                    <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-900 font-mono font-black px-1.5 py-0.5 rounded animate-pulse">FACIAL_OK</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] items-center">
                    <span className="text-zinc-500 font-bold uppercase tracking-wide text-[9px]">Verified Sign-Ins:</span>
                    <span className="text-emerald-400 font-black text-xs bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900">{auditLogs.filter(l => l.status === 'SUCCESS').length}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] items-center">
                    <span className="text-zinc-500 font-bold uppercase tracking-wide text-[9px]">Biometric Failures:</span>
                    <span className={`font-black text-xs bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900 ${auditLogs.filter(l => l.status !== 'SUCCESS').length > 0 ? 'text-rose-450 animate-pulse' : 'text-zinc-455'}`}>{auditLogs.filter(l => l.status !== 'SUCCESS').length}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100/60 font-sans text-[11px] text-indigo-850 space-y-1.5 flex flex-col">
                  <span className="font-extrabold uppercase tracking-widest text-[9px] text-indigo-900">Security Operations Desk:</span>
                  <span className="leading-relaxed font-semibold">
                    Liveness and facial mismatch filters guard against spoofing and deep-fake injection during roll enrollment and check-in. Failures lock the student terminal from marking attendance.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Roster Lists and Records */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm min-h-[480px] flex flex-col">
            
            {/* Headers for Lists */}
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  {activeTab === 'lecturers' ? 'Certified Departmental Lecturers' : activeTab === 'reps' ? 'Authorized Attendance Course Reps' : 'Comprehensive Biometric Audit Trail'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {activeTab === 'lecturers' ? 'Verifiable academic credentials eligible for COOU terminal orchestration.' : activeTab === 'reps' ? 'Course representative credentials authorized to create attendance sessions.' : 'Live security telemetry logs reporting liveness checks and presentation audits.'}
                </p>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black">ULI CAMPUS</span>
            </div>

            {/* List Body */}
            {activeTab === 'lecturers' ? (
              <div className="flex-1 mt-4 space-y-3 overflow-y-auto max-h-[430px] pr-1">
                {lecturers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400 space-y-2">
                    <GraduationCap className="h-10 w-10 text-slate-300" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Lecturers Enrolled</p>
                    <p className="text-[11px] max-w-xs">There are no academic staff members registered in local storage database currently.</p>
                  </div>
                ) : (
                  lecturers.map((lec) => (
                    <div 
                      key={lec.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 flex items-start justify-between transition-all"
                    >
                      <div className="flex items-start space-x-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-900 border border-blue-200 flex items-center justify-center shrink-0">
                          <span className="text-xs font-black uppercase">{lec.name.split(' ').pop()?.slice(0, 2) || 'Dr'}</span>
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-950 truncate leading-tight">{lec.name}</h5>
                          <span className="inline-block bg-blue-100/60 text-blue-850 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-1">
                            LEC ID: {lec.employeeId}
                          </span>
                          
                          <div className="flex flex-col sm:flex-row gap-x-3 gap-y-0.5 mt-2 text-[10px] text-slate-500">
                            <span className="flex items-center space-x-1 font-mono">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{lec.email}</span>
                            </span>
                            <span className="flex items-center space-x-1 font-mono">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span>{lec.phone}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch pl-2">
                        <button
                          onClick={() => setDeletingLecturer(lec)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition animate-pulse"
                          title="Revoke Credentials"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="text-[8px] text-slate-450 font-mono flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-slate-150">
                          <Calendar className="h-2 w-2 text-slate-400" />
                          <span>{lec.dateRegistered}</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : activeTab === 'reps' ? (
              <div className="flex-1 mt-4 space-y-3 overflow-y-auto max-h-[430px] pr-1">
                {courseReps.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400 space-y-2">
                    <UserCheck className="h-10 w-10 text-slate-300" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Course Reps Authorized</p>
                    <p className="text-[11px] max-w-xs font-bold">Enroll or select a course representative student to authorize active attendance lens creation.</p>
                  </div>
                ) : (
                  courseReps.map((rep) => (
                    <div 
                      key={rep.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 flex items-start justify-between transition-all"
                    >
                      <div className="flex items-start space-x-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                          <UserCheck className="h-4 w-4 text-amber-800" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h5 className="text-xs font-bold text-slate-950 truncate leading-tight">{rep.name}</h5>
                            <span className="text-[8px] bg-slate-205 text-slate-600 px-1 py-0.5 rounded font-bold font-semibold">{rep.level}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1.5">
                            <span className="bg-amber-100 text-amber-850 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-semibold">
                              REG: {rep.regNo}
                            </span>
                            <span className="font-mono text-[9px] text-slate-550 flex items-center space-x-1">
                              <BookOpen className="h-3 w-3 text-slate-400 shrink-0" />
                              <strong className="text-blue-900 font-extrabold">{rep.assignedCourseCode}</strong>
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-x-3 gap-y-0.5 mt-2 text-[10px] text-slate-500">
                            <span className="flex items-center space-x-1 font-mono">
                              <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                              <span className="truncate">{rep.email}</span>
                            </span>
                            <span className="flex items-center space-x-1 font-mono">
                              <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                              <span>{rep.phone || 'N/A'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch pl-2">
                        <button
                          onClick={() => setDeletingCourseRep(rep)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition animate-pulse"
                          title="Revoke Assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="text-[8px] text-slate-450 font-mono flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-slate-150">
                          <Calendar className="h-2 w-2 text-slate-400" />
                          <span>{rep.dateRegistered}</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex-1 mt-4 space-y-3 overflow-y-auto max-h-[430px] pr-1">
                {auditLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400 space-y-2">
                    <ShieldCheck className="h-10 w-10 text-slate-300" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Security Logs Recorded</p>
                    <p className="text-[11px] max-w-xs font-medium">Verify human presence on biometric enclaves to generate chronologically ordered telemetry logs.</p>
                  </div>
                ) : (
                  [...auditLogs]
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((log) => {
                      const logTime = new Date(log.timestamp).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      });
                      
                      const isSuccess = log.status === 'SUCCESS';
                      const isMismatch = log.status === 'MISMATCH';
                      
                      return (
                        <div 
                          key={log.id}
                          className={`p-3 border flex items-start justify-between transition-all font-mono text-[9.5px] rounded-xl ${
                            isSuccess 
                              ? 'bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/70' 
                              : isMismatch 
                                ? 'bg-amber-50/40 border-amber-100 hover:bg-amber-50/70' 
                                : 'bg-red-50/40 border-red-105 hover:bg-red-50/70'
                          }`}
                        >
                          <div className="flex items-start space-x-3 min-w-0">
                            <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${
                              isSuccess 
                                ? 'bg-emerald-100/60 text-emerald-950 border-emerald-200' 
                                : isMismatch 
                                  ? 'bg-amber-100/60 text-amber-955 border-amber-200' 
                                  : 'bg-red-100/60 text-red-955 border-red-200'
                            }`}>
                              <ShieldCheck className={`h-4 w-4 ${isSuccess ? 'text-emerald-700' : isMismatch ? 'text-amber-700' : 'text-red-750'}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-sans font-black text-[11px] text-slate-900 truncate">
                                  {log.studentName}
                                </span>
                                <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black border uppercase ${
                                  isSuccess 
                                    ? 'bg-emerald-100/40 text-emerald-800 border-emerald-250' 
                                    : isMismatch 
                                      ? 'bg-amber-100/40 text-amber-800 border-amber-250' 
                                      : 'bg-red-100/40 text-red-800 border-red-250'
                                }`}>
                                  {log.status}
                                </span>
                              </div>
                              
                              <p className="text-[10px] text-zinc-500 font-semibold font-sans mt-1">
                                {isSuccess 
                                  ? 'Handshake authenticated & student presence confirmed' 
                                  : log.errorMessage || 'Neural biometric alignment mismatch'}
                              </p>
                              
                              <div className="flex items-center space-x-3 text-[8.5px] text-zinc-400 font-bold mt-1">
                                <span>TYPE: {log.scanType || 'FACIAL'}</span>
                                <span>TIMESTAMP: {logTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ADMIN LECTURER DELETION CONFIRMATION WARNING MODAL */}
      <AnimatePresence>
        {deletingLecturer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingLecturer(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500 bg-white p-6 shadow-2xl z-10 space-y-4"
              id="delete-lecturer-warning-dialog"
            >
              <div className="flex items-center space-x-3 text-red-650 border-b border-slate-100 pb-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-650 shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-widest text-red-900 leading-tight">Revoke Lecturer Credentials?</h4>
                  <span className="text-[10px] font-mono uppercase text-red-500 font-bold">CRITICAL SYSTEM REVOCATION ACTION</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you absolutely sure you want to completely revoke credentials and delete the profile for lecturer <strong className="text-slate-950">{deletingLecturer.name}</strong> (LEC ID: {deletingLecturer.employeeId})?
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[11px] text-red-750 font-semibold space-y-1">
                <span className="block font-bold">⚠️ Warning Safety Notice:</span>
                <span className="block leading-relaxed">This lecturer will be locked out immediately and will lose complete authority to host sessions, rotate security tokens, or manage student check-ins.</span>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingLecturer(null)}
                  className="flex-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-black uppercase text-slate-700 py-2.5 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteLecturer(deletingLecturer.id);
                    setDeletingLecturer(null);
                  }}
                  id="confirm-delete-lecturer-btn"
                  className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-black uppercase text-white py-2.5 transition shadow"
                >
                  Revoke & Expunge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN COURSE REP DELETION CONFIRMATION WARNING MODAL */}
      <AnimatePresence>
        {deletingCourseRep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingCourseRep(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500 bg-white p-6 shadow-2xl z-10 space-y-4"
              id="delete-rep-warning-dialog"
            >
              <div className="flex items-center space-x-3 text-amber-650 border-b border-slate-100 pb-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-650 shrink-0">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-widest text-amber-900 leading-tight">Revoke Course Rep Access?</h4>
                  <span className="text-[10px] font-mono uppercase text-amber-600 font-bold">CRITICAL SECURE ACCESS DISMISSAL</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you absolutely sure you want to revoke authorized student-administrator role for <strong className="text-slate-950">{deletingCourseRep.name}</strong> (REG: {deletingCourseRep.regNo}) for assigned course <strong className="text-blue-900">{deletingCourseRep.assignedCourseCode}</strong>?
              </p>

              <div className="bg-amber-50 border border-amber-250 rounded-lg p-3 text-[11px] text-amber-800 font-semibold space-y-1">
                <span className="block font-bold">⚠️ Warning Safety Notice:</span>
                <span className="block leading-relaxed">The student will be demoted immediately and will lose physical and digital clearance to register student facials or coordinate smart webcam gateways.</span>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCourseRep(null)}
                  className="flex-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-black uppercase text-slate-700 py-2.5 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteCourseRep(deletingCourseRep.id);
                    setDeletingCourseRep(null);
                  }}
                  id="confirm-delete-rep-btn"
                  className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-xs font-black uppercase text-slate-950 py-2.5 transition shadow"
                >
                  Confirm Revocation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
