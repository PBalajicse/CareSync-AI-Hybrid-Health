package caressyncbackend.service;

import caressyncbackend.enums.AgeGroup;
import caressyncbackend.enums.RiskLevel;
import org.springframework.stereotype.Component;

@Component
public class ClinicalTriageEngine {

    public AgeGroup classifyAgeGroup(Integer age) {
        int safeAge = (age != null && age >= 0) ? age : 25;
        if (safeAge <= 12) return AgeGroup.CHILD;
        if (safeAge >= 60) return AgeGroup.SENIOR;
        return AgeGroup.ADULT;
    }

    public int calculateRiskScore(AgeGroup group, Double tempF, String symptom) {
        double temp = (tempF != null) ? tempF : 98.6;
        String q = (symptom != null) ? symptom.toLowerCase() : "";
        int score = 15;

        if (temp >= 103.0) score += 55;
        else if (temp >= 101.0) score += 35;
        else if (temp >= 99.5) score += 20;

        if (group == AgeGroup.CHILD || group == AgeGroup.SENIOR) {
            score += 15;
        }

        if (q.contains("breath") || q.contains("chest") || q.contains("unconscious") || q.contains("bleed")) {
            score += 30;
        } else if (q.contains("burn") || q.contains("vomit") || q.contains("dizzy")) {
            score += 15;
        }

        return Math.min(score, 100);
    }

    public RiskLevel determineRiskLevel(int riskScore) {
        if (riskScore >= 65) return RiskLevel.HIGH_EMERGENCY;
        if (riskScore >= 35) return RiskLevel.MODERATE;
        return RiskLevel.LOW;
    }

    public int calculateDailyHydrationMl(AgeGroup group, Double tempF, Double weightKg) {
        double temp = (tempF != null) ? tempF : 98.6;
        double weight = (weightKg != null && weightKg > 0) ? weightKg : 20.0;

        int baseMl;
        if (group == AgeGroup.CHILD) {
            // Standard Holliday-Segar pediatric hydration estimation
            baseMl = (int) Math.min(weight * 85, 1800);
        } else if (group == AgeGroup.SENIOR) {
            baseMl = 2000;
        } else {
            baseMl = 2500;
        }

        if (temp > 99.5) {
            baseMl += (int) ((temp - 99.5) * 300);
        }
        return baseMl;
    }

    // General Reference Dosage & Safety Guidance (Always verify with doctor/label)
    public String generateDosageSafetyGuidance(AgeGroup group, Integer age, Double weightKg, Double tempF) {
        int safeAge = (age != null) ? age : 25;
        double temp = (tempF != null) ? tempF : 98.6;

        if (temp < 99.5) {
            return "No antipyretic medicine indicated (Normal temp). Focus on rest and hydration.";
        }
        if (safeAge < 2) {
            return "INFANT SAFETY ALERT (<2 yrs): Do NOT give OTC fever medicine without immediate pediatrician consultation.";
        }
        if (group == AgeGroup.CHILD) {
            double wt = (weightKg != null && weightKg > 0) ? weightKg : 18.0;
            return String.format("Pediatric Reference (Weight %.1f kg): Consult doctor/check label for weight-based pediatric acetaminophen/paracetamol (max 4 doses/24h). Avoid aspirin.", wt);
        }
        if (group == AgeGroup.SENIOR) {
            return "Geriatric Reference: Standard adult OTC acetaminophen/paracetamol (500mg, max 3000mg/24h for seniors) ONLY if no liver/kidney issues. Verify with physician.";
        }
        return "Adult Reference: Standard OTC acetaminophen/paracetamol (500mg–650mg every 6h, max 4000mg/24h). Check physical medicine label & consult doctor.";
    }
}
