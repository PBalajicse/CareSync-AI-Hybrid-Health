package caressyncbackend.controller;

import caressyncbackend.dto.HealthSyncRequest;
import caressyncbackend.service.AutonomousClinicalAgentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "*")
public class AgenticCareController {

    @Autowired
    private AutonomousClinicalAgentService agentService;

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> runAutonomousAgent(@RequestBody HealthSyncRequest request) {
        return ResponseEntity.ok(agentService.executeAutonomousCareWorkflow(request));
    }
}
