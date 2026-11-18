package caressyncbackend.controller;

import caressyncbackend.entity.EmergencyDispatchTicket;
import caressyncbackend.service.EmergencyDispatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dispatch")
@CrossOrigin(origins = "*")
public class EmergencyDispatchController {

    @Autowired
    private EmergencyDispatchService dispatchService;

    @PostMapping("/trigger")
    public ResponseEntity<EmergencyDispatchTicket> triggerDispatch(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(dispatchService.createEmergencyDispatch(
                payload.get("patientName"),
                payload.get("ageGroup"),
                payload.get("emergencyType")
        ));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<EmergencyDispatchTicket>> getTickets() {
        return ResponseEntity.ok(dispatchService.getAllDispatches());
    }

    @GetMapping("/hospitals")
    public ResponseEntity<List<Map<String, Object>>> getHospitals() {
        return ResponseEntity.ok(dispatchService.getHospitalReadinessStatus());
    }
}
