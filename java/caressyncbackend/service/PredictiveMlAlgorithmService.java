package caressyncbackend.service;

import caressyncbackend.entity.HealthLog;
import caressyncbackend.repository.HealthLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PredictiveMlAlgorithmService {

    @Autowired
    private HealthLogRepository healthRepository;

    // 1. Logistic Regression Sigmoid Probability Classifier
    public double calculateSigmoidCriticalProbability(int age, double tempF, boolean hasRedFlagSymptom) {
        double wAge = (age <= 12 || age >= 60) ? 0.85 : 0.20;
        double wTemp = (tempF - 98.6) * 1.15;
        double wSymptom = hasRedFlagSymptom ? 1.90 : -0.40;
        double bias = -2.40;

        double z = bias + wAge + wTemp + wSymptom;
        double probability = 1.0 / (1.0 + Math.exp(-z));
        return Math.round(probability * 1000.0) / 10.0; // Percentage (0.0% to 100.0%)
    }

    // 2. Ordinary Least Squares (OLS) Linear Regression for 2-Hour Fever Forecast
    public double predictTempInTwoHours(String patientName, double currentTempF) {
        List<HealthLog> history = healthRepository.findAllByOrderBySyncedAtDesc().stream()
                .filter(l -> patientName != null && patientName.equalsIgnoreCase(l.getPatientName()) && l.getTemperatureF() != null)
                .limit(5)
                .toList();

        if (history.size() < 2) {
            return Math.round((currentTempF + (currentTempF > 100.0 ? 0.6 : 0.1)) * 10.0) / 10.0;
        }

        // Reverse to chronological order (x = 0, 1, 2...; y = tempF)
        List<Double> temps = new ArrayList<>();
        for (int i = history.size() - 1; i >= 0; i--) {
            temps.add(history.get(i).getTemperatureF());
        }
        temps.add(currentTempF);

        int n = temps.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += temps.get(i);
            sumXY += i * temps.get(i);
            sumX2 += i * i;
        }

        double slope = (n * sumXY - sumX * sumY) / Math.max((n * sumX2 - sumX * sumX), 1e-5);
        double intercept = (sumY - slope * sumX) / n;
        double predicted = intercept + slope * n;

        // Clamp within physiological bounds
        predicted = Math.max(97.0, Math.min(106.0, predicted));
        return Math.round(predicted * 10.0) / 10.0;
    }

    // 3. Cosine Similarity Vector Matcher for Clinical Symptom Clustering
    public Map<String, Object> computeCosineSimilarityDiagnosis(String symptomText) {
        String input = (symptomText != null) ? symptomText.toLowerCase() : "";
        Map<String, List<String>> clinicalVectors = Map.of(
                "ACUTE_FEBRILE_SYNDROME", List.of("fever", "chills", "temperature", "hot", "shivering", "headache"),
                "HYPOVOLEMIC_DEHYDRATION", List.of("dehydration", "vomit", "dizzy", "weakness", "dry", "thirst"),
                "THERMAL_DERMAL_TRAUMA", List.of("burn", "scald", "blister", "red", "fire", "skin"),
                "RESPIRATORY_DISTRESS", List.of("breath", "cough", "wheezing", "chest", "asthma", "oxygen")
        );

        String bestMatch = "GENERAL_CLINICAL_OBSERVATION";
        double highestScore = 0.0;

        Set<String> inputTokens = new HashSet<>(Arrays.asList(input.split("\\W+")));
        for (Map.Entry<String, List<String>> entry : clinicalVectors.entrySet()) {
            long intersection = entry.getValue().stream().filter(inputTokens::contains).count();
            double cosine = intersection / (Math.sqrt(Math.max(inputTokens.size(), 1)) * Math.sqrt(entry.getValue().size()));
            if (cosine > highestScore) {
                highestScore = cosine;
                bestMatch = entry.getKey();
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("matchedClinicalCluster", bestMatch);
        result.put("cosineSimilarityScore", Math.round(highestScore * 1000.0) / 1000.0);
        return result;
    }

    public Map<String, Object> runFullMlInference(String patientName, int age, double tempF, String symptoms) {
        boolean redFlag = symptoms != null && (symptoms.toLowerCase().contains("breath")
                || symptoms.toLowerCase().contains("chills")
                || symptoms.toLowerCase().contains("bleed")
                || tempF >= 102.0);

        double criticalProb = calculateSigmoidCriticalProbability(age, tempF, redFlag);
        double forecastTemp = predictTempInTwoHours(patientName, tempF);
        Map<String, Object> vectorMatch = computeCosineSimilarityDiagnosis(symptoms);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("mlEngine", "CareSync-PureJava-Predictive-ML-v1");
        response.put("patientName", patientName);
        response.put("sigmoidCriticalProbabilityPct", criticalProb);
        response.put("linearRegression2HrTempForecastF", forecastTemp);
        response.put("vectorClassification", vectorMatch);
        response.put("algorithmsExecuted", List.of(
                "Logistic Sigmoid Risk Classifier",
                "OLS Linear Regression Time-Series Forecaster",
                "Cosine Similarity Clinical Vector Matcher"
        ));
        return response;
    }
}
