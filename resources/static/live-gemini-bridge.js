/**
 * CareSync AI - Plug-and-Play Live Google Gemini 2.5 Flash Bridge
 * Automatically upgrades CareSyncAI without touching any existing files!
 */
(function () {
    const GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE";
    const GEMINI_ENDPOINT = "https://googleapis.com";

    async function askLiveGemini(promptText) {
        if (!navigator.onLine || !GEMINI_API_KEY || GEMINI_API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
            return null;
        }
        try {
            const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 450 }
                })
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data?.candidates?.content?.parts?.text?.trim() || null;
        } catch (err) {
            return null;
        }
    }

    // Automatically wrap CareSyncAI.generateGuidance without editing ai-engine.js!
    if (typeof CareSyncAI !== "undefined" && CareSyncAI.generateGuidance) {
        const originalGenerate = CareSyncAI.generateGuidance;
        CareSyncAI.generateGuidance = async function (patientName, age, weightKg, temp, knownAllergy, query, lang) {
            const langNote = lang === "TA" ? "Respond clearly in simple Tamil (தமிழ்)." : "Respond clearly in English.";
            const prompt = `You are CareSync Clinical AI. Patient: ${patientName} (Age ${age}y, Weight ${weightKg}kg, Temp ${temp}°F, Allergy: ${knownAllergy}). ${langNote} Give 4 concise, medically safe, numbered first-aid steps and red-flag warning signs. Symptoms: ${query}`;

            const liveText = await askLiveGemini(prompt);
            if (liveText) {
                return { text: liveText, mode: "ONLINE_LIVE_GEMINI_2.5" };
            }
            return originalGenerate(patientName, age, weightKg, temp, knownAllergy, query, lang);
        };
    }
})();
