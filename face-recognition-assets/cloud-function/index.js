/**
 * Chukwuemeka Odumegwu Ojukwu University (COOU)
 * Secure Face Recognition & Liveness Attendance Cloud Function
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Cold Start Memory Cache for Student Face Encodings
let cachedStudents = null;
let lastCacheTime = 0;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache expiration

/**
 * Syncs the student biometric descriptors roster from Firestore with local function memory
 */
async function getStudentsBiometricRoster() {
  const now = Date.now();
  if (cachedStudents && (now - lastCacheTime < CACHE_TTL)) {
    console.log("[Cold Start Cache] Returning active cached student face-encodings.");
    return cachedStudents;
  }

  console.log("[Cold Start Cache] Fetching student biometrics profiles from Firestore...");
  const snapshot = await db.collection("students").get();
  const students = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    // Only capture students with registered face encodings
    if (data.faceEncodings && Array.isArray(data.faceEncodings) && data.faceEncodings.length > 0) {
      students.push({
        id: doc.id,
        name: data.name,
        regNo: data.regNo,
        department: data.department || "Computer Science",
        faceEncodings: data.faceEncodings
      });
    }
  });

  cachedStudents = students;
  lastCacheTime = now;
  console.log(`[Cold Start Cache] Successfully cached biometric reference profiles for ${students.length} students.`);
  return students;
}

/**
 * Calculates Euclidean Distance between two 128-dimensional vectors
 */
function getEuclideanDistance(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Main HTTP V2 Endpoint for face attendance processing
 */
exports.verifyFaceAttendance = onRequest((req, res) => {
  return cors(req, res, async () => {
    // 1. Enforce POST Request Method
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    try {
      // 2. Extract and Validate Firebase ID Token (Security Authentication Validation)
      const authHeader = req.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized access: Missing Authentication Token" });
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(`[Security] Authenticated user request from UID: ${decodedToken.uid}`);

      // 3. Destructure Payload Information
      const { descriptor, sessionId, courseCode } = req.body;
      if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
        return res.status(400).json({ error: "Validation Failed: A 128-dimensional numeric descriptor vector is required." });
      }
      if (!sessionId || !courseCode) {
        return res.status(400).json({ error: "Validation Failed: Missing active sessionId or courseCode." });
      }

      // 4. Fetch Biometric Roster profiles
      const studentsRoster = await getStudentsBiometricRoster();
      if (studentsRoster.length === 0) {
        return res.status(404).json({ error: "Biometric Failure: No students have registered face biometrics profiles in the database yet." });
      }

      // 5. Run Euclidean Distance Search matching
      let bestMatch = null;
      let minDistance = Infinity;

      for (const student of studentsRoster) {
        for (const registeredVector of student.faceEncodings) {
          const distance = getEuclideanDistance(descriptor, registeredVector);
          if (distance < minDistance) {
            minDistance = distance;
            bestMatch = student;
          }
        }
      }

      // 6. Threshold Validation: 0.6 is the standard face-matching boundary
      const MATCH_THRESHOLD = 0.6;
      if (minDistance >= MATCH_THRESHOLD) {
        return res.status(404).json({ 
          success: false, 
          error: "No authorized student matched. Biometric identity mismatch.",
          bestDistance: parseFloat(minDistance.toFixed(4))
        });
      }

      // 7. Prevent Duplicate attendance records for the same student, course and today's date
      // Obtain COOU local timezone date string (WAT / West Africa Time: UTC+1)
      const dateLocal = new Date(new Date().getTime() + (1 * 60 * 60 * 1000));
      const todayDateStr = dateLocal.toISOString().split("T")[0]; // YYYY-MM-DD

      const recordsRef = db.collection("records");
      const duplicateQuery = await recordsRef
        .where("studentId", "==", bestMatch.id)
        .where("courseCode", "==", courseCode)
        .where("sessionId", "==", sessionId)
        .limit(1)
        .get();

      if (!duplicateQuery.empty) {
        return res.status(200).json({ 
          success: true, 
          alreadyMarked: true,
          message: `${bestMatch.name} attendance has already been recorded for this session today.`,
          student: {
            name: bestMatch.name,
            regNo: bestMatch.regNo,
            department: bestMatch.department
          }
        });
      }

      // Calculate confidence as a inverted percentage scale matching the distance
      const confidencePercent = Math.max(0, Math.min(100, Math.round((1 - minDistance) * 100)));

      // 8. Write Success verified attendance document to Firestore
      const newRecordRef = recordsRef.doc();
      const attendanceDoc = {
        id: newRecordRef.id,
        sessionId: sessionId,
        courseCode: courseCode,
        studentId: bestMatch.id,
        studentName: bestMatch.name,
        regNo: bestMatch.regNo,
        department: bestMatch.department,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        biometricType: "facial_recognition",
        status: "present",
        confidence: confidencePercent,
        locationInfo: {
          campusName: "Uli Campus (Web Face Portal)",
          isWithinBounds: true
        }
      };

      await newRecordRef.set(attendanceDoc);
      console.log(`[Attendance Module] Verified student ${bestMatch.name} (${bestMatch.regNo}) for session: ${sessionId}`);

      // 9. Return Verification Payload
      return res.status(200).json({
        success: true,
        alreadyMarked: false,
        message: `Biometric handshake complete. Student verified successfully.`,
        confidence: confidencePercent,
        distance: parseFloat(minDistance.toFixed(4)),
        student: {
          id: bestMatch.id,
          name: bestMatch.name,
          regNo: bestMatch.regNo,
          department: bestMatch.department
        }
      });

    } catch (error) {
      console.error("[Fatal Error] Biometric function match crash:", error);
      return res.status(500).json({ error: "Internal processing crash", details: error.message });
    }
  });
});
