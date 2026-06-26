# COOU Biometric Face-Recognition Attendance System Integration Guide

This guide details the setup and configuration of the advanced face-recognition attendance system for Chukwuemeka Odumegwu Ojukwu University (COOU). It includes details for face-api.js weights, deep links to your Firebase Console, Cloud Function setup, and front-end liveness detection configuration.

---

## 1. Firebase Console Deep Links

Access and monitor your Firestore Database and Firebase Cloud Functions directly using these pre-configured links:

*   **Firebase Storage Console**: [Open Firebase Storage](https://console.firebase.google.com/project/f0168a7c-a113-4237-ad13-9d3ceaf9439e/storage/buckets)
*   **Firestore Database Viewer**: [Open Firestore Database (default)](https://console.firebase.google.com/project/f0168a7c-a113-4237-ad13-9d3ceaf9439e/firestore/databases/(default)/data)
*   **Firebase Functions Dashboard**: [Open Cloud Functions Dashboard](https://console.firebase.google.com/project/f0168a7c-a113-4237-ad13-9d3ceaf9439e/functions/list)
*   **General Firebase Console**: [Open Firebase General Dashboard](https://console.firebase.google.com/project/f0168a7c-a113-4237-ad13-9d3ceaf9439e/)

---

## 2. Face API Neural Network Weights Setup

`face-api.js` relies on pre-trained TensorFlow.js models which must be hosted and loaded at runtime.

### How to obtain the model weight files:
1.  Visit the official face-api.js models repository weights folder: [https://github.com/justadudewhohacks/face-api.js/tree/master/weights](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)
2.  Download the following core model weights and their shard chunks (save them in a folder called `models` in your public hosting directory or Firebase Storage bucket):
    *   **SSD MobileNet V1** (Face Detection):
        *   `ssd_mobilenetv1_model-weights_manifest.json`
        *   `ssd_mobilenetv1_model-shard1`
        *   `ssd_mobilenetv1_model-shard2`
    *   **Face Landmark 68** (Facial Landmarks/Blinking Detection):
        *   `face_landmark_68_model-weights_manifest.json`
        *   `face_landmark_68_model-shard1`
    *   **Face Recognition Model** (Feature Descriptor Generation):
        *   `face_recognition_model-weights_manifest.json`
        *   `face_recognition_model-shard1`
3.  Place these models inside your React application's `/public/models/` folder. The frontend script will make clean HTTP GET requests to load these models on startup.

---

## 3. Deployment Configuration

### Cloud Function Deployment
1.  Navigate to `/face-recognition-assets/cloud-function/`.
2.  Run `npm install` to download required node modules.
3.  Deploy the function to your Firebase project:
    ```bash
    firebase deploy --only functions
    ```

### Standalone Web Page Deploy
1.  Serve `attendance.html` and `attendance.js` on HTTPS (required by browsers for `navigator.mediaDevices.getUserMedia` video stream access).
2.  Be sure to configure authorized domain redirects inside Firebase Authentication to permit OAuth/login popups.

---

## 4. Anti-Spoofing & Liveness Detection

To prevent spoofing via standard high-resolution portraits, the front-end has been configured with an **eye-blink visual check**:
*   The `face-api.js` 68-point landmark extractor continuously computes the **Eye Aspect Ratio (EAR)** for both left and right eyes.
*   Once an eye blink is successfully verified (EAR drops below the 0.22 threshold and rises back), the frontend registers a positive liveness check.
*   Only after the liveness check changes to verified is the 128-dimensional biometric descriptor captured and uploaded to the Firebase Cloud Function.
