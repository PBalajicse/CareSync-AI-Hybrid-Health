package caressyncbackend.controller;

import caressyncbackend.service.ClinicalRagKnowledgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rag")
@CrossOrigin(origins = "*")
public class GenAiRagController {

    @Autowired
    private ClinicalRagKnowledgeService ragService;

    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> queryGroundedRag(@RequestBody Map<String, Object> payload) {
        String query = (String) payload.getOrDefault("query", "");
        Integer age = payload.get("age") != null ? Integer.parseInt(payload.get("age").toString()) : 5;
        return ResponseEntity.ok(ragService.retrieveVerifiedClinicalContext(query, age));
    }
}
