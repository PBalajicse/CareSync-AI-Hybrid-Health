package caressyncbackend.service;

import caressyncbackend.entity.HealthLog;
import org.springframework.stereotype.Service;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class GoogleEmergencyBridgeService {

    public String buildGoogleMapsHospitalUrl(String ageGroup, String riskLevel) {
        String query = "24 hour emergency hospital near me";
        if ("CHILD".equalsIgnoreCase(ageGroup)) {
            query = "24 hour pediatric emergency hospital near me";
        } else if ("SENIOR".equalsIgnoreCase(ageGroup)) {
            query = "24 hour cardiac and geriatric emergency hospital near me";
        }
        return "https://google.com" +
                URLEncoder.encode(query, StandardCharsets.UTF_8);
    }

    public Map<String, Object> buildGoogleFhirClinicalBundle(HealthLog log) {
        Map<String, Object> bundle = new LinkedHashMap<>();
        bundle.put("resourceType", "CareSyncClinicalBundle");
        bundle.put("standard", "Google-Cloud-Healthcare-FHIR-Lite-v1");
        bundle.put("recordId", log.getId());
        bundle.put("patient", Map.of(
                "name", log.getPatientName(),
                "age", log.getPatientAge(),
                "weightKg", log.getWeightKg(),
                "ageGroup", log.getAgeGroup().name(),
                "knownAllergy", log.getKnownAllergy()
        ));
        bundle.put("clinicalAssessment", Map.of(
                "temperatureF", log.getTemperatureF(),
                "riskLevel", log.getRiskLevel().name(),
                "riskScore", log.getRiskScore(),
                "dailyHydrationMl", log.getDailyHydrationMl(),
                "drugSafetyAlert", log.getInteractionAlert(),
                "dosageGuidance", log.getDosageGuidance()
        ));
        bundle.put("aiTelemetry", Map.of(
                "inferenceMode", log.getAiMode(),
                "googleMapsRoutingUrl", buildGoogleMapsHospitalUrl(log.getAgeGroup().name(), log.getRiskLevel().name()),
                "syncedAt", String.valueOf(log.getSyncedAt())
        ));
        return bundle;
    }
}
