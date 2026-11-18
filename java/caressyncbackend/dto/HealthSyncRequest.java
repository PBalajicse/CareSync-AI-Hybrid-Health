package caressyncbackend.dto;

public class HealthSyncRequest {
    private String patientName;
    private Integer patientAge;
    private Double weightKg;
    private Double temperatureF;
    private String knownAllergy;
    private String symptomQuery;
    private String aiResponse;
    private String aiMode;

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

    public String getSymptomQuery() { return symptomQuery; }
    public void setSymptomQuery(String symptomQuery) { this.symptomQuery = symptomQuery; }

    public String getAiResponse() { return aiResponse; }
    public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }

    public String getAiMode() { return aiMode; }
    public void setAiMode(String aiMode) { this.aiMode = aiMode; }
}
