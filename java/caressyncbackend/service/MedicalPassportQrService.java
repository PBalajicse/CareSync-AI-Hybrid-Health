package caressyncbackend.service;

import caressyncbackend.entity.FamilyMemberProfile;
import caressyncbackend.entity.HealthLog;
import caressyncbackend.repository.FamilyProfileRepository;
import caressyncbackend.repository.HealthLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MedicalPassportQrService {

    @Autowired
    private FamilyProfileRepository familyRepository;

    @Autowired
    private HealthLogRepository healthLogRepository;

    public Map<String, Object> generateOfflinePassportPayload(String patientName) {
        String target = (patientName != null && !patientName.isBlank()) ? patientName.trim() : "Aarav (Child)";

        FamilyMemberProfile profile = familyRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(m -> m.getFullName() != null && m.getFullName().toLowerCase().contains(target.toLowerCase()))
                .findFirst()
                .orElse(null);

        HealthLog latestLog = healthLogRepository.findAllByOrderBySyncedAtDesc().stream()
                .filter(h -> h.getPatientName() != null && h.getPatientName().toLowerCase().contains(target.toLowerCase()))
                .findFirst()
                .orElse(null);

        Map<String, Object> passport = new LinkedHashMap<>();
        passport.put("passportStandard", "CARESYNC-OFFLINE-SOS-V1");
        passport.put("patientName", profile != null ? profile.getFullName() : target);
        passport.put("bloodGroup", profile != null ? profile.getBloodGroup() : "O+");
        passport.put("age", profile != null ? profile.getAge() : (latestLog != null ? latestLog.getPatientAge() : 5));
        passport.put("weightKg", profile != null ? profile.getWeightKg() : (latestLog != null ? latestLog.getWeightKg() : 18.0));
        passport.put("chronicConditions", profile != null ? profile.getChronicNotes() : "None");
        passport.put("knownAllergy", latestLog != null ? latestLog.getKnownAllergy() : "NONE");
        passport.put("latestTempF", latestLog != null ? latestLog.getTemperatureF() : 98.6);
        passport.put("latestRiskLevel", latestLog != null ? latestLog.getRiskLevel().name() : "LOW");
        passport.put("emergencyContact", "108 National Ambulance / CareSync Vault");

        String qrCompactText = String.format(
                "CARESYNC SOS PASSPORT\nName: %s | Blood: %s | Age: %sy (%skg)\nAllergy: %s | Chronic: %s\nLast Temp: %s°F (%s)\nDial 108 for Emergency",
                passport.get("patientName"),
                passport.get("bloodGroup"),
                passport.get("age"),
                passport.get("weightKg"),
                passport.get("knownAllergy"),
                passport.get("chronicConditions"),
                passport.get("latestTempF"),
                passport.get("latestRiskLevel")
        );
        passport.put("qrCompactText", qrCompactText);
        return passport;
    }

    public List<Map<String, Object>> getVitalsTimeSeries() {
        return healthLogRepository.findAllByOrderBySyncedAtDesc().stream()
                .limit(10)
                .map(log -> {
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("patient", log.getPatientName());
                    point.put("tempF", log.getTemperatureF());
                    point.put("riskScore", log.getRiskScore());
                    point.put("aiMode", log.getAiMode());
                    point.put("time", log.getSyncedAt() != null ? log.getSyncedAt().toLocalTime().withNano(0).toString() : "Now");
                    return point;
                })
                .toList();
    }
}
