/**
 * CareSync AI - High-Level Bilingual Hybrid Inference & Clinical Pharmacovigilance Engine (Part 1)
 */
const CareSyncAI = (function () {
    const firebaseConfig = {
        apiKey: "AIzaSyBBzgNLmzWLMVZLehB8TwGpOU2Tm7Wmsxo",
        authDomain: "://firebaseapp.com",
        projectId: "caresyncai-77d79",
        storageBucket: "caresyncai-77d79.firebasestorage.app",
        messagingSenderId: "497307325324",
        appId: "1:497307325324:web:014c21403188e0ef043ca9"
    };

    let hybridModel = null;

    async function init() {
        try {
            const { initializeApp } = await import("https://gstatic.com");
            const { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } = await import("https://gstatic.com");
            const app = initializeApp(firebaseConfig);
            const ai = getAI(app, { backend: new GoogleAIBackend() });
            hybridModel = getGenerativeModel(ai, {
                mode: InferenceMode.PREFER_ON_DEVICE,
                model: "gemini-2.5-flash"
            });
            console.log("[CareSyncAI] Hybrid Pharmacovigilance AI Initialized.");
        } catch (err) {
            console.warn("[CareSyncAI] Offline Bilingual Pharmacovigilance Engine Active.");
        }
    }

    function classifyAgeGroup(age) {
        const a = parseInt(age, 10) || 25;
        if (a <= 12) return "CHILD";
        if (a >= 60) return "SENIOR";
        return "ADULT";
    }

    // Mirrors Java ClinicalTriageEngine & DrugInteractionService when Offline
    function estimateOfflineMetrics(age, weightKg, temp, knownAllergy, query) {
        const group = classifyAgeGroup(age);
        const wt = parseFloat(weightKg) || (group === "CHILD" ? 18.0 : 65.0);
        const t = parseFloat(temp) || 98.6;
        const allergy = (knownAllergy || "NONE").toUpperCase();
        const q = (query || "").toLowerCase();

        let score = 15;
        if (t >= 103.0) score += 55;
        else if (t >= 101.0) score += 35;
        else if (t >= 99.5) score += 20;

        if (group === "CHILD" || group === "SENIOR") score += 15;
        if (q.includes("breath") || q.includes("chest") || q.includes("bleed")) score += 30;
        else if (q.includes("burn") || q.includes("vomit") || q.includes("dizzy")) score += 15;

        score = Math.min(score, 100);
        const riskLevel = score >= 65 ? "HIGH_EMERGENCY" : (score >= 35 ? "MODERATE" : "LOW");

        let baseMl = group === "CHILD" ? Math.min(wt * 85, 1800) : (group === "SENIOR" ? 2000 : 2500);
        if (t > 99.5) baseMl += (t - 99.5) * 300;
        const dailyHydrationMl = Math.round(baseMl);

        let dosageGuidance = "No fever medicine indicated (Normal temp). Focus on rest & hydration.";
        if (t >= 99.5) {
            if (age < 2) {
                dosageGuidance = "INFANT SAFETY ALERT (<2 yrs): Do NOT give OTC fever medicine without immediate pediatrician consultation.";
            } else if (group === "CHILD") {
                dosageGuidance = `Pediatric Reference (${wt} kg): Consult doctor/check label for weight-based pediatric paracetamol (max 4 doses/24h). Avoid aspirin.`;
            } else if (group === "SENIOR") {
                dosageGuidance = "Geriatric Reference: Standard adult OTC paracetamol (500mg, max 3000mg/24h) ONLY if no liver/kidney issues. Verify with physician.";
            } else {
                dosageGuidance = "Adult Reference: Standard OTC paracetamol (500mg–650mg every 6h, max 4000mg/24h). Check physical medicine label.";
            }
        }

        let alerts = [];
        if (group === "CHILD" || age < 16) {
            alerts.push("CRITICAL PEDIATRIC RULE: Strictly AVOID Aspirin (Reye's syndrome risk).");
        }
        if (allergy !== "NONE") {
            if (allergy === "IBUPROFEN") alerts.push("ALLERGY ALERT (Ibuprofen/NSAID): Contraindicated! Do NOT give Ibuprofen or Mefenamic acid.");
            else if (allergy === "PENICILLIN") alerts.push("ALLERGY ALERT (Penicillin): Avoid Amoxicillin/Ampicillin antibiotics; notify doctor.");
            else if (allergy === "PARACETAMOL") alerts.push("ALLERGY ALERT (Paracetamol): Contraindicated! Use lukewarm sponge cooling & see doctor.");
            else if (allergy === "SULFA") alerts.push("ALLERGY ALERT (Sulfa): Avoid Sulfamethoxazole/Cotrimoxazole drugs.");
        }
        if ((q.includes("dehydrat") || q.includes("vomit")) && allergy !== "IBUPROFEN") {
            alerts.push("RENAL SAFETY: Avoid Ibuprofen/NSAIDs during dehydration or vomiting.");
        }

        const interactionAlert = alerts.length > 0
            ? alerts.join(" ")
            : "SAFE PROFILE: No known drug/allergy contraindications detected for standard first-aid.";

        return { ageGroup: group, riskScore: score, riskLevel, dailyHydrationMl, dosageGuidance, interactionAlert };
    }

    // --- PART 2 CODE கீழே பேஸ்ட் பண்ணவும் ---
	async function generateGuidance(patientName, age, weightKg, temp, knownAllergy, query, lang) {
	        const isOnline = navigator.onLine;
	        const group = classifyAgeGroup(age);
	        let usedMode = isOnline ? "ONLINE_CLOUD_GEMINI" : "OFFLINE_ON_DEVICE_NANO";
	        const languageInstruction = lang === "TA" ? "Respond clearly in simple Tamil (தமிழ்)." : "Respond clearly in English.";

	        const prompt =
	            `You are CareSync Clinical AI. Patient: ${patientName} (${group}, Age ${age}y, Weight ${weightKg}kg, Temp ${temp}°F, Known Drug Allergy: ${knownAllergy}). ` +
	            `${languageInstruction} Give 4 concise, medically safe, numbered first-aid steps and red-flag warning signs. Symptoms: ${query}`;

	        try {
	            if (hybridModel) {
	                const result = await hybridModel.generateContent(prompt);
	                const text = result.response.text();
	                const source = result.response.inferenceSource;
	                usedMode = source === "on-device" ? "OFFLINE_ON_DEVICE_NANO" : "ONLINE_CLOUD_GEMINI";
	                return { text, mode: usedMode };
	            }
	            throw new Error("Offline Bilingual Fallback");
	        } catch (err) {
	            return {
	                text: buildBilingualProtocol(patientName, group, age, temp, query, lang),
	                mode: usedMode
	            };
	        }
	    }

	    function buildBilingualProtocol(name, group, age, temp, query, lang) {
	        const q = query.toLowerCase();
	        const t = parseFloat(temp) || 98.6;

	        if (lang === "TA") {
	            if (q.includes("fever") || t >= 99.5) {
	                return `[தமிழ் முதலுதவி வழிகாட்டல் • ${name}, வயது ${age}]\n` +
	                       `1. ${name}-க்கு மென்மையான பருத்தி (Cotton) ஆடைகளை அணிவிக்கவும்; கனமான போர்வைகளைத் தவிர்க்கவும்.\n` +
	                       `2. நீர்ச்சத்துக் குறையாமல் இருக்க 15 நிமிடங்களுக்கு ஒருமுறை ORS கரைசல் அல்லது கொதித்து ஆறிய நீர் கொடுக்கவும்.\n` +
	                       `3. வெதுவெதுப்பான நீரில் (Lukewarm water) துணியை நனைத்து நெற்றியில் ஒத்தடம் கொடுக்கவும் (ஐஸ் நீர் வேண்டாம்).\n` +
	                       `4. எச்சரிக்கை: காய்ச்சல் 102°F-க்கு மேல் சென்றாலோ சோர்வு அதிகமானாலோ உடனே 108 அல்லது மருத்துவமனைக்குச் செல்லவும்.`;
	            }
	            if (q.includes("burn") || q.includes("hot")) {
	                return `[தீக்காய முதலுதவி • ${name}, வயது ${age}]\n` +
	                       `1. தீக்காயம் பட்ட இடத்தை உடனடியாக சாதாரண குளிர்ந்த குழாய் நீரில் (Running water) 15 நிமிடங்கள் காட்டவும்.\n` +
	                       `2. காயம் வீங்குவதற்கு முன் அருகிலுள்ள மோதிரம் அல்லது இறுக்கமான ஆடைகளை அகற்றவும்.\n` +
	                       `3. சுத்தமான மென்மையான துணியால் காயத்தை லேசாக மூடவும்.\n` +
	                       `4. எச்சரிக்கை: எண்ணெய், வெண்ணெய் அல்லது பற்பசை தடவக் கூடாது; கொப்புளம் வந்தால் டாக்டரைப் பார்க்கவும்.`;
	            }
	            return `[பொதுவான முதலுதவி வழிகாட்டல் • ${name}, வயது ${age}]\n` +
	                   `1. ${name}-ஐ அமைதியாகவும் காற்றோட்டமான இடத்திலும் ஓய்வெடுக்க வைக்கவும்.\n` +
	                   `2. ஒவ்வொரு 30 நிமிடங்களுக்கும் உடல் வெப்பநிலை (${t}°F) மற்றும் அறிகுறிகளைக் கண்காணிக்கவும்.\n` +
	                   `3. மருத்துவரின் ஆலோசனையின்றி சுயமாக மருந்துகள் கொடுக்க வேண்டாம்.\n` +
	                   `4. மூச்சுத் திணறல் அல்லது மயக்கம் ஏற்பட்டால் உடனடியாக மருத்துவ உதவி பெறவும்.`;
	        }

	        if (q.includes("fever") || t >= 99.5) {
	            return `[${group} FEVER PROTOCOL • ${name}, ${age}y]\n` +
	                   `1. Dress ${name} in light, breathable cotton clothing; avoid heavy blankets.\n` +
	                   `2. Provide small, frequent sips of ORS or water every 15 minutes to prevent dehydration.\n` +
	                   `3. Sponge forehead with lukewarm water (never use ice or cold water).\n` +
	                   `4. Red Flag: Seek immediate medical care if fever exceeds 102°F or lethargy develops.`;
	        }
	        if (q.includes("burn") || q.includes("hot")) {
	            return `[THERMAL BURN PROTOCOL • ${group} (${age}y)]\n` +
	                   `1. Cool the burn immediately under cool running water for 15 minutes.\n` +
	                   `2. Remove rings, watches, or tight garments near the area before swelling begins.\n` +
	                   `3. Cover loosely with sterile non-stick gauze or clean cotton cloth.\n` +
	                   `4. Never apply butter, oil, ice, or toothpaste; seek medical help if blisters form.`;
	        }
	        return `[UNIVERSAL TRIAGE PROTOCOL • ${group} (${age}y)]\n` +
	               `1. Keep ${name} calm, resting comfortably, and well-hydrated.\n` +
	               `2. Monitor vital signs (Temp: ${t}°F) and symptoms every 30 minutes.\n` +
	               `3. Do not self-administer unprescribed antibiotics or sedatives.\n` +
	               `4. Seek immediate medical evaluation if breathing difficulty or chest pain occurs.`;
	    }

	    init();

	    return {
	        estimateOfflineMetrics,
	        generateGuidance
	    };
	})();
