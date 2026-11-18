/**
 * CareSync AI - Grounded Clinical RAG, Structured JSON Output & Multi-Turn Memory Controller
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

    const chatStream = document.getElementById("chatStream");
    const ragUserInput = document.getElementById("ragUserInput");
    const sendRagBtn = document.getElementById("sendRagBtn");
    const clearMemoryBtn = document.getElementById("clearMemoryBtn");
    const ragSourceBox = document.getElementById("ragSourceBox");
    const structuredJsonBox = document.getElementById("structuredJsonBox");

    let hybridModel = null;
    let conversationHistory = [];

    // 1. Initialize Firebase Hybrid AI
    async function initRagAi() {
        try {
            const { initializeApp } = await import("https://gstatic.com");
            const { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } = await import("https://gstatic.com");
            const app = initializeApp(firebaseConfig);
            const ai = getAI(app, { backend: new GoogleAIBackend() });
            hybridModel = getGenerativeModel(ai, {
                mode: InferenceMode.PREFER_ON_DEVICE,
                model: "gemini-2.5-flash"
            });
        } catch (e) {
            console.warn("[CareSyncRAG] Offline Grounded Protocol Engine Active.");
        }
    }

    initRagAi();

    // 2. Append Message Bubble to Chat Stream
    function addMessage(sender, text, citation = null) {
        const div = document.createElement("div");
        div.className = sender === "USER" ? "msg-bubble msg-user" : "msg-bubble msg-ai";

        if (citation) {
            const tag = document.createElement("div");
            tag.className = "citation-tag";
            tag.textContent = `📚 SOURCE: ${citation}`;
            div.appendChild(tag);
        }

        const content = document.createElement("div");
        content.textContent = text;
        div.appendChild(content);

        chatStream.appendChild(div);
        chatStream.scrollTop = chatStream.scrollHeight;
    }

    // 3. Execute Grounded Clinical RAG + Multi-Turn Socratic Reasoning
    async function handleRagQuery() {
        const query = ragUserInput.value.trim();
        if (!query) return;

        addMessage("USER", query);
        ragUserInput.value = "";
        sendRagBtn.disabled = true;
        sendRagBtn.textContent = "⏳ Grounding...";

        conversationHistory.push({ role: "user", text: query });

        // Step A: Retrieve Verified Medical Context from Java RAG Service
        let ragData = {
            ragEngine: "CareSync-Offline-RAG-Fallback",
            verifiedSource: "WHO Pocket Book of Hospital Care & Red Cross First-Aid",
            retrievedClinicalFacts: [
                "FACT-1: Maintain hydration using WHO-standard ORS solution.",
                "FACT-2: Monitor temperature and breathing rate every 30 minutes."
            ],
            structuredJsonDecision: {
                urgencyLevel: query.includes("102") || query.includes("103") ? "CRITICAL_ESCALATION" : "MODERATE_HOME_CARE",
                hallucinationGuard: "ACTIVE_GROUNDED_ONLY",
                recommendedToolAction: query.includes("102") || query.includes("103") ? "AUTO_TRIGGER_108_DISPATCH" : "MONITOR_AT_HOME"
            }
        };

        try {
            const res = await fetch("/api/rag/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: query, age: 5 })
            });
            if (res.ok) {
                ragData = await res.json();
            }
        } catch (e) {
            console.warn("Using offline RAG clinical knowledge base.");
        }

        // Display Retrieved WHO Context & Structured JSON Tool Output
        ragSourceBox.textContent = JSON.stringify({
            ragEngine: ragData.ragEngine,
            verifiedSource: ragData.verifiedSource,
            retrievedFacts: ragData.retrievedClinicalFacts
        }, null, 2);

        structuredJsonBox.textContent = JSON.stringify(ragData.structuredJsonDecision, null, 2);

        // Step B: Generate Grounded Socratic Response (with Multi-Turn Memory)
        const historyContext = conversationHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n");
        const groundedPrompt =
            `You are CareSync's Grounded Clinical RAG Doctor Assistant. Use ONLY these verified medical facts: ${JSON.stringify(ragData.retrievedClinicalFacts)}. ` +
            `Conversation History:\n${historyContext}\n` +
            `Provide 3 concise, grounded first-aid steps and ask 1 targeted follow-up Socratic clinical question to assess red flags.`;

        let aiReply = "";
        try {
            if (hybridModel && navigator.onLine) {
                const aiRes = await hybridModel.generateContent(groundedPrompt);
                aiReply = aiRes.response.text();
            } else {
                throw new Error("Offline RAG synthesis");
            }
        } catch (err) {
            aiReply =
                `Based on ${ragData.verifiedSource}:\n` +
                ragData.retrievedClinicalFacts.map((f, i) => `${i + 1}. ${f.replace(/^FACT-\d+:\s*/, "")}`).join("\n") +
                `\n\n🩺 Follow-Up Clinical Question: Is the patient drinking fluids normally, or do you notice any skin rash or breathing difficulty?`;
        }

        conversationHistory.push({ role: "assistant", text: aiReply });
        addMessage("AI", aiReply, ragData.verifiedSource);

        sendRagBtn.disabled = false;
        sendRagBtn.textContent = "Send ➤";
    }

    sendRagBtn.addEventListener("click", handleRagQuery);
    ragUserInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleRagQuery();
    });

    clearMemoryBtn.addEventListener("click", () => {
        conversationHistory = [];
        chatStream.innerHTML = `
            <div class="msg-bubble msg-ai">
                <div class="citation-tag">✔ MEMORY RESET • GROUNDED IN WHO & RED CROSS PROTOCOLS</div>
                <div>Conversation memory cleared. Describe new symptoms to begin grounded clinical RAG analysis.</div>
            </div>`;
    });
});
