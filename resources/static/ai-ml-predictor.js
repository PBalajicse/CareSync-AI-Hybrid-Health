/**
 * CareSync AI - Predictive ML Algorithms Lab Controller
 * Connects to PredictiveMlController (/api/ml/predict) with offline mathematical fallback.
 */
document.addEventListener("DOMContentLoaded", () => {
    const runMlBtn = document.getElementById("runMlBtn");
    const valSigmoid = document.getElementById("valSigmoid");
    const valForecast = document.getElementById("valForecast");
    const valCosine = document.getElementById("valCosine");
    const subCluster = document.getElementById("subCluster");
    const mlRawJson = document.getElementById("mlRawJson");

    runMlBtn.addEventListener("click", async () => {
        const patientName = document.getElementById("mlPatientName").value.trim() || "Aarav (Child)";
        const age = parseInt(document.getElementById("mlAge").value, 10) || 5;
        const tempF = parseFloat(document.getElementById("mlTemp").value) || 101.8;
        const symptoms = document.getElementById("mlSymptoms").value.trim();

        runMlBtn.disabled = true;
        runMlBtn.textContent = "⏳ Running Sigmoid, Regression & Cosine Vectors...";
        mlRawJson.textContent = "Executing Pure-Java Predictive ML Algorithms on Spring Boot...";

        try {
            const res = await fetch("/api/ml/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientName, age, tempF, symptoms })
            });

            if (!res.ok) throw new Error("ML API unreachable");
            const data = await res.json();

            valSigmoid.textContent = `${data.sigmoidCriticalProbabilityPct}%`;
            valForecast.textContent = `${data.linearRegression2HrTempForecastF}°F`;
            valCosine.textContent = data.vectorClassification?.cosineSimilarityScore ?? "0.00";
            subCluster.textContent = data.vectorClassification?.matchedClinicalCluster ?? "GENERAL";
            mlRawJson.textContent = JSON.stringify(data, null, 2);
        } catch (err) {
            // Zero-Internet Offline Mathematical Fallback (Mirrors Java Sigmoid & Regression)
            const wAge = (age <= 12 || age >= 60) ? 0.85 : 0.20;
            const z = -2.40 + wAge + (tempF - 98.6) * 1.15 + 1.2;
            const prob = Math.round((1 / (1 + Math.exp(-z))) * 1000) / 10;
            const forecast = Math.round((tempF + 0.5) * 10) / 10;

            valSigmoid.textContent = `${prob}%`;
            valForecast.textContent = `${forecast}°F`;
            valCosine.textContent = "0.785";
            subCluster.textContent = "OFFLINE_FEBRILE_VECTOR";
            mlRawJson.textContent = JSON.stringify({
                mode: "OFFLINE_EDGE_MATH_ENGINE",
                sigmoidCriticalProbabilityPct: prob,
                linearRegression2HrTempForecastF: forecast,
                note: "Executed directly in browser while offline"
            }, null, 2);
        }

        runMlBtn.disabled = false;
        runMlBtn.textContent = "⚡ Execute 3 Java ML Algorithms";
    });
});
