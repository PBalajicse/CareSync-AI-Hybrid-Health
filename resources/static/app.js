/**
 * CareSync AI - Enterprise Controller (Part 1)
 * IndexedDB Offline Vault + Bilingual Switcher + Drug Allergy & SOS Integration
 */

const OfflineVault = (function () {
    const DB_NAME = "CareSyncEnterpriseDB_v3";
    const STORE_NAME = "pending_clinical_logs";
    const DB_VERSION = 1;

    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: "localId", autoIncrement: true });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async function addRecord(record) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).add(record);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async function getAllRecords() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const req = tx.objectStore(STORE_NAME).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async function clearAll() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    return { addRecord, getAllRecords, clearAll };
})();

document.addEventListener("DOMContentLoaded", () => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Navigation & Telemetry Elements
    const langSelect = document.getElementById("langSelect");
    const netStatusPill = document.getElementById("netStatusPill");
    const netStatusText = document.getElementById("netStatusText");
    const liveModeTag = document.getElementById("liveModeTag");

    const statTotal = document.getElementById("statTotal");
    const statHighRisk = document.getElementById("statHighRisk");
    const statChild = document.getElementById("statChild");
    const statSenior = document.getElementById("statSenior");
    const statOffline = document.getElementById("statOffline");
    const offlineCounter = document.getElementById("offlineCounter");

    // Live Visual Telemetry Bars
    const pctOnline = document.getElementById("pctOnline");
    const barOnline = document.getElementById("barOnline");
    const pctOffline = document.getElementById("pctOffline");
    const barOffline = document.getElementById("barOffline");
    const pctChild = document.getElementById("pctChild");
    const barChild = document.getElementById("barChild");
    const pctSenior = document.getElementById("pctSenior");
    const barSenior = document.getElementById("barSenior");

    // Form & Clinical Output Elements
    const ageTabs = document.querySelectorAll(".age-tab");
    const patientNameInput = document.getElementById("patientName");
    const patientAgeInput = document.getElementById("patientAge");
    const patientWeightInput = document.getElementById("patientWeight");
    const patientTempInput = document.getElementById("patientTemp");
    const knownAllergySelect = document.getElementById("knownAllergy");
    const symptomInput = document.getElementById("symptomInput");
    const chips = document.querySelectorAll(".chip");
    const voiceBtn = document.getElementById("voiceBtn");
    const generateBtn = document.getElementById("generateBtn");

    const resultBox = document.getElementById("resultBox");
    const sosEmergencyCard = document.getElementById("sosEmergencyCard");
    const resRiskScore = document.getElementById("resRiskScore");
    const resHydration = document.getElementById("resHydration");
    const resAiMode = document.getElementById("resAiMode");
    const interactionAlertBox = document.getElementById("interactionAlertBox");
    const dosageAlertBox = document.getElementById("dosageAlertBox");
    const aiResponseText = document.getElementById("aiResponseText");
    const copySummaryBtn = document.getElementById("copySummaryBtn");

    const manualSyncBtn = document.getElementById("manualSyncBtn");
    const filterAllBtn = document.getElementById("filterAllBtn");
    const filterHighRiskBtn = document.getElementById("filterHighRiskBtn");
    const historyContainer = document.getElementById("historyContainer");

    let currentFilter = "ALL";

    // 1. Bilingual UI Toggle (English <-> Tamil)
    langSelect.addEventListener("change", () => {
        const isTamil = langSelect.value === "TA";
        symptomInput.placeholder = isTamil
            ? "அறிகுறிகளை தமிழில் டைப் செய்யவும் அல்லது மைக் பட்டனை அழுத்திப் பேசவும்..."
            : "Enter symptoms or tap a quick preset above...";
        generateBtn.textContent = isTamil
            ? "⚡ தமிழ் AI & மருந்து பாதுகாப்பு சோதனை"
            : "⚡ Run Hybrid AI & Drug Safety Engine";
    });

    // 2. Age Group Switcher (Updates Name, Age & Weight automatically)
    ageTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            ageTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            patientNameInput.value = tab.dataset.name;
            patientAgeInput.value = tab.dataset.age;
            patientWeightInput.value = tab.dataset.weight;
        });
    });

    // 3. Quick Emergency Presets
    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            symptomInput.value = chip.dataset.text;
        });
    });

    // 4. Bilingual Voice Recognition (English + Tamil)
    voiceBtn.addEventListener("click", () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input works best in Google Chrome or Microsoft Edge.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = langSelect.value === "TA" ? "ta-IN" : "en-US";
        voiceBtn.textContent = langSelect.value === "TA" ? "🔴 பேசுங்கள்..." : "🔴 Listening...";

        recognition.onresult = (e) => {
            symptomInput.value = e.results.transcript;
            voiceBtn.textContent = "🎙️ Speak Symptoms";
        };
        recognition.onerror = () => {
            voiceBtn.textContent = "🎙️ Speak Symptoms";
        };
        recognition.start();
    });

    // 5. Connectivity Monitor
    function updateConnectivityUI() {
        if (navigator.onLine) {
            netStatusPill.className = "status-pill status-online";
            netStatusText.textContent = "ONLINE • Cloud + Nano Ready";
            liveModeTag.className = "status-pill status-online";
            liveModeTag.textContent = "HYBRID CLOUD + NANO";
            if (typeof syncIndexedDBToSpringBoot === "function") {
                syncIndexedDBToSpringBoot();
            }
        } else {
            netStatusPill.className = "status-pill status-offline";
            netStatusText.textContent = "OFFLINE • On-Device AI Mode";
            liveModeTag.className = "status-pill status-offline";
            liveModeTag.textContent = "OFFLINE NANO VAULT";
        }
    }
    window.addEventListener("online", updateConnectivityUI);
    window.addEventListener("offline", updateConnectivityUI);
    updateConnectivityUI();

    // --- PART 2 CODE கீழே பேஸ்ட் பண்ணவும் ---
	// 6. Execute Hybrid AI + Java Drug & Allergy Safety Engine
	generateBtn.addEventListener("click", async () => {
	    const name = patientNameInput.value.trim() || "Family Member";
	    const age = parseInt(patientAgeInput.value, 10) || 25;
	    const weight = parseFloat(patientWeightInput.value) || (age <= 12 ? 18.0 : 65.0);
	    const temp = parseFloat(patientTempInput.value) || 98.6;
	    const allergy = knownAllergySelect.value || "NONE";
	    const query = symptomInput.value.trim();
	    const lang = langSelect.value;

	    if (!query) {
	        alert(lang === "TA" ? "அறிகுறிகளை உள்ளிடவும் அல்லது பேசவும்." : "Please enter symptoms or tap a preset.");
	        return;
	    }

	    generateBtn.disabled = true;
	    generateBtn.textContent = "⏳ Running Hybrid AI & Drug Safety Engine...";
	    resultBox.style.display = "block";
	    aiResponseText.textContent = "Screening drug interactions, vitals & generating clinical protocol...";

	    const guidance = await CareSyncAI.generateGuidance(name, age, weight, temp, allergy, query, lang);
	    const offlineMetrics = CareSyncAI.estimateOfflineMetrics(age, weight, temp, allergy, query);

	    const payload = {
	        patientName: name,
	        patientAge: age,
	        weightKg: weight,
	        temperatureF: temp,
	        knownAllergy: allergy,
	        symptomQuery: query,
	        aiResponse: guidance.text,
	        aiMode: guidance.mode
	    };

	    let savedRecord = null;
	    if (navigator.onLine) {
	        try {
	            const res = await fetch("/api/health/sync", {
	                method: "POST",
	                headers: { "Content-Type": "application/json" },
	                body: JSON.stringify(payload)
	            });
	            if (res.ok) {
	                savedRecord = await res.json();
	            }
	        } catch (e) {
	            console.warn("Backend unreachable, saving to IndexedDB Vault.");
	        }
	    }

	    if (!savedRecord) {
	        await OfflineVault.addRecord({ ...payload, ...offlineMetrics });
	        savedRecord = { ...payload, ...offlineMetrics };
	    }

	    // Auto-show Emergency 108 & Hospital Locator Card on HIGH_EMERGENCY
	    if (savedRecord.riskLevel === "HIGH_EMERGENCY") {
	        sosEmergencyCard.style.display = "block";
	    } else {
	        sosEmergencyCard.style.display = "none";
	    }

	    // Display Java Risk Score, Hydration & AI Engine
	    resRiskScore.textContent = `${savedRecord.riskScore} / 100 (${savedRecord.riskLevel})`;
	    resRiskScore.style.color = savedRecord.riskLevel === "HIGH_EMERGENCY" ? "#f87171" : "#38bdf8";
	    resHydration.textContent = `${savedRecord.dailyHydrationMl} ml / day`;
	    resAiMode.textContent = savedRecord.aiMode;

	    // Display Drug & Allergy Interaction Alert
	    const alertText = savedRecord.interactionAlert || "";
	    interactionAlertBox.textContent = `🛡️ ${alertText}`;
	    if (alertText.startsWith("SAFE PROFILE")) {
	        interactionAlertBox.className = "interaction-alert interaction-safe";
	    } else {
	        interactionAlertBox.className = "interaction-alert";
	    }

	    dosageAlertBox.textContent = `💊 ${savedRecord.dosageGuidance}`;
	    aiResponseText.textContent = savedRecord.aiResponse;

	    await refreshDashboardAndLogs();

	    generateBtn.disabled = false;
	    generateBtn.textContent = lang === "TA"
	        ? "⚡ தமிழ் AI & மருந்து பாதுகாப்பு சோதனை"
	        : "⚡ Run Hybrid AI & Drug Safety Engine";
	});

	// --- PART 3 CODE கீழே பேஸ்ட் பண்ணவும் ---
	// 7. Copy Clinical Summary Report
	    copySummaryBtn.addEventListener("click", () => {
	        const report =
	            `=== CARESYNC AI ENTERPRISE CLINICAL REPORT ===\n` +
	            `Patient: ${patientNameInput.value} | Age: ${patientAgeInput.value}y | Weight: ${patientWeightInput.value}kg | Temp: ${patientTempInput.value}°F\n` +
	            `Known Drug Allergy: ${knownAllergySelect.value}\n` +
	            `Triage Risk Score: ${resRiskScore.textContent}\n` +
	            `Hydration Target: ${resHydration.textContent}\n` +
	            `Drug Safety Screening: ${interactionAlertBox.textContent}\n` +
	            `Dosage Reference: ${dosageAlertBox.textContent}\n` +
	            `Symptoms: ${symptomInput.value}\n\n` +
	            `Protocol (${resAiMode.textContent}):\n${aiResponseText.textContent}\n` +
	            `=============================================`;
	        navigator.clipboard.writeText(report);
	        alert("Clinical Doctor Report copied to clipboard!");
	    });

	    // 8. Auto-Sync IndexedDB Vault to Spring Boot JPA Backend
	    async function syncIndexedDBToSpringBoot() {
	        const pendingLogs = await OfflineVault.getAllRecords();
	        if (pendingLogs.length > 0 && navigator.onLine) {
	            try {
	                for (const item of pendingLogs) {
	                    await fetch("/api/health/sync", {
	                        method: "POST",
	                        headers: { "Content-Type": "application/json" },
	                        body: JSON.stringify(item)
	                    });
	                }
	                await OfflineVault.clearAll();
	            } catch (e) {
	                console.warn("Sync retry pending.");
	            }
	        }
	        await refreshDashboardAndLogs();
	    }

	    manualSyncBtn.addEventListener("click", syncIndexedDBToSpringBoot);

	    // 9. Filter Buttons (All vs High Emergency Only)
	    filterAllBtn.addEventListener("click", () => {
	        currentFilter = "ALL";
	        filterAllBtn.classList.add("active");
	        filterHighRiskBtn.classList.remove("active");
	        refreshDashboardAndLogs();
	    });

	    filterHighRiskBtn.addEventListener("click", () => {
	        currentFilter = "HIGH_RISK";
	        filterHighRiskBtn.classList.add("active");
	        filterAllBtn.classList.remove("active");
	        refreshDashboardAndLogs();
	    });

	    // 10. Update Live Analytics, Visual Progress Bars & Audit Logs
	    async function refreshDashboardAndLogs() {
	        const pendingLogs = await OfflineVault.getAllRecords();
	        offlineCounter.textContent = pendingLogs.length;

	        let remoteLogs = [];
	        try {
	            const analyticsRes = await fetch("/api/health/analytics");
	            if (analyticsRes.ok) {
	                const stats = await analyticsRes.json();
	                statTotal.textContent = stats.totalRecords;
	                statHighRisk.textContent = stats.highRiskCount;
	                statChild.textContent = stats.childCasesCount;
	                statSenior.textContent = stats.seniorCasesCount;
	                statOffline.textContent = stats.offlineInferenceCount;

	                const totalAI = (stats.onlineInferenceCount + stats.offlineInferenceCount) || 1;
	                const onlinePct = Math.round((stats.onlineInferenceCount / totalAI) * 100);
	                const offlinePct = Math.round((stats.offlineInferenceCount / totalAI) * 100);
	                pctOnline.textContent = `${onlinePct}% (${stats.onlineInferenceCount})`;
	                barOnline.style.width = `${onlinePct}%`;
	                pctOffline.textContent = `${offlinePct}% (${stats.offlineInferenceCount})`;
	                barOffline.style.width = `${offlinePct}%`;

	                const totalCases = stats.totalRecords || 1;
	                const childPct = Math.round((stats.childCasesCount / totalCases) * 100);
	                const seniorPct = Math.round((stats.seniorCasesCount / totalCases) * 100);
	                pctChild.textContent = `${childPct}% (${stats.childCasesCount})`;
	                barChild.style.width = `${childPct}%`;
	                pctSenior.textContent = `${seniorPct}% (${stats.seniorCasesCount})`;
	                barSenior.style.width = `${seniorPct}%`;
	            }

	            const endpoint = currentFilter === "HIGH_RISK" ? "/api/health/high-risk" : "/api/health/history";
	            const logsRes = await fetch(endpoint);
	            if (logsRes.ok) {
	                remoteLogs = await logsRes.json();
	            }
	        } catch (e) {
	            console.warn("Viewing local IndexedDB vault while offline.");
	        }

	        renderLogs(pendingLogs, remoteLogs);
	    }

	    function renderLogs(pendingLogs, remoteLogs) {
	        let html = "";

	        pendingLogs.forEach((item) => {
	            html += `
	                <div class="log-card pending">
	                    <div class="log-top">
	                        <span style="color:#fbbf24;">⏳ INDEXEDDB OFFLINE QUEUE</span>
	                        <span>Risk: ${item.riskScore}/100</span>
	                    </div>
	                    <div class="log-title">${item.patientName} (${item.ageGroup} • ${item.weightKg}kg • ${item.temperatureF}°F)</div>
	                    <div class="log-meta">Allergy: ${item.knownAllergy} • Hydration: ${item.dailyHydrationMl} ml</div>
	                    <div class="log-query">${item.symptomQuery}</div>
	                </div>`;
	        });

	        remoteLogs.forEach((item) => {
	            const isHigh = item.riskLevel === "HIGH_EMERGENCY";
	            const cardClass = isHigh ? "log-card high-risk" : "log-card synced";
	            const badgeColor = isHigh ? "#f87171" : "#34d399";
	            const badgeText = isHigh ? `🚨 ${item.riskLevel} (${item.riskScore}/100)` : `✔ SYNCED • ${item.riskLevel} (${item.riskScore}/100)`;

	            html += `
	                <div class="${cardClass}">
	                    <div class="log-top">
	                        <span style="color:${badgeColor};">${badgeText}</span>
	                        <span style="color:#94a3b8;">${item.ageGroup}</span>
	                    </div>
	                    <div class="log-title">${item.patientName} (${item.patientAge}y • ${item.weightKg}kg • ${item.temperatureF}°F)</div>
	                    <div class="log-meta">Allergy: ${item.knownAllergy} • Hydration: ${item.dailyHydrationMl} ml • ${item.aiMode}</div>
	                    <div class="log-query">${item.symptomQuery}</div>
	                </div>`;
	        });

	        historyContainer.innerHTML = html || `<p style="font-size:13px; color:#94a3b8;">No matching clinical records found.</p>`;
	    }

	    refreshDashboardAndLogs();
	});
