package caressyncbackend.controller;

import caressyncbackend.service.OutbreakRadarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/outbreak")
@CrossOrigin(origins = "*")
public class OutbreakRadarController {

    @Autowired
    private OutbreakRadarService radarService;

    @GetMapping("/radar")
    public ResponseEntity<Map<String, Object>> getLiveOutbreakRadar() {
        return ResponseEntity.ok(radarService.analyzeCommunityOutbreakRadar());
    }
}
