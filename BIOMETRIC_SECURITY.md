# 🔐 Secure Facial Recognition & Biometric Attendance Architecture
## Chukwuemeka Odumegwu Ojukwu University (COOU) Secure Node

This document outlines the secure architecture, cryptography templates, anti-spoofing shields, and file hierarchies engineered to integrate biometric student facial verification with absolute integrity, audit logging, rate-limiting, and privacy protection.

---

## 📂 System Folder Structure & Target Architecture

```text
├── .env.example                  # Environment blueprint defines GEMINI_API_KEY (server-side secret)
├── package.json                  # Native dependency declaration with Vite, React 19, and @google/genai SDK
├── server.ts                     # Full-stack Custom Express Server (handles secure model-side matching & anti-spoofing)
├── firestore.rules               # Strict Firestore security controls asserting authorized reader/writer boundaries
├── src/
│   ├── App.tsx                   # Main React entry point coordinating synchronized states (Students, Sessions, Records)
│   ├── types.ts                  # Shared model signatures (Student, AttendanceRecord, CampusLocations, AuditLogs)
│   ├── firebase.ts               # Local-to-Cloud sync engine handling offline-first local cache queues
│   ├── data.ts                   # Static mock rosters, distance math (Haversine Formula) & dynamic OTP algorithms
│   ├── index.css                 # Custom display pairings (Inter & JetBrains Mono) with custom Tailwind components
│   ├── components/
│   │   ├── StudentPortal.tsx     # Student scan client UI, randomized liveness challenges, and consent controls
│   │   ├── LecturerDashboard.tsx # Lecturer attendance tracking, real-time sync markers & CSV signature auditing
│   │   ├── AdminDashboard.tsx    # Administrative biometric key purging, course assignments & course rep logs
│   │   ├── Navbar.tsx            # Navigation layout coordinating institutional branding contextually
│   │   └── AuthGate.tsx          # Dual-factor passcode verification for representatives, lecturers & admins
│   └── utils/
│       └── security.ts           # Pure-math static template hashing, client-side Rate Limiter, and liveness states
```

---

## 🔒 1. Student Registration & Face Enrollment

### Architectural Safeguards:
1. **Consent Gatekeeping**: Students must explicitly check the **Biometric Terms of Service Consent** checkbox before the high-definition webcam lens activates.
2. **Immediate Mathematical Tokenization**:
   - Biometric capturing converts visual face vectors into standard decimal coordinates (68-point landmarks) *directly on client-side RAM*.
   - If **Strong Template Encryption (GDPR/BIPA)** is enabled, the system automatically runs the descriptors through `hashBiometricTemplate(descriptors)` to produce a hashed, salt-encoded metadata token.
   - **No Raw JPEG/PNG Storage**: Raw face photographs are immediately stripped from device RAM and are never transmitted to static database records unless requested. Only the encrypted mathematical descriptor matrix is archived.

---

## 📸 2. Attendance Check-In with Liveness Defenses

To combat photo presentations, tablet screen replays, and video spoofs, COOU's secure terminal employs a **Hybrid Liveness Shield**:

### A. Randomized Liveness Gaze Challenge
When the student starts checking in, the interface generates a randomized challenge:
- **Challenge Type `blink`**: *"LIVENESS SHIELD CHALLENGE: Please blink your eyes now to ensure human presence!"*
- **Challenge Type `tilt_left`**: *"LIVENESS SHIELD CHALLENGE: Please tilt your head slightly LEFT to capture depth parallax!"*
- **Challenge Type `smile`**: *"LIVENESS SHIELD CHALLENGE: Please smile briefly to verify live muscular micro-expressions!"*

The terminal's webcam reticle displays an overlay instructing the user to perform this task. Verification is gated behind successful completion.

### B. Machine Vision Presentation-Attack Gating (PAD)
During the transmission payload phase, our Gemini-powered multimodal vision network analyzes the webcam frame for classic screen reproduction anomalies:
- Hand boundaries or tablet edges framing the person's face.
- Reflections, screen flares, and glowing glare hotspots representing tablet/phone glass sheets.
- Scanning for flat matte paper textures or physical print edges.
- Rejecting visible Moiré patterns and pixel cluster grids from high-density screen replays.

---

## 🛡️ 3. Server-Side Verification Pipeline (`/api/facial-recognition-match`)

All biometric verification undergoes mandatory **Server-Side Enforcement** over a secure Node context inside `server.ts`:
- **API Secret Insulation**: The `GEMINI_API_KEY` is lazily initialized on the backend. This key is completely invisible to client-side browsers, eliminating visual exposure.
- **Multimodal Visual Analysis**:
  ```ts
  // Construct a strict multi-image visual proof check
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: contents, // contains candidate face templates and raw webcam feed
    config: { responseMimeType: 'application/json', temperature: 0.1 }
  });
  ```
- **Anti-Spoofing Rule**: If the AI detects a presentation spoofing indicator, it sets `"match": false` and asserts `"message": "Anti-Spoofing Shield: Spoofing attempt detected"`.

---

## ⚡ 4. Cryptographic Temp Storage & Rate Limiting

### Rate Limiting
To block bots, replay scripts, and database-flooding scanning attacks, `SecureRateLimiter.checkLimit(studentId)` implements token-bucket rate limiting on the client:
- Limits matching queries to **3 matching scans per 30 seconds**.
- An active lock triggers a cooldown screen, showing: `BIOMETRIC REPLAY BLOCK: Rate Limit Exceeded. Cooldown active for X seconds.`

---

## 📊 5. Audit Logging & Attendance History

### Log Tracking
Every verification attempt is dynamically captured with hardware metadata and localized inside the Student Portal's HUD panel:
- **`SUCCESS`**: True biometric matches write check-in coordinates to local records and Firestore.
- **`MISMATCH`**: Landmark deviation creates a warning log.
- **`FAILED`**: Triggers full failure diagnostics, logged inside the security log panel.

Each log captures:
- Name & Matriculation registration number.
- Verified timestamp.
- Dynamic challenge indicator applied (e.g. `blink`).
- User-Agent client device signature hash.

---

## 📱 6. Multi-Device Responsive Support

- **Browser Webcams**: Employs standard `getUserMedia` video streams, offering full support on mobile Safari (iOS) and Google Chrome (Android).
- **GPU Acceleration**: Facial landmark detection runs asynchronously inside the local browser thread via mobile-friendly neural network subsets (`ssdMobilenetv1`).
