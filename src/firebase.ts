/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc,
  updateDoc, 
  query, 
  where,
  getDoc
} from 'firebase/firestore';
import { Student, Course, AttendanceSession, AttendanceRecord, Lecturer, CourseRep } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Detect if Firebase is fully provisioned or running on placeholders
export const isMockFirebase = !firebaseConfig || firebaseConfig.apiKey === 'mock-api-key';

let app;
let db: any;

if (!isMockFirebase) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Failed to initialize cloud Firebase, defaulting to Offline Sandbox Mode", error);
  }
}

// Global Operation Logger error handles
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'anonymous'
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// DB Collections Accessors
export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
}

let syncStatusListeners: ((status: SyncStatus) => void)[] = [];

export function getSyncStatus(): SyncStatus {
  const pending = getPendingRecords();
  return {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: pending.length,
    lastSyncedAt: localStorage.getItem('coou_last_synced_at'),
  };
}

export function subscribeToSyncStatus(listener: (status: SyncStatus) => void) {
  syncStatusListeners.push(listener);
  listener(getSyncStatus());
  return () => {
    syncStatusListeners = syncStatusListeners.filter(l => l !== listener);
  };
}

function notifySyncStatusChange() {
  const status = getSyncStatus();
  syncStatusListeners.forEach(l => l(status));
}

function getPendingRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem('coou_pending_records');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function savePendingRecords(records: AttendanceRecord[]) {
  try {
    localStorage.setItem('coou_pending_records', JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save pending records to localStorage', err);
  }
}

export async function syncPendingRecordsToDb(): Promise<void> {
  if (isMockFirebase || !db) {
    return;
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  const pending = getPendingRecords();
  if (pending.length === 0) {
    return;
  }

  console.log(`[Sync Engine] Found ${pending.length} unsynced attendance records. Attempting sync...`);
  
  const remaining: AttendanceRecord[] = [];
  
  for (const record of pending) {
    try {
      const { id, ...data } = record;
      await setDoc(doc(db, 'records', id), data);
      console.log(`[Sync Engine] Successfully synced record: ${id}`);
    } catch (err) {
      console.error(`[Sync Engine] Sync failed for record: ${record.id}`, err);
      remaining.push(record);
    }
  }

  savePendingRecords(remaining);
  localStorage.setItem('coou_last_synced_at', new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  notifySyncStatusChange();
}

// Global window event listeners (if in browser)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync Engine] Device went online. Running sync...');
    notifySyncStatusChange();
    syncPendingRecordsToDb();
  });

  window.addEventListener('offline', () => {
    console.log('[Sync Engine] Device went offline.');
    notifySyncStatusChange();
  });

  // Background retry sync check every 15 seconds
  setInterval(() => {
    syncPendingRecordsToDb();
  }, 15000);
}

export async function getStudentsFromDb(): Promise<Student[]> {
  const raw = localStorage.getItem('coou_students');
  const localCache = raw ? JSON.parse(raw) : [];

  if (isMockFirebase || !db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return localCache;
  }
  try {
    const snap = await getDocs(collection(db, 'students'));
    const students = snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
    localStorage.setItem('coou_students', JSON.stringify(students));
    return students;
  } catch (err) {
    console.warn('[Sync Engine] Failed to fetch students, using cache:', err);
    return localCache;
  }
}

export async function saveStudentToDb(student: Student): Promise<void> {
  const current = await getStudentsFromDb();
  const updated = [...current.filter(s => s.id !== student.id), student];
  localStorage.setItem('coou_students', JSON.stringify(updated));

  if (isMockFirebase || !db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return;
  }
  try {
    const { id, ...data } = student;
    await setDoc(doc(db, 'students', id), data);
  } catch (err) {
    console.error('[Sync Engine] Failed to save student to cloud', err);
  }
}

export async function deleteStudentFromDb(studentId: string): Promise<void> {
  const current = await getStudentsFromDb();
  const updated = current.filter(s => s.id !== studentId);
  localStorage.setItem('coou_students', JSON.stringify(updated));

  if (isMockFirebase || !db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return;
  }
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'students', studentId));
  } catch (err) {
    console.error('[Sync Engine] Failed To delete student from cloud', err);
  }
}

export async function getCoursesFromDb(): Promise<Course[]> {
  const raw = localStorage.getItem('coou_courses');
  const localCache = raw ? JSON.parse(raw) : [];

  if (isMockFirebase || !db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return localCache;
  }
  try {
    const snap = await getDocs(collection(db, 'courses'));
    const courses = snap.docs.map(d => ({ code: d.id, ...d.data() } as any));
    localStorage.setItem('coou_courses', JSON.stringify(courses));
    return courses;
  } catch (err) {
    console.warn('[Sync Engine] Failed to fetch courses, using cache:', err);
    return localCache;
  }
}

export async function saveCourseToDb(course: Course): Promise<void> {
  const current = await getCoursesFromDb();
  const updated = [...current.filter(c => c.code !== course.code), course];
  localStorage.setItem('coou_courses', JSON.stringify(updated));

  if (isMockFirebase || !db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return;
  }
  try {
    const { code, ...data } = course;
    await setDoc(doc(db, 'courses', code), data);
  } catch (err) {
    console.error('[Sync Engine] Failed to save course to cloud', err);
  }
}

export async function getSessionsFromDb(): Promise<AttendanceSession[]> {
  const raw = localStorage.getItem('coou_sessions');
  const localCache = raw ? JSON.parse(raw) : [];

  if (isMockFirebase || !db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return localCache;
  }
  try {
    const snap = await getDocs(collection(db, 'sessions'));
    const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceSession));
    localStorage.setItem('coou_sessions', JSON.stringify(sessions));
    return sessions;
  } catch (err) {
    console.warn('[Sync Engine] Failed to fetch sessions, using cache:', err);
    return localCache;
  }
}

export async function saveSessionToDb(session: AttendanceSession): Promise<void> {
  const current = await getSessionsFromDb();
  const updated = [...current.filter(s => s.id !== session.id), session];
  localStorage.setItem('coou_sessions', JSON.stringify(updated));

  if (isMockFirebase || !db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return;
  }
  try {
    const { id, ...data } = session;
    await setDoc(doc(db, 'sessions', id), data);
  } catch (err) {
    console.error('[Sync Engine] Failed to save session to cloud', err);
  }
}

export async function getRecordsFromDb(): Promise<AttendanceRecord[]> {
  const raw = localStorage.getItem('coou_records');
  const localRecords: AttendanceRecord[] = raw ? JSON.parse(raw) : [];

  if (isMockFirebase || !db) {
    return localRecords;
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return localRecords;
  }

  try {
    const snap = await getDocs(collection(db, 'records'));
    const cloudRecords = snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord));
    
    const pending = getPendingRecords();
    const mergedMap = new Map<string, AttendanceRecord>();
    cloudRecords.forEach(r => mergedMap.set(r.id, r));
    pending.forEach(r => mergedMap.set(r.id, r));

    const mergedRecords = Array.from(mergedMap.values());
    mergedRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    localStorage.setItem('coou_records', JSON.stringify(mergedRecords));
    return mergedRecords;
  } catch (err) {
    console.warn('[Sync Engine] Failed to fetch records, using cache:', err);
    return localRecords;
  }
}

export async function saveRecordToDb(record: AttendanceRecord): Promise<void> {
  const currentLocal = await getRecordsFromDb();
  const updatedLocal = [record, ...currentLocal.filter(r => r.id !== record.id)];
  localStorage.setItem('coou_records', JSON.stringify(updatedLocal));

  if (isMockFirebase || !db) {
    return;
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.warn('[Sync Engine] Offline. Queueing record for auto-sync.');
    const pending = getPendingRecords();
    const updatedPending = [record, ...pending.filter(r => r.id !== record.id)];
    savePendingRecords(updatedPending);
    notifySyncStatusChange();
    return;
  }

  try {
    const { id, ...data } = record;
    await setDoc(doc(db, 'records', id), data);
    console.log('[Sync Engine] Successfully saved record to Cloud Firestore.');
  } catch (err) {
    console.warn('[Sync Engine] Writing to Cloud failed. Enqueueing...', err);
    const pending = getPendingRecords();
    const updatedPending = [record, ...pending.filter(r => r.id !== record.id)];
    savePendingRecords(updatedPending);
    notifySyncStatusChange();
  }
}
