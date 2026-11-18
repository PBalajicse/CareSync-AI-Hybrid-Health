package caressyncbackend.entity;

import caressyncbackend.enums.AgeGroup;
import caressyncbackend.enums.RiskLevel;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_logs")
public class HealthLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientName;
    private Integer patientAge;
    private Double weightKg;
    private Double temperatureF;
    private String knownAllergy;

    @Enumerated(EnumType.STRING)
    private AgeGroup ageGroup;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    private Integer riskScore;
    private Integer dailyHydrationMl;

    @Column(length = 1000)
    private String dosageGuidance;

    @Column(length = 1000)
    private String interactionAlert;

    @Column(length = 1000, nullable = false)
    private String symptomQuery;

    @Column(length = 4000, nullable = false)
    private String aiResponse;

    private String aiMode;
    private LocalDateTime syncedAt;

    @PrePersist
    public void onCreate() {
        this.syncedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getPatientAge() { return patientAge; }
    public void setPatientAge(Integer patientAge) { this.patientAge = patientAge; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public Double getTemperatureF() { return temperatureF; }
    public void setTemperatureF(Double temperatureF) { this.temperatureF = temperatureF; }

    public String getKnownAllergy() { return knownAllergy; }
    public void setKnownAllergy(String knownAllergy) { this.knownAllergy = knownAllergy; }

    public AgeGroup getAgeGroup() { return ageGroup; }
    public void setAgeGroup(AgeGroup ageGroup) { this.ageGroup = ageGroup; }

    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public Integer getDailyHydrationMl() { return dailyHydrationMl; }
    public void setDailyHydrationMl(Integer dailyHydrationMl) { this.dailyHydrationMl = dailyHydrationMl; }

    public String getDosageGuidance() { return dosageGuidance; }
    public void setDosageGuidance(String dosageGuidance) { this.dosageGuidance = dosageGuidance; }

    public String getInteractionAlert() { return interactionAlert; }
    public void setInteractionAlert(String interactionAlert) { this.interactionAlert = interactionAlert; }

    public String getSymptomQuery() { return symptomQuery; }
    public void setSymptomQuery(String symptomQuery) { this.symptomQuery = symptomQuery; }

    public String getAiResponse() { return aiResponse; }
    public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }

    public String getAiMode() { return aiMode; }
    public void setAiMode(String aiMode) { this.aiMode = aiMode; }

    public LocalDateTime getSyncedAt() { return syncedAt; }
    public void setSyncedAt(LocalDateTime syncedAt) { this.syncedAt = syncedAt; }
}
