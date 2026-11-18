package caressyncbackend.service;

import caressyncbackend.entity.HealthLog;
import caressyncbackend.repository.HealthLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VitalsTrendService {

    @Autowired
    private HealthLogRepository repository;

    public String analyzePatientTempTrend(String patientName, Double currentTemp) {
        if (patientName == null || currentTemp == null) {
            return "BASELINE_READING";
        }
        List<HealthLog> allLogs = repository.findAllByOrderBySyncedAtDesc();
        for (HealthLog log : allLogs) {
            if (patientName.equalsIgnoreCase(log.getPatientName()) && log.getTemperatureF() != null) {
                double diff = currentTemp - log.getTemperatureF();
                if (diff >= 1.0) {
                    return String.format("RISING_FAST (+%.1f°F vs last check)", diff);
                } else if (diff <= -1.0) {
                    return String.format("RECOVERING (-%.1f°F vs last check)", Math.abs(diff));
                } else {
                    return "STABLE_VITALS (Within ±0.9°F)";
                }
            }
        }
        return "FIRST_BASELINE_CHECK";
    }
}
