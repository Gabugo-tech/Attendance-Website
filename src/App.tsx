/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import StudentPortal from './components/StudentPortal';
import LecturerDashboard from './components/LecturerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthGate from './components/AuthGate';
import { Student, Course, AttendanceSession, AttendanceRecord, Lecturer, CourseRep, VerificationAuditLog } from './types';
import { SEED_STUDENTS, SEED_COURSES, generateSeedSessionsAndRecords } from './data';
import { ShieldAlert, BookOpen, Fingerprint, Award, CheckSquare, HelpCircle, Loader2 } from 'lucide-react';
import { 
  getStudentsFromDb, 
  saveStudentToDb, 
  getCoursesFromDb, 
  saveCourseToDb, 
  getSessionsFromDb, 
  saveSessionToDb, 
  getRecordsFromDb, 
  saveRecordToDb,
  deleteStudentFromDb,
  isMockFirebase,
  subscribeToSyncStatus,
  SyncStatus
} from './firebase';

export default function App() {
  const [authUser, setAuthUser] = useState<{ role: 'admin' | 'lecturer' | 'student'; name: string; identifier: string } | null>(() => {
    try {
      const saved = localStorage.getItem('coou_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState<'student' | 'lecturer' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem('coou_auth_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.role;
      }
    } catch (e) {}
    return 'student';
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [courseReps, setCourseReps] = useState<CourseRep[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(142); 
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    pendingCount: 0,
    lastSyncedAt: null
  });

  const [auditLogs, setAuditLogs] = useState<VerificationAuditLog[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('coou_verification_audit_logs');
      if (stored) {
        setAuditLogs(JSON.parse(stored));
      } else {
        const initialAuditLogs: VerificationAuditLog[] = [
          {
            id: 'log-1',
            timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
            studentName: 'Chidi Okafor',
            studentIdOrReg: '2021024001',
            scanType: 'FACIAL',
            status: 'SUCCESS',
            challengeAction: 'Blink Check Passed'
          },
          {
            id: 'log-2',
            timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
            studentName: 'Unknown Candidate',
            studentIdOrReg: 'N/A',
            scanType: 'FACIAL',
            status: 'MISMATCH',
            errorMessage: 'Database signature mismatch (96% landmark variation)',
            challengeAction: 'Tilt Check Failed'
          },
          {
            id: 'log-3',
            timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
            studentName: 'Nkemdilim Udene',
            studentIdOrReg: '2021024005',
            scanType: 'PASSKEY',
            status: 'SUCCESS',
            challengeAction: 'Passkey Signed'
          },
          {
            id: 'log-4',
            timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
            studentName: 'Amadi Benson',
            studentIdOrReg: '2021024002',
            scanType: 'FINGERPRINT',
            status: 'FAILED',
            errorMessage: 'Rate limited (60s security cooling active)',
            challengeAction: 'Sensor Blocked'
          },
          {
            id: 'log-5',
            timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
            studentName: 'Chidi Okafor',
            studentIdOrReg: '2021024001',
            scanType: 'FINGERPRINT',
            status: 'SUCCESS',
            challengeAction: 'Biometric Match Confirmed'
          }
        ];
        setAuditLogs(initialAuditLogs);
        localStorage.setItem('coou_verification_audit_logs', JSON.stringify(initialAuditLogs));
      }
    } catch (e) {
      console.warn("Storage restricted or unavailable:", e);
    }
  }, []);

  const handleAddAuditLog = (log: Omit<VerificationAuditLog, 'id' | 'timestamp'>) => {
    const newLog: VerificationAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      try {
        localStorage.setItem('coou_verification_audit_logs', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  useEffect(() => {
    return subscribeToSyncStatus((status) => {
      setSyncStatus(status);
    });
  }, []);

  // Initialize and load from Firebase Database on load (with localStorage sandbox fallback)
  useEffect(() => {
    const loadData = async () => {
      try {
        setDbLoading(true);
        let fbStudents = await getStudentsFromDb();
        let fbCourses = await getCoursesFromDb();
        let fbSessions = await getSessionsFromDb();
        let fbRecords = await getRecordsFromDb();

        if (fbStudents.length === 0 && fbCourses.length === 0) {
          // Dynamic database seeding for immediate deployment readiness
          const seedData = generateSeedSessionsAndRecords();
          
          for (const s of SEED_STUDENTS) {
            await saveStudentToDb(s);
          }
          for (const c of SEED_COURSES) {
            await saveCourseToDb(c);
          }
          for (const s of seedData.sessions) {
            await saveSessionToDb(s);
          }
          for (const r of seedData.records) {
            await saveRecordToDb(r);
          }

          fbStudents = SEED_STUDENTS;
          fbCourses = SEED_COURSES;
          fbSessions = seedData.sessions;
          fbRecords = seedData.records;
        }

        setStudents(fbStudents);
        setCourses(fbCourses);
        setSessions(fbSessions);
        setRecords(fbRecords);
        setOnlineCount(142 + fbStudents.length);
      } catch (err) {
        console.error("Critical database loader failure, fallback triggered:", err);
      } finally {
        setDbLoading(false);
      }
    };

    try {
      const storedLecturers = localStorage.getItem('coou_lecturers');
      const storedCourseReps = localStorage.getItem('coou_course_reps');

      if (storedLecturers) {
        setLecturers(JSON.parse(storedLecturers));
      } else {
        const initialLecturers: Lecturer[] = [
          {
            id: 'lec-1',
            name: 'Dr. Charles O. Adesina',
            employeeId: 'COOU-LEC-101',
            department: 'Computer Science',
            email: 'c.adesina@coou.edu.ng',
            phone: '+234 803 123 4567',
            dateRegistered: '03 Jun 2026',
            password: 'lecturer123'
          },
          {
            id: 'lec-2',
            name: 'Engr. Prof. Edwin S. Obiorah',
            employeeId: 'COOU-LEC-102',
            department: 'Computer Science',
            email: 'e.obiorah@coou.edu.ng',
            phone: '+234 805 765 4321',
            dateRegistered: '04 Jun 2026',
            password: 'lecturer123'
          }
        ];
        setLecturers(initialLecturers);
        localStorage.setItem('coou_lecturers', JSON.stringify(initialLecturers));
      }

      if (storedCourseReps) {
        setCourseReps(JSON.parse(storedCourseReps));
      } else {
        const initialCourseReps: CourseRep[] = [
          {
            id: 'rep-1',
            name: 'Kenechukwu David',
            regNo: '2021024501',
            department: 'Computer Science',
            email: 'k.david@student.coou.edu.ng',
            phone: '+234 812 345 6789',
            level: '400 Level',
            assignedCourseCode: 'COOU-CSC 104',
            dateRegistered: '05 Jun 2026',
            password: 'rep123'
          }
        ];
        setCourseReps(initialCourseReps);
        localStorage.setItem('coou_course_reps', JSON.stringify(initialCourseReps));
      }
    } catch (e) {
      console.warn("Local storage restricted:", e);
    }

    loadData();
  }, []);

  // Student registration controller
  const handleRegisterStudent = async (newStudent: Student) => {
    const updated = [...students, newStudent];
    setStudents(updated);
    setOnlineCount(prev => prev + 1);
    try {
      await saveStudentToDb(newStudent);
    } catch (e) {
      console.error("Failed to register student to database", e);
    }
  };

  // Student deletion controller
  const handleDeleteStudent = async (studentId: string) => {
    const updated = students.filter(s => s.id !== studentId);
    setStudents(updated);
    setOnlineCount(prev => Math.max(142, prev - 1));
    try {
      await deleteStudentFromDb(studentId);
    } catch (e) {
      console.error("Failed to delete student from database", e);
    }
  };

  // Student update controller
  const handleUpdateStudent = async (updatedStudent: Student) => {
    const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(updated);
    try {
      await saveStudentToDb(updatedStudent);
    } catch (e) {
      console.error("Failed to update student in database", e);
    }
  };

  // Student mark attendance log controller
  const handleMarkAttendance = async (newRecord: AttendanceRecord) => {
    // Prevent duplicate entries for same session and student
    const exists = records.some(
      r => r.studentId === newRecord.studentId && r.sessionId === newRecord.sessionId
    );
    if (exists) return;

    // Enforce single attendance per day per course
    const todayYMD = new Date().toISOString().split('T')[0];
    const hasAlreadyAttendedToday = records.some(r => {
      const recordYMD = r.timestamp.split('T')[0];
      return r.studentId === newRecord.studentId && 
             r.courseCode === newRecord.courseCode && 
             recordYMD === todayYMD;
    });

    if (hasAlreadyAttendedToday) {
      throw new Error(`Daily course gating restriction lock: You have already marked attendance for ${newRecord.courseCode} today.`);
    }

    const updated = [newRecord, ...records];
    setRecords(updated);
    try {
      await saveRecordToDb(newRecord);
    } catch (e) {
      console.error("Failed to mark attendance in database", e);
    }
  };

  // Start course session controller
  const handleStartSession = async (newSession: AttendanceSession) => {
    // Shut down previous active sessions of the same course
    const shutDownPrevious = sessions.map(s => {
      if (s.courseCode === newSession.courseCode && s.isActive) {
        const closed = { ...s, isActive: false, endTime: new Date().toTimeString().slice(0, 5) };
        saveSessionToDb(closed).catch(console.error);
        return closed;
      }
      return s;
    });

    const updated = [newSession, ...shutDownPrevious];
    setSessions(updated);
    try {
      await saveSessionToDb(newSession);
    } catch (e) {
      console.error("Failed to start session in database", e);
    }
  };

  // Stop course session controller
  const handleStopSession = async (sessionId: string) => {
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        const closed = { ...s, isActive: false, endTime: new Date().toTimeString().slice(0, 5) };
        saveSessionToDb(closed).catch(console.error);
        return closed;
      }
      return s;
    });
    setSessions(updated);
  };

  // Lecturer enrollment controllers
  const handleRegisterLecturer = (newLec: Lecturer) => {
    const updated = [...lecturers, newLec];
    setLecturers(updated);
    try {
      localStorage.setItem('coou_lecturers', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLecturer = (id: string) => {
    const updated = lecturers.filter(l => l.id !== id);
    setLecturers(updated);
    try {
      localStorage.setItem('coou_lecturers', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Course Rep enrollment controllers
  const handleRegisterCourseRep = (newRep: CourseRep) => {
    const updated = [...courseReps, newRep];
    setCourseReps(updated);
    try {
      localStorage.setItem('coou_course_reps', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCourseRep = (id: string) => {
    const updated = courseReps.filter(r => r.id !== id);
    setCourseReps(updated);
    try {
      localStorage.setItem('coou_course_reps', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuthenticate = (user: { role: 'admin' | 'lecturer' | 'student'; name: string; identifier: string }) => {
    setAuthUser(user);
    setCurrentRole(user.role);
    try {
      localStorage.setItem('coou_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = () => {
    setAuthUser(null);
    try {
      localStorage.removeItem('coou_auth_user');
    } catch (e) {
      console.error(e);
    }
  };

  if (!authUser) {
    return (
      <AuthGate 
        lecturers={lecturers} 
        courseReps={courseReps} 
        onAuthenticate={handleAuthenticate} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-900" id="coou-app-root">
      
      {/* Header Banner Header */}
      <Navbar 
        currentRole={currentRole} 
        onRoleChange={setCurrentRole} 
        onlineCount={onlineCount} 
        authUser={authUser}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 pb-12">
        
        {/* HERO TITLE MODULE BAR - INTENTIONAL PAIRINGS & HIGHEST AESTHETICS */}
        <section className="relative mx-auto max-w-7xl px-4 pt-8 md:px-6 lg:px-8" id="coou-hero-header">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 border border-blue-800/20 p-6 md:p-8 shadow-xl">
            
            {/* Ambient gold laser line effects overlay */}
            <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 left-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-1.5 rounded bg-blue-500/15 px-3 py-1 text-xs border border-blue-500/25 text-blue-200">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold tracking-wide uppercase font-mono">FIDO2 SECURED • INSTITUTIONAL ATTENDANCE PERIMETER</span>
              </div>

              <h2 className="text-2xl font-black md:text-3xl tracking-tight text-white uppercase">
                COOU Attendance <span className="text-amber-400">Assurance</span> Terminal
              </h2>

              <p className="text-xs md:text-sm text-slate-200 leading-relaxed max-w-2xl">
                Welcome to the official Smart Student Attendance system of <strong className="text-amber-200">Chukwuemeka Odumegwu Ojukwu University</strong>. 
                Our platform enforces high-fidelity biometric safeguards via <strong>live webcam facial scanning</strong> combined with 
                <strong>restricted campus GPS boundaries</strong>. Access is strictly authorized for internal <strong>Lecturers and Course Representatives</strong> 
                to coordinate verified student gating and completely eliminate proxy check-ins and student impersonation.
              </p>

              {/* Campus Bullet Tags */}
              <div className="flex max-w-lg pt-2 text-[10px] uppercase font-mono font-bold text-blue-300">
                <div className="flex items-center space-x-2 bg-blue-950/80 px-3.5 py-2 rounded-lg border border-amber-500/30">
                  <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 animate-ping" />
                  <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 absolute" />
                  <span className="text-white font-black tracking-wider">ULI CAMPUS (COMPUTER SCIENCE DEPT)</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CORE INTERACTIVE STAGES ROLE BASED SWITCHER */}
        <section className="relative overflow-hidden w-full">
          <AnimatePresence mode="wait">
            {currentRole === 'student' && (authUser?.role === 'student' || authUser?.role === 'admin') ? (
              <motion.div
                key="student-portal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <StudentPortal 
                  students={students}
                  onRegisterStudent={handleRegisterStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onUpdateStudent={handleUpdateStudent}
                  activeSessions={sessions}
                  onMarkAttendance={handleMarkAttendance}
                  courses={courses}
                  records={records}
                  onAddAuditLog={handleAddAuditLog}
                  lecturers={lecturers}
                />
              </motion.div>
            ) : currentRole === 'lecturer' && (authUser?.role === 'lecturer' || authUser?.role === 'admin') ? (
              <motion.div
                key="lecturer-dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <LecturerDashboard 
                  students={students}
                  courses={courses}
                  activeSessions={sessions}
                  onStartSession={handleStartSession}
                  onStopSession={handleStopSession}
                  records={records}
                />
              </motion.div>
            ) : currentRole === 'admin' && authUser?.role === 'admin' ? (
              <motion.div
                key="admin-dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <AdminDashboard
                  courses={courses}
                  lecturers={lecturers}
                  onRegisterLecturer={handleRegisterLecturer}
                  onDeleteLecturer={handleDeleteLecturer}
                  courseReps={courseReps}
                  onRegisterCourseRep={handleRegisterCourseRep}
                  onDeleteCourseRep={handleDeleteCourseRep}
                  auditLogs={auditLogs}
                />
              </motion.div>
            ) : (
              <motion.div
                key="privilege-violation-warning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4"
                id="privilege-violation-warning"
              >
                <div className="h-16 w-16 bg-red-100 text-red-900 rounded-full flex items-center justify-center mx-auto shadow border border-red-200">
                  <ShieldAlert className="h-8 w-8 text-red-900" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider text-rose-800">Role Privilege Boundary Violation</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Security level mismatch. Your current registered IAM credential under <strong className="text-slate-800">"{authUser?.identifier}"</strong> is not authorized 
                  to explore pages outside of its certified boundary.
                </p>
                <button
                  onClick={handleSignOut}
                  className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg border border-amber-200 transition"
                >
                  Return & Use Another Identity
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* HELPFUL WALKTROUGH/GUIDELINE BLOCK */}
        <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 mt-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-900 flex items-center space-x-2">
              <HelpCircle className="h-4.5 w-4.5" />
              <span>Biometric Simulation Sandbox Testing Instructions</span>
            </h3>
            
            <div className="grid gap-4 md:grid-cols-3 text-xs leading-relaxed text-slate-500">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">Step 1: Open Lecturer Portal</span>
                <p>
                  Click <strong>Lecturer Mode</strong> in the top-right. Choose a course (e.g. <em>CSC 411 - Compiler Design</em>) with coordinates set strictly on <em>Uli Campus</em>, and launch the portal. This displays a rotating secure 6-digit OTP passcode and live screen QR terminal.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">Step 2: Enroll student & capture face</span>
                <p>
                  Switch back to <strong>Course Rep Mode</strong>. Click <strong>"Register Profile"</strong> in the top-right to register a real student with an instant photo. Choose the active course session, then trigger the secure <strong>Biometric Facial Auto-Scan</strong> to check in.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">Step 3: Monitor Live Lecturer Reports</span>
                <p>
                  Flip back to <strong>Lecturer Mode</strong>. Watch verified check-ins populating the real-time grid immediately with exact verified biometric tag profiles, and click <strong>"Export COOU Spreadsheet"</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Elegant Standard humble footer */}
      <footer className="border-t border-slate-200 bg-slate-100 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-1">
          <p>© 2026 Chukwuemeka Odumegwu Ojukwu University. All Rights Reserved.</p>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Smart Attendance Verification Assurance Terminal // Secure Sandbox Enclave Mode v4.92</p>
        </div>
      </footer>

      {/* Dynamic Offline / Auto-Sync Indicator Panel */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-xs sm:max-w-sm pointer-events-none" id="coou-sync-indicator-wrapper">
        {!syncStatus.isOnline ? (
          <div className="pointer-events-auto flex items-center space-x-2.5 rounded-xl bg-slate-900 border border-amber-500/40 px-4 py-3 text-white shadow-2xl animate-pulse">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
            </span>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-wider text-amber-400 leading-none">Offline Mode Enabled</p>
              <p className="text-[10px] text-slate-300 font-semibold mt-1 leading-tight">
                {syncStatus.pendingCount > 0 
                  ? `Caching ${syncStatus.pendingCount} record(s) locally.`
                  : "All records cached. Auto-sync triggers when online."}
              </p>
            </div>
          </div>
        ) : syncStatus.pendingCount > 0 ? (
          <div className="pointer-events-auto flex items-center space-x-2.5 rounded-xl bg-slate-900 border border-green-500/35 px-4 py-3 text-white shadow-2xl">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent shrink-0" />
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-wider text-green-400 leading-none">Syncing Data...</p>
              <p className="text-[10px] text-slate-300 font-semibold mt-1 leading-tight">
                Transferring {syncStatus.pendingCount} buffered record(s) to cloud-secure database.
              </p>
            </div>
          </div>
        ) : syncStatus.lastSyncedAt ? (
          <div className="pointer-events-auto flex items-center space-x-1.5 rounded bg-slate-900/90 border border-emerald-500/20 px-2.5 py-1 text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[9px] font-mono text-slate-300 select-none">
              Synced: {syncStatus.lastSyncedAt}
            </span>
          </div>
        ) : null}
      </div>

    </div>
  );
}
