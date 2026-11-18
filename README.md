# 🏥 CareSync AI — Autonomous Hybrid-AI Clinical Triage & Emergency Command Ecosystem

> **Submitted to:** Google Firebase `#BuildHybridAI` Hackathon (Nov 2026)  
> **Core Architecture:** Firebase Hybrid AI (`PREFER_ON_DEVICE` Gemini Nano + Cloud Gemini 2.5 Flash) • Java 17 Spring Boot 3 (10 REST Controllers / 34 Enterprise Classes) • IndexedDB Offline Vault • Grounded WHO Clinical RAG • Pure-Java Predictive ML Algorithms

---

## 🎯 1. Executive Summary & Real-World Problem Statement

Every year, thousands of preventable pediatric and geriatric medical emergencies escalate because caregivers lack **instant, medically verified guidance during midnight home emergencies, rural network blackouts, or high-panic moments**.

**CareSync AI** solves this with a **Zero-Latency, Offline-First, 10-Module Enterprise Healthcare Ecosystem** built specifically for **Single Parents, Rural First Responders, and Vulnerable Age Groups (Child 0–12y • Adult 13–59y • Senior 60+)** in **English & Tamil (தமிழ்)**.

---

## 💡 2. Real-Time Life Examples (How CareSync AI Saves Lives)

### Scenario A: Midnight Pediatric Fever During a Wi-Fi Outage (Offline Resilience)
* **The Situation:** At 1:30 AM, a 5-year-old child (`Aarav`, 18 kg) develops a sudden `102.5°F` fever with chills while home Wi-Fi is down. The parent considers giving leftover `Ibuprofen` syrup.
* **How CareSync AI Acts:**
  1. **Zero-Internet Triage:** Switches instantaneously (`~38ms` latency) to **On-Device AI** and delivers step-by-step home care instructions in **Tamil or English**.
  2. **Pharmacovigilance Shield:** The Java `DrugInteractionService` detects the child's `IBUPROFEN` allergy / dehydration risk and flashes a **Critical Red Contraindication Alert** before any harmful dose is given.
  3. **Auto-Sync:** Stored safely in **IndexedDB Offline Vault** and automatically synced to **Spring Boot SQL + Firebase Firestore** the second connectivity returns.

### Scenario B: Golden-Hour Critical Escalation (Autonomous Agentic Autopilot)
* **The Situation:** A child's temperature spikes to `103.2°F`. Panicked caregivers do not have time to navigate multiple hospital portals.
* **How CareSync AI Acts:** With one voice command or click on the **Autonomous Clinical Agent**, the system automatically evaluates fever velocity, books a **Pediatric ICU bed**, dispatches a **108 Ambulance (`EMS-2026-XXXX`)**, and generates a **Zero-Internet SOS QR Medical Passport** for incoming paramedics.

---

## 🏆 3. Why Judges Will Love This Architecture (Interactive Highlights)

| Judge Evaluation Criteria | CareSync AI Enterprise Implementation |
| :--- | :--- |
| **True Hybrid AI (`#BuildHybridAI`)** | Uses `InferenceMode.PREFER_ON_DEVICE` + Live Gemini 2.5 Flash bridge with deterministic zero-latency fallback (`~38ms` offline vs `~620ms` cloud). |
| **Enterprise Java Backend Depth** | **10 Modular REST Controllers & 34 Java Classes** handling Pharmacovigilance, Holliday-Segar Hydration (`ml/day`), Google FHIR-Lite JSON, and SQL Audit Trails. |
| **Agentic AI & Tool Execution** | Multi-step **Autonomous Clinical Agent** that reasons over vitals trends and autonomously triggers 108 Ambulance & ICU bed reservations. |
| **Zero-Hallucination Clinical RAG** | Grounds AI responses strictly in **WHO & Red Cross Pediatric Protocols** with explicit source citations and structured JSON tool outputs. |
| **Pure-Java Predictive ML Engine** | Implements **Logistic Regression Sigmoid Risk (%)**, **OLS Linear Regression 2-Hour Fever Forecasting**, and **Cosine Similarity Vector Clustering** without external dependencies. |
| **Inclusive Accessibility** | Full **Bilingual UI & Web Speech Voice Input (Tamil & English)** + **Canvas-based Offline SOS QR Medical Passport**. |

---

## 🏗️ 4. System Architecture Flow

```text
[ User / Caregiver (Tamil & English Voice/Text/Camera) ]
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│   HYBRID AI & OFFLINE-FIRST FRONTEND (10 Web Modules)  │
│  • Online: Live Gemini 2.5 Flash + Firebase Firestore  │
│  • Offline: On-Device Nano + IndexedDB + Canvas QR     │
└────────────────────────┬───────────────────────────────┘
                         │ REST JSON (/api/**)
                         ▼
┌────────────────────────────────────────────────────────┐
│   JAVA 17 SPRING BOOT 3 ENTERPRISE BACKEND (10 APIs)   │
│  1. /api/master    -> Unified Telemetry & Radar        │
│  2. /api/health    -> Triage, Dosage & Drug Allergy    │
│  3. /api/family    -> Family Vault & Care Plans        │
│  4. /api/dispatch  -> 108 Ambulance & ICU Allocation   │
│  5. /api/agent     -> Autonomous Multi-Step Agent      │
│  6. /api/passport  -> Offline SOS QR & Fever Curve     │
│  7. /api/vision    -> Multimodal Medicine/Wound Audit  │
│  8. /api/rag       -> WHO Grounded Clinical RAG        │
│  9. /api/outbreak  -> Bio-Surveillance Cluster Heatmap │
│ 10. /api/ml        -> Sigmoid, Regression & Cosine ML  │
└────────────────────────┬───────────────────────────────┘
                         │ Spring Data JPA
                         ▼
         [ H2 Enterprise Relational Database ]
   (HEALTH_LOGS • FAMILY_PROFILES • EMERGENCY_DISPATCHES)
```

---

## 🚀 5. Step-by-Step URL Execution & Live Demo Walkthrough

### Step 0: Start the Spring Boot Enterprise Server
```bash
mvn spring-boot:run
```
Wait until `Tomcat started on port 8080` appears in the console, then open Google Chrome and follow the **10-Step Interactive Walkthrough**:

---

### 🌐 Step 1: Global Master Unified Command Center
* **URL:** `http://localhost:8080/master-command.html`
* **Interactive Test:** Verify all **8+ Java Microservices** show `● ONLINE` on the right radar. Tap **`🎙️ Tap & Speak Emergency`** (in English or Tamil) and click **`⚡ Run All-in-One Autonomous Pipeline`**.
* **📸 Screenshot Placeholder:** `![Master Command Center](screenshots/01-master-command.png)`

---

### 🩺 Step 2: Universal Triage, Bilingual AI & Drug Safety Shield
* **URL:** `http://localhost:8080/index.html`
* **Interactive Test:** Select **Child (0–12y)**, set **Temp = `102.5°F`**, set **Drug Allergy = `Ibuprofen / NSAID`**, click **`🌡️ High Fever`**, and run the engine. Toggle **Wi-Fi OFF** to verify seamless **Offline Mode + IndexedDB Auto-Sync**.
* **📸 Screenshot Placeholder:** `![Universal Triage & Drug Safety](screenshots/02-triage-drug-safety.png)`

---

### 👨‍👩‍👧‍👦 Step 3: Family Health Vault & Google Healthcare FHIR-Lite Hub
* **URL:** `http://localhost:8080/family-hub.html`
* **Interactive Test:** Register a family member (`Aarav`, Blood Group `O+`), click the saved profile card to view the **Personalized Java Care Plan**, and click **`🔄 Load Latest Clinical Record`** to inspect the **Google FHIR-Lite JSON Bundle**.
* **📸 Screenshot Placeholder:** `![Family Vault & Google FHIR](screenshots/03-family-fhir-hub.png)`

---

### 🚑 Step 4: 108 Ambulance & Hospital ICU Bed Dispatch
* **URL:** `http://localhost:8080/emergency-command.html`
* **Interactive Test:** Inspect real-time **ICU Bed Availability** across nearby hospitals and click **`🚑 Dispatch Ambulance & Notify Hospital`** to generate a priority **`EMS-2026-XXXX`** ticket with ETA.
* **📸 Screenshot Placeholder:** `![108 ICU Dispatch](screenshots/04-108-icu-dispatch.png)`

---

### 🤖 Step 5: Autonomous Agentic AI Autopilot
* **URL:** `http://localhost:8080/agentic-command.html`
* **Interactive Test:** Click **`🚀 Execute Autonomous Care Agent`** and watch the live **5-Step Agent Reasoning Trace** (Vitals Trend -> Allergy Check -> Auto 108 ICU Booking -> Google FHIR -> Firebase Cloud Sync).
* **📸 Screenshot Placeholder:** `![Autonomous Agentic AI](screenshots/05-agentic-autopilot.png)`

---

### 🪪 Step 6: Offline SOS QR Medical Passport & Live Fever Curve
* **URL:** `http://localhost:8080/vitals-analytics.html`
* **Interactive Test:** Enter `Aarav` and click **`Generate QR ID`** to render a **100% Zero-Internet Scannable QR Medical ID** alongside the **Live Fever Progression Graph** and **Latency Benchmark (`~38ms` On-Device vs `~620ms` Cloud)**.
* **📸 Screenshot Placeholder:** `![Offline QR Passport & Fever Chart](screenshots/06-qr-vitals-chart.png)`

---

### 📸 Step 7: Multimodal Vision Medicine & Wound Scanner
* **URL:** `http://localhost:8080/vision-scanner.html`
* **Interactive Test:** Upload a medicine bottle or burn photo (or enter `Ibuprofen 100mg syrup` in notes) and click **`🔍 Analyze Image`** to trigger **Gemini Multimodal Vision + Java Pharmacovigilance Danger Verdict**.
* **📸 Screenshot Placeholder:** `![Multimodal Vision Scanner](screenshots/07-vision-scanner.png)`

---

### 🧠 Step 8: Grounded WHO Clinical RAG & Socratic AI Lab
* **URL:** `http://localhost:8080/genai-rag-lab.html`
* **Interactive Test:** Send `"My 5-year-old has 102.5°F fever and chills"` to see **WHO Protocol Source Citations**, **Socratic Follow-Up Questions**, and **Gemini Structured JSON Tool Output**.
* **📸 Screenshot Placeholder:** `![Grounded Clinical RAG](screenshots/08-clinical-rag-lab.png)`

---

### 📡 Step 9: Live Community Bio-Surveillance & Outbreak Radar
* **URL:** `http://localhost:8080/outbreak-radar.html`
* **Interactive Test:** Observe the **Animated Surveillance Radar Sweep** and **Zone-Wise Disease Cluster Heatmap** dynamically aggregating febrile and dehydration cases from Spring Boot SQL.
* **📸 Screenshot Placeholder:** `![Outbreak Radar](screenshots/09-outbreak-radar.png)`

---

### 🧮 Step 10: Pure-Java Predictive AI & ML Algorithms Lab
* **URL:** `http://localhost:8080/ai-ml-predictor.html`
* **Interactive Test:** Click **`⚡ Execute 3 Java ML Algorithms`** to compute **Logistic Sigmoid Critical Probability (%)**, **OLS Linear Regression 2-Hour Fever Forecast (°F)**, and **Cosine Vector Similarity Score**.
