package caressyncbackend.controller;

import caressyncbackend.service.VisionPharmacovigilanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vision")
@CrossOrigin(origins = "*")
public class VisionAuditController {

    @Autowired
    private VisionPharmacovigilanceService visionService;

    @PostMapping("/audit")
    public ResponseEntity<Map<String, Object>> auditVisionScan(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.getOrDefault("patientName", "Patient");
        Integer age = payload.get("age") != null ? Integer.parseInt(payload.get("age").toString()) : 5;
        String allergy = (String) payload.getOrDefault("knownAllergy", "NONE");
        String category = (String) payload.getOrDefault("scanCategory", "MEDICINE_BOTTLE");
        String summary = (String) payload.getOrDefault("detectedSummary", "");

        return ResponseEntity.ok(visionService.auditScannedMedicineOrInjury(name, age, allergy, category, summary));
    }
}
