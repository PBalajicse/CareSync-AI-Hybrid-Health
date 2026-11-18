package caressyncbackend.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class VisionPharmacovigilanceService {

    public Map<String, Object> auditScannedMedicineOrInjury(
            String patientName,
            Integer age,
            String knownAllergy,
            String scanCategory,
            String detectedSummary) {

        int safeAge = (age != null) ? age : 25;
        String allergy = (knownAllergy != null) ? knownAllergy.toUpperCase() : "NONE";
        String summaryLower = (detectedSummary != null) ? detectedSummary.toLowerCase() : "";

        boolean conflictDetected = false;
        String safetyVerdict = "VERIFIED SAFE FOR FIRST-AID REFERENCE";

        if ("MEDICINE_BOTTLE".equalsIgnoreCase(scanCategory)) {
            if (safeAge < 16 && summaryLower.contains("aspirin")) {
                conflictDetected = true;
                safetyVerdict = "DANGER: Aspirin detected! Strictly contraindicated for children (<16 yrs) due to Reye's syndrome risk.";
            } else if (!"NONE".equals(allergy) && summaryLower.contains(allergy.toLowerCase())) {
                conflictDetected = true;
                safetyVerdict = "ALLERGY MATCH DANGER: Scanned label matches patient's known " + allergy + " allergy! Do NOT administer.";
            } else if (safeAge < 2) {
                conflictDetected = true;
                safetyVerdict = "INFANT WARNING (<2 yrs): Consult pediatrician before administering any scanned oral medication.";
            }
        } else if ("SKIN_BURN_INJURY".equalsIgnoreCase(scanCategory)) {
            if (summaryLower.contains("blister") || summaryLower.contains("deep") || summaryLower.contains("severe")) {
                conflictDetected = true;
                safetyVerdict = "HIGH PRIORITY WOUND: Blistering/deep burn detected. Cool with running water 15 mins & visit 24/7 hospital.";
            } else {
                safetyVerdict = "SUPERFICIAL FIRST-AID: Cool gently with clean water, cover with sterile gauze, monitor for infection.";
            }
        }

        Map<String, Object> auditResult = new LinkedHashMap<>();
        auditResult.put("patientName", patientName != null ? patientName : "Patient");
        auditResult.put("scanCategory", scanCategory);
        auditResult.put("conflictDetected", conflictDetected);
        auditResult.put("safetyVerdict", safetyVerdict);
        auditResult.put("auditedAt", LocalDateTime.now().toString());
        return auditResult;
    }
}
