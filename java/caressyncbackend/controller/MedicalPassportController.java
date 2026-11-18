package caressyncbackend.controller;

import caressyncbackend.service.MedicalPassportQrService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/passport")
@CrossOrigin(origins = "*")
public class MedicalPassportController {

    @Autowired
    private MedicalPassportQrService passportService;

    @GetMapping("/generate")
    public ResponseEntity<Map<String, Object>> getOfflineQrPassport(
            @RequestParam(defaultValue = "Aarav") String name) {
        return ResponseEntity.ok(passportService.generateOfflinePassportPayload(name));
    }

    @GetMapping("/vitals-series")
    public ResponseEntity<List<Map<String, Object>>> getVitalsSeries() {
        return ResponseEntity.ok(passportService.getVitalsTimeSeries());
    }
}
