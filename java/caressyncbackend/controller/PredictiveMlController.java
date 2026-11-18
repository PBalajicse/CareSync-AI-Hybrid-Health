package caressyncbackend.controller;

import caressyncbackend.service.PredictiveMlAlgorithmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "*")
public class PredictiveMlController {

    @Autowired
    private PredictiveMlAlgorithmService mlService;

    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> runPredictiveMl(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.getOrDefault("patientName", "Aarav (Child)");
        int age = payload.get("age") != null ? Integer.parseInt(payload.get("age").toString()) : 5;
        double tempF = payload.get("tempF") != null ? Double.parseDouble(payload.get("tempF").toString()) : 101.8;
        String symptoms = (String) payload.getOrDefault("symptoms", "High fever and chills");

        return ResponseEntity.ok(mlService.runFullMlInference(name, age, tempF, symptoms));
    }
}
