/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Course, AttendanceRecord, AttendanceSession } from './types';

// Pre-populated Courses at COOU
export const SEED_COURSES: Course[] = [
  {
    code: "CSC 411",
    title: "Compiler Construction & Formal Languages",
    department: "Computer Science",
    lecturerName: "Dr. Charles O. Adesina",
    semester: "First Semester",
    level: "400 Level",
    creditUnits: 3,
    academicSession: "2025/2026",
    status: "Compulsory",
    description: "Lexical analysis, syntax trees, grammars, parsing algorithms, and code generation.",
    dateAdded: "12 Oct 2025"
  },
  {
    code: "CSC 421",
    title: "Distributed Computing & Cloud Architectures",
    department: "Computer Science",
    lecturerName: "Engr. Prof. Edwin S. Obiorah",
    semester: "Second Semester",
    level: "400 Level",
    creditUnits: 3,
    academicSession: "2025/2026",
    status: "Compulsory",
    description: "Distributed consensus, concurrency, microservices, and serverless compute paradigms.",
    dateAdded: "15 Jan 2026"
  },
  {
    code: "GST 112",
    title: "Philosophy and Human Existence",
    department: "General Studies",
    lecturerName: "Dr. Charles O. Adesina",
    semester: "Second Semester",
    level: "100 Level",
    creditUnits: 2,
    academicSession: "2025/2026",
    status: "Compulsory",
    description: "Fundamental philosophical logic, human inquiry, reasoning, and institutional ethics.",
    dateAdded: "04 Feb 2026"
  },
  {
    code: "MTH 102",
    title: "Elementary Mathematics II",
    department: "Mathematics",
    lecturerName: "Prof. Augustine U. Nwosu",
    semester: "Second Semester",
    level: "100 Level",
    creditUnits: 3,
    academicSession: "2025/2026",
    status: "Compulsory",
    description: "Calculus integration techniques, differential equations, and coordinate geometry.",
    dateAdded: "04 Feb 2026"
  },
  {
    code: "COS 102",
    title: "Computer Science II",
    department: "Computer Science",
    lecturerName: "Dr. Mrs. Grace N. Okafor",
    semester: "Second Semester",
    level: "100 Level",
    creditUnits: 3,
    academicSession: "2025/2026",
    status: "Compulsory",
    description: "Structured problem solving, pointer mechanics, dynamic memory, and algorithms in C/C++.",
    dateAdded: "04 Feb 2026"
  },
  {
    code: "PHY 102",
    title: "General Physics II",
    department: "Physics",
    lecturerName: "Engr. Prof. Edwin S. Obiorah",
    semester: "Second Semester",
    level: "100 Level",
    creditUnits: 3,
    academicSession: "2025/2026",
    status: "Required",
    description: "Electromagnetism, capacitance, Gauss's law, circuit networks, and optics.",
    dateAdded: "04 Feb 2026"
  },
  {
    code: "PHY 108",
    title: "General Physics Laboratory II",
    department: "Physics",
    lecturerName: "Mrs. Chinwe E. Anyaegbunam",
    semester: "Second Semester",
    level: "100 Level",
    creditUnits: 1,
    academicSession: "2025/2026",
    status: "Required",
    description: "Hands-on empirical measurement experiments in electricity, magnetism, and optics.",
    dateAdded: "04 Feb 2026"
  },
  {
    code: "COOU-CSC 104",
    title: "Introduction to Computing Science",
    department: "Computer Science",
    lecturerName: "Dr. Charles O. Adesina",
    semester: "First Semester",
    level: "100 Level",
    creditUnits: 2,
    academicSession: "2025/2026",
    status: "Compulsory",
    description: "Foundational computer architecture, von Neumann models, logic gates, and software systems.",
    dateAdded: "10 Oct 2025"
  },
  {
    code: "COOU-CSC 128",
    title: "Fundamentals of Information Systems",
    department: "Computer Science",
    lecturerName: "Dr. Mrs. Grace N. Okafor",
    semester: "First Semester",
    level: "100 Level",
    creditUnits: 2,
    academicSession: "2025/2026",
    status: "Required",
    description: "Organizational data processing systems, relational structures, and enterprise IT flows.",
    dateAdded: "10 Oct 2025"
  },
  {
    code: "COOU-COS 192",
    title: "Computer Workshop & Practicals",
    department: "Computer Science",
    lecturerName: "Barr. Dr. Anthony C. Ojukwu",
    semester: "Second Semester",
    level: "100 Level",
    creditUnits: 2,
    academicSession: "2025/2026",
    status: "Compulsory",
    description: "Hardware assembly, motherboard diagnostics, OS installation, and basic network cabling.",
    dateAdded: "04 Feb 2026"
  },
  {
    code: "COOU-PHY 106",
    title: "Basic Thermal and Modern Physics",
    department: "Physics",
    lecturerName: "Engr. Prof. Edwin S. Obiorah",
    semester: "First Semester",
    level: "100 Level",
    creditUnits: 3,
    academicSession: "2025/2026",
    status: "Required",
    description: "Thermodynamics laws, kinetic molecular theory, entropy, and quantum radiation foundations.",
    dateAdded: "10 Oct 2025"
  },
  {
    code: "COOU-GEY 116",
    title: "Introduction to Geology II",
    department: "Geology",
    lecturerName: "Dr. Charles O. Adesina",
    semester: "Second Semester",
    level: "100 Level",
    creditUnits: 2,
    academicSession: "2025/2026",
    status: "Elective",
    description: "Stratigraphy, sedimentary basin analysis, mineral crystallography, and Nigerian geomorphology.",
    dateAdded: "04 Feb 2026"
  }
];

// Pre-populated Students at COOU
export const SEED_STUDENTS: Student[] = [
  {
    id: "std-1",
    name: "Anyigor Chinedu Samuel",
    regNo: "2021034012",
    department: "Computer Science",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop",
    registeredBiometrics: {
      face: true,
      fingerprint: true,
      devicePasskey: true
    },
    faceFingerprintHash: "hash_coou_921405",
    faceEncodings: [Array.from({ length: 128 }, () => Math.random() - 0.5)]
  },
  {
    id: "std-2",
    name: "Okafor Grace Chinonye",
    regNo: "2021034045",
    department: "Computer Science",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&h=250&fit=crop",
    registeredBiometrics: {
      face: true,
      fingerprint: true,
      devicePasskey: true
    },
    faceFingerprintHash: "hash_coou_538202",
    faceEncodings: [Array.from({ length: 128 }, () => Math.random() - 0.5)]
  },
  {
    id: "std-3",
    name: "Okonkwo Chukwuka David",
    regNo: "2021054088",
    department: "Physics",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&h=250&fit=crop",
    registeredBiometrics: {
      face: true,
      fingerprint: true,
      devicePasskey: true
    },
    faceFingerprintHash: "hash_coou_194723",
    faceEncodings: [Array.from({ length: 128 }, () => Math.random() - 0.5)]
  },
  {
    id: "std-4",
    name: "Ezeh Blessing Chioma",
    regNo: "2021084112",
    department: "Geology",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=250&h=250&fit=crop",
    registeredBiometrics: {
      face: true,
      fingerprint: true,
      devicePasskey: true
    },
    faceFingerprintHash: "hash_coou_410294",
    faceEncodings: [Array.from({ length: 128 }, () => Math.random() - 0.5)]
  },
  {
    id: "std-5",
    name: "Nnaji Ikechukwu Justin",
    regNo: "2021034199",
    department: "Computer Science",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&h=250&fit=crop",
    registeredBiometrics: {
      face: true,
      fingerprint: true,
      devicePasskey: true
    },
    faceFingerprintHash: "hash_coou_859203",
    faceEncodings: [Array.from({ length: 128 }, () => Math.random() - 0.5)]
  }
];

// Helper to generate seed sessions and simulation attendance logs from the last 7 days
export function generateSeedSessionsAndRecords(): { sessions: AttendanceSession[], records: AttendanceRecord[] } {
  const sessions: AttendanceSession[] = [];
  const records: AttendanceRecord[] = [];

  const now = new Date();

  // Create 5 completed sessions
  const pastSessionsData = [
    { offsetDays: 5, course: SEED_COURSES[0], startTime: "09:00", campus: "Uli Campus (Computer Science Dept)", lat: 5.7725, lon: 6.8778 },
    { offsetDays: 4, course: SEED_COURSES[1], startTime: "11:30", campus: "Uli Campus (Computer Science Dept)", lat: 5.7725, lon: 6.8778 },
    { offsetDays: 3, course: SEED_COURSES[2], startTime: "14:00", campus: "Uli Campus (Computer Science Dept)", lat: 5.7725, lon: 6.8778 },
    { offsetDays: 2, course: SEED_COURSES[3], startTime: "10:00", campus: "Uli Campus (Computer Science Dept)", lat: 5.7725, lon: 6.8778 },
    { offsetDays: 1, course: SEED_COURSES[4], startTime: "12:00", campus: "Uli Campus (Computer Science Dept)", lat: 5.7725, lon: 6.8778 }
  ];

  pastSessionsData.forEach((data, index) => {
    const sessionDate = new Date(now);
    sessionDate.setDate(now.getDate() - data.offsetDays);
    const dateStr = sessionDate.toISOString().split('T')[0];

    const sessionId = `ses-past-${index}`;
    const session: AttendanceSession = {
      id: sessionId,
      courseCode: data.course.code,
      date: dateStr,
      startTime: data.startTime,
      endTime: `${parseInt(data.startTime.split(':')[0]) + 2}:00`,
      secureToken: Math.floor(100000 + Math.random() * 900000).toString(),
      isActive: false,
      isCustomLocationLocked: true,
      latitude: data.lat,
      longitude: data.lon,
      radiusMeters: 500
    };
    sessions.push(session);

    // Generate records for students matching the course department or general computer science kids who take it
    SEED_STUDENTS.forEach((student) => {
      // 85% probability of attendance
      if (Math.random() < 0.85) {
        // Compute random timestamp within duration
        const recordTime = new Date(sessionDate);
        const startHour = parseInt(data.startTime.split(':')[0]);
        recordTime.setHours(startHour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

        const isLate = recordTime.getMinutes() > 20;

        records.push({
          id: `rec-${sessionId}-${student.id}`,
          sessionId,
          courseCode: data.course.code,
          studentId: student.id,
          studentName: student.name,
          regNo: student.regNo,
          department: student.department,
          timestamp: recordTime.toISOString(),
          biometricType: Math.random() > 0.5 ? 'facial_recognition' : 'fingerprint_scan',
          status: isLate ? 'late' : 'present',
          locationInfo: {
            campusName: data.campus,
            distanceMeters: Math.floor(Math.random() * 250),
            latitude: data.lat + (Math.random() - 0.5) * 0.001,
            longitude: data.lon + (Math.random() - 0.5) * 0.001,
            isWithinBounds: true
          },
          authSnapshot: student.photoUrl // Preloaded snapshot matching the student photo
        });
      }
    });
  });

  return { sessions, records };
}

// Haversine formula to compute distance in meters between two GPS coordinates
export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // In meters
}
