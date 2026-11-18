package caressyncbackend.service;

import caressyncbackend.dto.DashboardAnalyticsDTO;
import caressyncbackend.dto.HealthSyncRequest;
import caressyncbackend.entity.HealthLog;
import caressyncbackend.enums.AgeGroup;
import caressyncbackend.enums.RiskLevel;
import caressyncbackend.repository.HealthLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HealthLogService {

    @Autowired
    private HealthLogRepository repository;

    @Autowired
    private ClinicalTriageEngine triageEngine;

    @Autowired
    private DrugInteractionService drugInteractionService;

    public HealthLog syncHealthRecord(HealthSyncRequest request) {
        int age = (request.getPatientAge() != null) ? request.getPatientAge() : 25;
        double weight = (request.getWeightKg() != null && request.getWeightKg() > 0) ? request.getWeightKg() : (age <= 12 ? 18.0 : 65.0);
        double temp = (request.getTemperatureF() != null) ? request.getTemperatureF() : 98.6;
        String allergy = (request.getKnownAllergy() != null && !request.getKnownAllergy().isEmpty()) ? request.getKnownAllergy() : "NONE";

        AgeGroup group = triageEngine.classifyAgeGroup(age);
        int score = triageEngine.calculateRiskScore(group, temp, request.getSymptomQuery());
        RiskLevel risk = triageEngine.determineRiskLevel(score);
        int hydrationMl = triageEngine.calculateDailyHydrationMl(group, temp, weight);
        String dosageNote = triageEngine.generateDosageSafetyGuidance(group, age, weight, temp);
        String interactionNote = drugInteractionService.evaluateDrugAndAllergySafety(group, age, allergy, request.getSymptomQuery());

        HealthLog log = new HealthLog();
        log.setPatientName(request.getPatientName() != null ? request.getPatientName() : "Family Member");
        log.setPatientAge(age);
        log.setWeightKg(weight);
        log.setTemperatureF(temp);
        log.setKnownAllergy(allergy);
        log.setAgeGroup(group);
        log.setRiskScore(score);
        log.setRiskLevel(risk);
        log.setDailyHydrationMl(hydrationMl);
        log.setDosageGuidance(dosageNote);
        log.setInteractionAlert(interactionNote);
        log.setSymptomQuery(request.getSymptomQuery());
        log.setAiResponse(request.getAiResponse());
        log.setAiMode(request.getAiMode());

        return repository.save(log);
    }

    public List<HealthLog> getAllHistory() {
        return repository.findAllByOrderBySyncedAtDesc();
    }

    public List<HealthLog> getHighRiskHistory() {
        return repository.findByRiskLevelOrderBySyncedAtDesc(RiskLevel.HIGH_EMERGENCY);
    }

    public DashboardAnalyticsDTO getAnalyticsSummary() {
        DashboardAnalyticsDTO dto = new DashboardAnalyticsDTO();
        dto.setTotalRecords(repository.count());
        dto.setHighRiskCount(repository.countByRiskLevel(RiskLevel.HIGH_EMERGENCY));
        dto.setOfflineInferenceCount(repository.countOfflineInferences());
        dto.setOnlineInferenceCount(repository.countOnlineInferences());
        dto.setChildCasesCount(repository.countByAgeGroup(AgeGroup.CHILD));
        dto.setSeniorCasesCount(repository.countByAgeGroup(AgeGroup.SENIOR));
        return dto;
    }

    public String generateCsvReport() {
        List<HealthLog> logs = repository.findAllByOrderBySyncedAtDesc();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,PatientName,Age,WeightKg,Allergy,AgeGroup,TempF,RiskLevel,RiskScore,HydrationMl,DrugInteractionAlert,DosageGuidance,AIMode,Symptoms,SyncedAt\n");
        for (HealthLog l : logs) {
            csv.append(l.getId()).append(",")
               .append("\"").append(l.getPatientName()).append("\",")
               .append(l.getPatientAge()).append(",")
               .append(l.getWeightKg()).append(",")
               .append(l.getKnownAllergy()).append(",")
               .append(l.getAgeGroup()).append(",")
               .append(l.getTemperatureF()).append(",")
               .append(l.getRiskLevel()).append(",")
               .append(l.getRiskScore()).append(",")
               .append(l.getDailyHydrationMl()).append(",")
               .append("\"").append(l.getInteractionAlert()).append("\",")
               .append("\"").append(l.getDosageGuidance()).append("\",")
               .append(l.getAiMode()).append(",")
               .append("\"").append(l.getSymptomQuery().replace("\"", "'")).append("\",")
               .append(l.getSyncedAt()).append("\n");
        }
        return csv.toString();
    }
}
