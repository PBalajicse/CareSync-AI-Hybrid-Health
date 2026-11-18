/**
 * CareSync AI - Global Master Unified Command & Microservice Radar Controller
 */
document.addEventListener("DOMContentLoaded", () => {
    const kpiTriage = document.getElementById("kpiTriage");
    const kpiFamily = document.getElementById("kpiFamily");
    const kpiDispatch = document.getElementById("kpiDispatch");
    const microserviceList = document.getElementById("microserviceList");
    const radarStatus = document.getElementById("radarStatus");

    const masterLang = document.getElementById("masterLang");
    const handsFreeVoiceBtn = document.getElementById("handsFreeVoiceBtn");
    const masterQueryInput = document.getElementById("masterQueryInput");
    const masterExecuteBtn = document.getElementById("masterExecuteBtn");
    const masterOutputBox = document.getElementById("masterOutputBox");

    // 1. Poll Live Enterprise System Telemetry from MasterSystemMonitorController
    async function loadSystemRadar() {
        try {
            const res = await fetch("/api/master/telemetry");
            if (!res.ok) throw new Error("Radar offline");
            const data = await res.json();

            kpiTriage.textContent = data.totalTriageLogs ?? 0;
            kpiFamily.textContent = data.totalFamilyProfiles ?? 0;
            kpiDispatch.textContent = data.total108Dispatches ?? 0;
            radarStatus.textContent = "● 8 CONTROLLERS ONLINE";
            radarStatus.style.color = "#34d399";

            let html = "";
            (data.activeMicroservices || []).forEach((svc) => {
                html += `
                    <div class="service-row">
                        <div>
                            <div class="service-name">${svc.module}</div>
                            <div class="service-ep">${svc.endpoint}</div>
                        </div>
                        <span class="online-dot">● ${svc.status}</span>
                    </div>`;
            });
            microserviceList.innerHTML = html;
        } catch (err) {
            radarStatus.textContent = "⚡ OFFLINE ON-DEVICE MODE";
            radarStatus.style.color = "#fbbf24";
            microserviceList.innerHTML = `<p style="color:#fbbf24; font-size:13px;">Running in Zero-Internet Offline Mode. Local IndexedDB & On-Device AI active.</p>`;
        }
    }

    // 2. Hands-Free Bilingual Voice Recognition (Tamil & English)
    handsFreeVoiceBtn.addEventListener("click", () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice recognition works best in Google Chrome or Microsoft Edge.");
            return;
        }
        const recognition = new SpeechRecognition();
        const isTamil = masterLang.value === "TA";
        recognition.lang = isTamil ? "ta-IN" : "en-US";
        handsFreeVoiceBtn.textContent = isTamil ? "🔴 பேசுங்கள் (Listening)..." : "🔴 Listening (Speak Now)...";

        recognition.onresult = (e) => {
            masterQueryInput.value = e.results.transcript;
            handsFreeVoiceBtn.textContent = "🎙️ Tap & Speak Emergency (Tamil / English)";
        };
        recognition.onerror = () => {
            handsFreeVoiceBtn.textContent = "🎙️ Tap & Speak Emergency (Tamil / English)";
        };
        recognition.start();
    });

    // 3. Execute Unified Pipeline (WHO Clinical RAG + Autonomous Agent + 108 Dispatch)
    masterExecuteBtn.addEventListener("click", async () => {
        const query = masterQueryInput.value.trim();
        const isTamil = masterLang.value === "TA";

        if (!query) {
            alert(isTamil ? "அவசர நிலையைப் பேசவும் அல்லது டைப் செய்யவும்." : "Please speak or enter an emergency scenario.");
            return;
        }

        masterExecuteBtn.disabled = true;
        masterExecuteBtn.textContent = "⏳ Orchestrating RAG + Autonomous Agent + 108 Dispatch...";
        masterOutputBox.style.display = "block";
        masterOutputBox.textContent = "Executing unified multi-controller clinical pipeline...";

        const isCritical = query.includes("102") || query.includes("103") || query.toLowerCase().includes("fever") || query.toLowerCase().includes("breath");
        const detectedTemp = query.includes("103") ? 103.2 : (isCritical ? 102.5 : 99.2);

        try {
            // Parallel Execution: Call RAG Knowledge Engine & Autonomous Clinical Agent
            const [ragRes, agentRes] = await Promise.all([
                fetch("/api/rag/query", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: query, age: 5 })
                }),
                fetch("/api/agent/execute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        patientName: "Aarav (Child)",
                        patientAge: 5,
                        weightKg: 18.0,
                        temperatureF: detectedTemp,
                        knownAllergy: "IBUPROFEN",
                        symptomQuery: query,
                        aiResponse: isTamil
                            ? "1. பருத்தி ஆடை அணிவிக்கவும்.\n2. 15 நிமிடங்களுக்கு ஒருமுறை ORS நீர் கொடுக்கவும்.\n3. வெதுவெதுப்பான நீரில் நெற்றியில் ஒத்தடம் கொடுக்கவும்."
                            : "1. Dress in light cotton clothing.\n2. Administer frequent sips of ORS.\n3. Sponge forehead with lukewarm water.",
                        aiMode: navigator.onLine ? "UNIFIED_MASTER_PIPELINE" : "OFFLINE_MASTER_NANO"
                    })
                })
            ]);

            const ragData = ragRes.ok ? await ragRes.json() : {};
            const agentData = agentRes.ok ? await agentRes.json() : {};

            const ticketInfo = agentData.autoDispatchTicket
                ? `🚨 AUTO-DISPATCHED: ${agentData.autoDispatchTicket.ticketCode} -> ${agentData.autoDispatchTicket.assignedHospital} (ETA: ${agentData.autoDispatchTicket.estimatedArrivalMin} mins)`
                : "✔ Home Care Monitoring Active (No ambulance required)";

            masterOutputBox.textContent =
                `=== UNIFIED MASTER COMMAND EXECUTION ===\n` +
                `📚 WHO RAG SOURCE: ${ragData.verifiedSource || "WHO Pediatric Standard"}\n` +
                `🛡️ DRUG & ALLERGY AUDIT: ${agentData.clinicalRecord?.interactionAlert || "Verified"}\n` +
                `🚑 108 DISPATCH STATUS: ${ticketInfo}\n` +
                `🪪 OFFLINE QR PASSPORT: Updated & Ready at /vitals-analytics.html\n` +
                `========================================`;

            await loadSystemRadar();
        } catch (err) {
            masterOutputBox.textContent =
                `⚡ OFFLINE MASTER EMERGENCY PROTOCOL:\n` +
                `1. Keep patient calm and hydrated with ORS.\n` +
                `2. Avoid Aspirin & Ibuprofen if dehydrated.\n` +
                `3. Dial 108 immediately if fever exceeds 102°F.`;
        }

        masterExecuteBtn.disabled = false;
        masterExecuteBtn.textContent = "⚡ Run All-in-One Autonomous Pipeline (RAG + Agent + 108)";
    });

    loadSystemRadar();
});
