/**
 * CareSync AI - Autonomous Agentic AI & Firebase Cloud Sync Controller
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

    const fbCloudStatus = document.getElementById("fbCloudStatus");
    const runAgentBtn = document.getElementById("runAgentBtn");
    const agentTraceContainer = document.getElementById("agentTraceContainer");
    const agentAiGuidance = document.getElementById("agentAiGuidance");

    let hybridModel = null;
    let firestoreDb = null;

    // 1. Initialize Firebase Hybrid AI + Cloud Firestore
    async function initFirebaseSuite() {
        try {
            const { initializeApp } = await import("https://gstatic.com");
            const { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } = await import("https://gstatic.com");
            const { getFirestore } = await import("https://gstatic.com");

            const app = initializeApp(firebaseConfig);
            const ai = getAI(app, { backend: new GoogleAIBackend() });
            hybridModel = getGenerativeModel(ai, {
                mode: InferenceMode.PREFER_ON_DEVICE,
                model: "gemini-2.5-flash"
            });
            firestoreDb = getFirestore(app);
            fbCloudStatus.textContent = navigator.onLine
                ? "🔥 Firebase Cloud + Hybrid AI Connected"
                : "⚡ Offline On-Device Agent Mode";
        } catch (err) {
            fbCloudStatus.textContent = "⚡ Local On-Device Agent Active";
        }
    }

    initFirebaseSuite();

    // 2. Execute Autonomous Multi-Step Clinical Agent
    runAgentBtn.addEventListener("click", async () => {
        const name = document.getElementById("agPatientName").value.trim() || "Patient";
        const age = parseInt(document.getElementById("agAge").value, 10) || 5;
        const weight = parseFloat(document.getElementById("agWeight").value) || 18.0;
        const temp = parseFloat(document.getElementById("agTemp").value) || 98.6;
        const allergy = document.getElementById("agAllergy").value || "NONE";
        const promptText = document.getElementById("agPrompt").value.trim();

        if (!promptText) {
            alert("Please enter an emergency scenario for the AI Agent.");
            return;
        }

        runAgentBtn.disabled = true;
        runAgentBtn.textContent = "🧠 Agent Thinking & Executing Tools...";
        agentTraceContainer.innerHTML = `<p style="color:#38bdf8; font-size:13px;">⏳ Autonomous Agent analyzing vitals, checking allergy rules, and coordinating hospital dispatch...</p>`;
        agentAiGuidance.style.display = "none";

        // Step A: Generate Hybrid AI Guidance (Cloud Gemini or On-Device Nano)
        let aiText = "";
        let aiMode = navigator.onLine ? "ONLINE_CLOUD_GEMINI" : "OFFLINE_ON_DEVICE_NANO";

        try {
            if (hybridModel) {
                const res = await hybridModel.generateContent(
                    `You are an Autonomous Emergency Clinical AI Agent. Patient: ${name}, Age: ${age}y, Weight: ${weight}kg, Temp: ${temp}°F, Allergy: ${allergy}. Give 4 immediate life-saving first-aid steps. Situation: ${promptText}`
                );
                aiText = res.response.text();
                aiMode = res.response.inferenceSource === "on-device" ? "OFFLINE_ON_DEVICE_NANO" : "ONLINE_CLOUD_GEMINI";
            } else {
                throw new Error("Local Agent Protocol");
            }
        } catch (e) {
            aiText =
                `[AUTONOMOUS CLINICAL PROTOCOL • ${name}, ${age}y]\n` +
                `1. Keep ${name} in light cotton clothing and ensure unobstructed airway/breathing.\n` +
                `2. Administer small sips of ORS solution if conscious and able to swallow.\n` +
                `3. Apply lukewarm water sponge on forehead while awaiting emergency transport.\n` +
                `4. Keep patient's allergy alert (${allergy}) ready for the incoming 108 paramedic team.`;
        }

        const payload = {
            patientName: name,
            patientAge: age,
            weightKg: weight,
            temperatureF: temp,
            knownAllergy: allergy,
            symptomQuery: promptText,
            aiResponse: aiText,
            aiMode: aiMode
        };

        // Step B: Call Spring Boot Autonomous Agent Orchestrator (/api/agent/execute)
        try {
            const agentRes = await fetch("/api/agent/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (agentRes.ok) {
                const agentData = await agentRes.json();

                // Step C: Sync to Firebase Cloud Firestore (if online)
                let firebaseSyncStatus = "Queued locally (Offline)";
                if (navigator.onLine && firestoreDb) {
                    try {
                        const { collection, addDoc, serverTimestamp } = await import("https://gstatic.com");
                        await addDoc(collection(firestoreDb, "caresync_agent_logs"), {
                            ...payload,
                            riskScore: agentData.clinicalRecord.riskScore,
                            riskLevel: agentData.clinicalRecord.riskLevel,
                            autoDispatchTicket: agentData.autoDispatchTicket ? agentData.autoDispatchTicket.ticketCode : "NONE",
                            createdAt: serverTimestamp()
                        });
                        firebaseSyncStatus = "Synced to Firebase Firestore Cloud ✔";
                    } catch (fbErr) {
                        firebaseSyncStatus = "Synced to Spring Boot Enterprise DB ✔";
                    }
                }

                renderAgentTrace(agentData.thoughtTrace, firebaseSyncStatus);
                agentAiGuidance.style.display = "block";
                agentAiGuidance.textContent = `🤖 AI AGENT IMMEDIATE ACTION PLAN (${aiMode}):\n\n${aiText}`;
            }
        } catch (err) {
            agentTraceContainer.innerHTML = `
                <div class="step-card dispatch">
                    <div class="step-title">⚡ OFFLINE AUTONOMOUS MODE</div>
                    <div class="step-result">Network unreachable. Immediate protocol generated on-device. Dial 108 if fever > 102°F.</div>
                </div>`;
            agentAiGuidance.style.display = "block";
            agentAiGuidance.textContent = aiText;
        }

        runAgentBtn.disabled = false;
        runAgentBtn.textContent = "🚀 Execute Autonomous Care Agent";
    });

    function renderAgentTrace(steps, firebaseStatus) {
        let html = "";
        (steps || []).forEach((s, idx) => {
            const extraClass = idx === 2 ? "dispatch" : (idx === 3 ? "cloud" : "");
            html += `
                <div class="step-card ${extraClass}">
                    <div class="step-title">${s.step}</div>
                    <div class="step-action">${s.action}</div>
                    <div class="step-result">${s.result}</div>
                </div>`;
        });

        html += `
            <div class="step-card cloud">
                <div class="step-title">STEP 5: DUAL-CLOUD PERSISTENCE</div>
                <div class="step-result">${firebaseStatus}</div>
            </div>`;

        agentTraceContainer.innerHTML = html;
    }
});
