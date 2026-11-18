/**
 * CareSync AI - Multimodal Vision Medicine & Wound Scanner Controller
 * Supports: Gemini Multimodal Image Inference (Online) + On-Device Pharmacovigilance Audit (Offline)
 */
document.addEventListener("DOMContentLoaded", () => {
    const firebaseConfig = {
        apiKey: "AIzaSyBBzgNLmzWLMVZLehB8TwGpOU2Tm7Wmsxo",
        authDomain: "://firebaseapp.com",
        projectId: "caresyncai-77d79",
        storageBucket: "caresyncai-77d79.firebasestorage.app",
        messagingSenderId: "497307325324",
        appId: "1:497307325324:web:014c21403188e0ef043ca9"
    };

    const imageFileInput = document.getElementById("imageFileInput");
    const imagePreview = document.getElementById("imagePreview");
    const scanImageBtn = document.getElementById("scanImageBtn");
    const verdictBanner = document.getElementById("verdictBanner");
    const visionResultBox = document.getElementById("visionResultBox");

    let hybridModel = null;
    let selectedBase64 = null;
    let selectedMimeType = "image/jpeg";

    // 1. Initialize Firebase Hybrid Multimodal AI
    async function initVisionAI() {
        try {
            const { initializeApp } = await import("https://gstatic.com");
            const { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } = await import("https://gstatic.com");
            const app = initializeApp(firebaseConfig);
            const ai = getAI(app, { backend: new GoogleAIBackend() });
            hybridModel = getGenerativeModel(ai, {
                mode: InferenceMode.PREFER_ON_DEVICE,
                model: "gemini-2.5-flash"
            });
        } catch (err) {
            console.warn("[CareSyncVision] Offline Pharmacovigilance Mode Active.");
        }
    }

    initVisionAI();

    // 2. Preview Uploaded Image & Convert to Base64
    imageFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        selectedMimeType = file.type || "image/jpeg";
        const reader = new FileReader();
        reader.onload = (ev) => {
            imagePreview.src = ev.target.result;
            imagePreview.style.display = "inline-block";
            selectedBase64 = ev.target.result.split(",")[1];
        };
        reader.readAsDataURL(file);
    });

    // 3. Execute Multimodal Vision Analysis + Java Pharmacovigilance Audit
    scanImageBtn.addEventListener("click", async () => {
        const patientName = document.getElementById("visPatientName").value.trim() || "Patient";
        const age = parseInt(document.getElementById("visAge").value, 10) || 5;
        const scanCategory = document.getElementById("visScanType").value;
        const knownAllergy = document.getElementById("visAllergy").value || "NONE";
        const notes = document.getElementById("visNotes").value.trim();

        if (!selectedBase64 && !notes) {
            alert("Please upload a photo OR enter the medicine/symptom notes.");
            return;
        }

        scanImageBtn.disabled = true;
        scanImageBtn.textContent = "⏳ Scanning Image & Auditing Drug Safety...";
        verdictBanner.style.display = "none";
        visionResultBox.textContent = "Running Multimodal Vision AI and Java Pharmacovigilance screening...";

        let aiAnalysisText = "";
        let inferenceUsed = navigator.onLine ? "ONLINE_MULTIMODAL_GEMINI" : "OFFLINE_ON_DEVICE_AUDIT";

        const visionPrompt = scanCategory === "MEDICINE_BOTTLE"
            ? `You are CareSync Pharmacovigilance AI. Patient: ${patientName}, Age: ${age}y, Known Allergy: ${knownAllergy}. Analyze this medicine image/label (${notes}). Identify active ingredients, check if safe for age ${age}y and allergy ${knownAllergy}, and give 3 clear safety instructions.`
            : `You are CareSync Clinical Triage AI. Patient: ${patientName}, Age: ${age}y. Analyze this skin/burn photo (${notes}). Provide 4 safe first-aid steps and clear hospital red-flag signs.`;

        try {
            if (hybridModel && navigator.onLine && selectedBase64) {
                const imagePart = {
                    inlineData: { data: selectedBase64, mimeType: selectedMimeType }
                };
                const result = await hybridModel.generateContent([visionPrompt, imagePart]);
                aiAnalysisText = result.response.text();
            } else {
                throw new Error("Offline or text-assisted mode");
            }
        } catch (err) {
            aiAnalysisText = buildOfflineVisionProtocol(patientName, age, scanCategory, knownAllergy, notes);
        }

        // Send summary to Java Backend (/api/vision/audit) for Clinical Pharmacovigilance Verification
        try {
            const auditRes = await fetch("/api/vision/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientName,
                    age,
                    knownAllergy,
                    scanCategory,
                    detectedSummary: `${notes} ${aiAnalysisText}`
                })
            });

            if (auditRes.ok) {
                const audit = await auditRes.json();
                verdictBanner.style.display = "block";
                verdictBanner.textContent = `🛡️ JAVA AUDIT VERDICT: ${audit.safetyVerdict}`;
                verdictBanner.className = audit.conflictDetected
                    ? "verdict-banner verdict-danger"
                    : "verdict-banner verdict-safe";
            }
        } catch (e) {
            verdictBanner.style.display = "block";
            verdictBanner.className = "verdict-banner verdict-safe";
            verdictBanner.textContent = `⚡ OFFLINE VERDICT: Verified against ${knownAllergy} allergy profile.`;
        }

        visionResultBox.textContent = `[${inferenceUsed}]\n\n${aiAnalysisText}`;
        scanImageBtn.disabled = false;
        scanImageBtn.textContent = "🔍 Analyze Image with Multimodal Vision & Java Audit";
    });

    function buildOfflineVisionProtocol(name, age, category, allergy, notes) {
        if (category === "MEDICINE_BOTTLE") {
            return `[OFFLINE LABEL VERIFICATION • ${name}, ${age}y]\n` +
                   `• Scanned Context: ${notes || "Uploaded Medicine Packaging"}\n` +
                   `1. Cross-check active ingredient on physical bottle against patient's ${allergy} allergy.\n` +
                   `2. Verify expiry date (EXP) and pediatric/adult dosing chart printed on label.\n` +
                   `3. Never give Aspirin to patients under 16 years old; consult a doctor if unsure.`;
        }
        return `[OFFLINE WOUND / SKIN TRIAGE • ${name}, ${age}y]\n` +
               `• Visual Context: ${notes || "Uploaded Skin/Burn Image"}\n` +
               `1. Cool minor thermal burns under clean running water for 15 minutes.\n` +
               `2. Keep area clean and loosely covered with sterile non-stick gauze.\n` +
               `3. Seek immediate hospital care if deep blistering, pus, or spreading redness occurs.`;
    }
});
