package caressyncbackend.service;

import caressyncbackend.dto.HealthSyncRequest;
import caressyncbackend.entity.EmergencyDispatchTicket;
import caressyncbackend.entity.HealthLog;
import caressyncbackend.enums.RiskLevel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AutonomousClinicalAgentService {

    @Autowired
    private HealthLogService healthLogService;

    @Autowired
    private VitalsTrendService vitalsTrendService;

    @Autowired
    private EmergencyDispatchService dispatchService;

    @Autowired
    private GoogleEmergencyBridgeService googleBridgeService;

    public Map<String, Object> executeAutonomousCareWorkflow(HealthSyncRequest request) {
        List<Map<String, String>> agentThoughtSteps = new ArrayList<>();

        // Step 1: Analyze Historical Vitals Trend
        String trend = vitalsTrendService.analyzePatientTempTrend(request.getPatientName(), request.getTemperatureF());
        agentThoughtSteps.add(Map.of(
                "step", "STEP 1: LONGITUDINAL VITALS ANALYSIS",
                "action", "Checked patient temperature progression history.",
                "result", trend
        ));

        // Step 2: Execute Clinical Triage, Hydration & Drug Allergy Screening
        HealthLog savedLog = healthLogService.syncHealthRecord(request);
        agentThoughtSteps.add(Map.of(
                "step", "STEP 2: PHARMACOVIGILANCE & RISK SCORING",
                "action", "Evaluated weight-based hydration, dosage safety, and allergy rules.",
                "result", "Risk Score: " + savedLog.getRiskScore() + "/100 (" + savedLog.getRiskLevel() + ") | " + savedLog.getInteractionAlert()
        ));

        // Step 3: Autonomous Emergency Dispatch if HIGH_EMERGENCY
        EmergencyDispatchTicket autoTicket = null;
        if (savedLog.getRiskLevel() == RiskLevel.HIGH_EMERGENCY) {
            autoTicket = dispatchService.createEmergencyDispatch(
                    savedLog.getPatientName(),
                    savedLog.getAgeGroup().name(),
                    "AUTONOMOUS_AGENT_CRITICAL_ALERT"
            );
            agentThoughtSteps.add(Map.of(
                    "step", "STEP 3: AUTONOMOUS 108 & ICU DISPATCH",
                    "action", "Critical threshold breached! Automatically reserved ICU bed & dispatched ambulance.",
                    "result", "Ticket " + autoTicket.getTicketCode() + " -> " + autoTicket.getAssignedHospital() + " (ETA: " + autoTicket.getEstimatedArrivalMin() + " mins)"
            ));
        } else {
            agentThoughtSteps.add(Map.of(
                    "step", "STEP 3: HOME CARE MONITORING",
                    "action", "Risk within manageable threshold; ambulance dispatch skipped.",
                    "result", "Recommended Hydration: " + savedLog.getDailyHydrationMl() + " ml/day"
            ));
        }

        // Step 4: Generate Google Cloud Healthcare FHIR-Lite Bundle
        Map<String, Object> fhirBundle = googleBridgeService.buildGoogleFhirClinicalBundle(savedLog);
        agentThoughtSteps.add(Map.of(
                "step", "STEP 4: GOOGLE FHIR & FIREBASE CLOUD SYNC",
                "action", "Packaged clinical record into Google FHIR-Lite standard for hospital interoperability.",
                "result", "FHIR Bundle Ready (Record ID #" + savedLog.getId() + ")"
        ));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("agentStatus", "AUTONOMOUS_EXECUTION_COMPLETE");
        response.put("thoughtTrace", agentThoughtSteps);
        response.put("clinicalRecord", savedLog);
        response.put("autoDispatchTicket", autoTicket);
        response.put("googleFhirBundle", fhirBundle);
        return response;
    }
}
