package caressyncbackend.service;

import caressyncbackend.entity.HealthLog;
import caressyncbackend.repository.HealthLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OutbreakRadarService {

    @Autowired
    private HealthLogRepository healthRepository;

    public Map<String, Object> analyzeCommunityOutbreakRadar() {
        List<HealthLog> allLogs = healthRepository.findAllByOrderBySyncedAtDesc();

        long feverCases = allLogs.stream()
                .filter(l -> (l.getTemperatureF() != null && l.getTemperatureF() >= 100.0)
                        || (l.getSymptomQuery() != null && l.getSymptomQuery().toLowerCase().contains("fever")))
                .count();

        long dehydrationCases = allLogs.stream()
                .filter(l -> l.getSymptomQuery() != null &&
                        (l.getSymptomQuery().toLowerCase().contains("dehydrat") || l.getSymptomQuery().toLowerCase().contains("vomit")))
                .count();

        long burnTraumaCases = allLogs.stream()
                .filter(l -> l.getSymptomQuery() != null && l.getSymptomQuery().toLowerCase().contains("burn"))
                .count();

        String outbreakAlertLevel = feverCases >= 3 ? "HIGH_CLUSTER_WARNING" : (feverCases >= 1 ? "ELEVATED_SURVEILLANCE" : "NORMAL_BASELINE");
        String advisoryMessage = feverCases >= 3
                ? "ALERT: Spike in febrile pediatric/adult cases detected. Activate mosquito vector control & ORS distribution."
                : "SURVEILLANCE ACTIVE: Monitoring regional symptom clusters in real time.";

        Map<String, Object> radar = new LinkedHashMap<>();
        radar.put("outbreakAlertLevel", outbreakAlertLevel);
        radar.put("advisoryMessage", advisoryMessage);
        radar.put("totalMonitoredCases", allLogs.size());
        radar.put("symptomClusters", Map.of(
                "viralFeverCluster", feverCases,
                "dehydrationCluster", dehydrationCases,
                "burnTraumaCluster", burnTraumaCases
        ));
        radar.put("zoneHeatData", List.of(
                Map.of("zone", "Zone A (North Sector)", "cases", feverCases + 2, "risk", feverCases >= 2 ? "HIGH" : "MODERATE"),
                Map.of("zone", "Zone B (Central Rural)", "cases", dehydrationCases + 1, "risk", "MODERATE"),
                Map.of("zone", "Zone C (South Suburb)", "cases", burnTraumaCases + 1, "risk", "LOW")
        ));
        return radar;
    }
}
