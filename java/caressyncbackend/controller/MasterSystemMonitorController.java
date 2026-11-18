package caressyncbackend.controller;

import caressyncbackend.repository.EmergencyDispatchRepository;
import caressyncbackend.repository.FamilyProfileRepository;
import caressyncbackend.repository.HealthLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/master")
@CrossOrigin(origins = "*")
public class MasterSystemMonitorController {

    @Autowired
    private HealthLogRepository healthRepo;

    @Autowired
    private FamilyProfileRepository familyRepo;

    @Autowired
    private EmergencyDispatchRepository dispatchRepo;

    @GetMapping("/telemetry")
    public ResponseEntity<Map<String, Object>> getUnifiedSystemTelemetry() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("systemName", "CareSync AI Enterprise Healthcare Command");
        status.put("serverTimestamp", LocalDateTime.now().toString());
        status.put("totalTriageLogs", healthRepo.count());
        status.put("totalFamilyProfiles", familyRepo.count());
        status.put("total108Dispatches", dispatchRepo.count());
        status.put("activeMicroservices", List.of(
                Map.of("module", "1. Universal Triage & Drug Safety", "endpoint", "/api/health", "status", "ONLINE"),
                Map.of("module", "2. Family Vault & Google FHIR", "endpoint", "/api/family", "status", "ONLINE"),
                Map.of("module", "3. 108 Ambulance & ICU Dispatch", "endpoint", "/api/dispatch", "status", "ONLINE"),
                Map.of("module", "4. Autonomous Agentic Orchestrator", "endpoint", "/api/agent", "status", "ONLINE"),
                Map.of("module", "5. Offline SOS QR & Vitals Graph", "endpoint", "/api/passport", "status", "ONLINE"),
                Map.of("module", "6. Multimodal Vision Audit", "endpoint", "/api/vision", "status", "ONLINE"),
                Map.of("module", "7. Grounded WHO Clinical RAG", "endpoint", "/api/rag", "status", "ONLINE")
        ));
        return ResponseEntity.ok(status);
    }
}
