package caressyncbackend.controller;

import caressyncbackend.dto.DashboardAnalyticsDTO;
import caressyncbackend.dto.HealthSyncRequest;
import caressyncbackend.entity.HealthLog;
import caressyncbackend.service.GoogleEmergencyBridgeService;
import caressyncbackend.service.HealthLogService;
import caressyncbackend.service.VitalsTrendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthLogController {

    @Autowired
    private HealthLogService service;

    @Autowired
    private VitalsTrendService trendService;

    @Autowired
    private GoogleEmergencyBridgeService googleBridgeService;

    @PostMapping("/sync")
    public ResponseEntity<HealthLog> syncRecord(@RequestBody HealthSyncRequest request) {
        return ResponseEntity.ok(service.syncHealthRecord(request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<HealthLog>> getHistory() {
        return ResponseEntity.ok(service.getAllHistory());
    }

    @GetMapping("/high-risk")
    public ResponseEntity<List<HealthLog>> getHighRiskRecords() {
        return ResponseEntity.ok(service.getHighRiskHistory());
    }

    @GetMapping("/analytics")
    public ResponseEntity<DashboardAnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(service.getAnalyticsSummary());
    }

    @GetMapping("/trend")
    public ResponseEntity<Map<String, String>> getPatientTrend(
            @RequestParam String name,
            @RequestParam Double temp) {
        String trend = trendService.analyzePatientTempTrend(name, temp);
        return ResponseEntity.ok(Map.of("patientName", name, "trendStatus", trend));
    }

    @GetMapping("/google-fhir/{id}")
    public ResponseEntity<Map<String, Object>> getGoogleFhirBundle(@PathVariable Long id) {
        return service.getAllHistory().stream()
                .filter(log -> log.getId().equals(id))
                .findFirst()
                .map(log -> ResponseEntity.ok(googleBridgeService.buildGoogleFhirClinicalBundle(log)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csvBytes = service.generateCsvReport().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=CareSync_Clinical_Audit.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
