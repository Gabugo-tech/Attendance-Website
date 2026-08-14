# 🔐 Biometric Facial Recognition & Liveness Defense Architecture
## Chukwuemeka Odumegwu Ojukwu University (COOU) Secure Node

This specification defines the production-grade facial recognition pipeline, mathematical transformations, vector database indexing, anti-spoofing shields, and GDPR/CCPA privacy compliance implemented across the COOU Attendance System.

---

## 🏛️ 1. Architecture Matrix: Open-Source vs Commercial / Cloud Alternatives

| Pipeline Stage | Open-Source Tool / Model | Commercial / Cloud Alternative | COOU Implementation |
| :--- | :--- | :--- | :--- |
| **Face Detection** | RetinaFace / MediaPipe | AWS Rekognition / Google Vision | **RetinaFace / MediaPipe 5-Point Mesh** with noise background discard |
| **Feature Extraction** | ArcFace / DeepFace | Azure Face API / AWS Rekognition | **ArcFace 512-Dimensional** normalized embeddings on Unit Hypersphere |
| **Vector Database** | Milvus / Qdrant / Pinecone | AWS OpenSearch / SingleStore | **Cosine Similarity $\frac{A \cdot B}{\|A\|_2 \|B\|_2}$ Vector Index** |
| **Backend & ML Ops** | FastAPI / Docker / Triton Server | Google Vertex AI / AWS SageMaker | **Express + TypeScript Engine** with Gemini Multimodal PAD Verification |
| **Anti-Spoofing (PAD)** | Silent-Face-Anti-Spoofing / MiniFASNet | FaceTec / ID R&D | **Dual Active + Passive Anti-Spoofing Liveness Shield** |
| **Data Privacy & Vault** | Web Crypto AES-256-GCM | HashiCorp Vault / AWS KMS | **AES-256-GCM Authenticated Encryption & GDPR Tokenizer** |

---

## 📐 2. Step-by-Step Implementation Guide

### Step 1: Detect and Crop the Face (RetinaFace / MediaPipe)
1. Detect face bounding box $[x, y, w, h]$ and 5 key anatomical facial landmarks:
   - **Left Eye Center** $(x_{le}, y_{le})$
   - **Right Eye Center** $(x_{re}, y_{re})$
   - **Nose Tip** $(x_{nt}, y_{nt})$
   - **Left Mouth Corner** $(x_{lm}, y_{lm})$
   - **Right Mouth Corner** $(x_{rm}, y_{rm})$
2. Discard unneeded background elements and noisy peripheral pixels to focus purely on facial geometry.

### Step 2: Normalize and Align (2D Affine Transformation)
Faces captured in live webcam streams are rarely perfectly level or upright. An affine transformation is computed using eye coordinates:
1. **Rotation Angle**:
   $$\theta = \operatorname{atan2}(y_{re} - y_{le}, x_{re} - x_{le})$$
2. **Inter-Ocular Distance (IOD)**:
   $$D = \sqrt{(x_{re} - x_{le})^2 + (y_{re} - y_{le})^2}$$
3. **Canonical Alignment**: Rotates and scales the face canvas so eyes are placed horizontally on canonical baseline coordinates $(x_1 = 0.35W, y_1 = 0.40H)$ and $(x_2 = 0.65W, y_2 = 0.40H)$ at standard ArcFace resolution (224x224 px).

### Step 3: Generate 512-Dimensional Face Embeddings (ArcFace)
The aligned and normalized face image is mapped into a deep feature space via the **ArcFace (Additive Angular Margin Loss)** neural network:
1. Generates a dense, continuous high-dimensional vector:
   $$\mathbf{V} = [v_1, v_2, v_3, \dots, v_{512}] \in \mathbb{R}^{512}$$
2. **$L_2$ Normalization onto Unit Hypersphere**:
   $$\hat{\mathbf{V}} = \frac{\mathbf{V}}{\|\mathbf{V}\|_2} = \frac{\mathbf{V}}{\sqrt{\sum_{i=1}^{512} v_i^2}}, \quad \text{such that } \|\hat{\mathbf{V}}\|_2 = 1.000$$

### Step 4: Vector Search and Matching (Milvus / Qdrant / Cosine Similarity)
1. **Cosine Similarity Formula**:
   $$\text{Cosine Similarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\|_2 \|\mathbf{B}\|_2} = \sum_{i=1}^{512} A_i B_i$$
2. **Euclidean Distance Relation**:
   $$d(\mathbf{A}, \mathbf{B}) = \sqrt{\sum_{i=1}^{512} (A_i - B_i)^2} = \sqrt{2 - 2 \cdot \text{CosineSimilarity}(\mathbf{A}, \mathbf{B})}$$
3. **Verification Decision**: Match is approved if and only if:
   $$\text{Cosine Similarity}(\mathbf{A}, \mathbf{B}) \ge \tau \quad (\tau = 0.85 \text{ or } 85.0\%)$$

---

## 🛡️ 3. Liveness Detection & Anti-Spoofing (PAD)

### A. Active Liveness Detection (Challenge-Response)
The system prompts the user to perform randomized, timed micro-actions to verify physical presence:
- **`BLINK`**: Real-time Eye Aspect Ratio (EAR) dip detection.
- **`SMILE`**: Lip corner displacement and micro-expression expansion.
- **`TURN_LEFT` / `TURN_RIGHT`**: Head yaw rotation ($\pm 15^\circ$) verifying 3D depth parallax.

### B. Passive Liveness Detection (AI Texture & Moiré Analysis)
- **Moiré Frequency Grid Detection**: 2D Fourier / Laplacian frequency analysis detecting digital LCD/OLED subpixel grids (tablets, smartphones, laptop screen replays).
- **Specular Reflection & Glare Analysis**: Detects flat glass screen flares and reflections.
- **2D Paper Flatness vs 3D Facial Depth**: Evaluates surface normal gradients to differentiate printed photo cutouts from live human skin subsurface scattering.

---

## 🔒 4. Data Privacy and Security Compliance (GDPR / CCPA / BIPA)

1. **Encryption in Transit & at Rest**:
   - TLS 1.3 encryption for all biometric vector payloads.
   - **AES-256-GCM** authenticated client/server encryption with PBKDF2 salt and random 96-bit IVs.
2. **Pseudonymous Anonymization**:
   - Biometric vectors are isolated from Personal Identifiable Information (PII) using pseudonymous token IDs (`bio_token_<hash>`).
   - Face embeddings are strictly one-way mathematical hashes; raw facial vectors cannot be reconstructed back into photographic portraits.
3. **GDPR Article 17 "Right to be Forgotten"**:
   - Instant cryptographic wipe and zeroization of enrolled biometric vectors and verification logs upon student request.

---

## 💻 5. Production Code Reference

The full pipeline is implemented in:
- `/src/utils/biometricEngine.ts`: RetinaFace 5-point extraction, Affine alignment, ArcFace 512D hypersphere embeddings, Cosine Similarity, and Active/Passive Liveness.
- `/src/utils/security.ts`: Rate limiting and token hashing.
- `/server.ts`: Multimodal PAD Presentation Attack Detection verification API.
- `/src/components/StudentPortal.tsx`: Interactive biometric camera HUD, real-time telemetry, and enrollment flow.
