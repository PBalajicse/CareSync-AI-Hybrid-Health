package caressyncbackend.service;

import caressyncbackend.entity.EmergencyDispatchTicket;
import caressyncbackend.repository.EmergencyDispatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class EmergencyDispatchService {

    @Autowired
    private EmergencyDispatchRepository dispatchRepository;

    public EmergencyDispatchTicket createEmergencyDispatch(String patientName, String ageGroup, String emergencyType) {
        String safeGroup = (ageGroup != null) ? ageGroup.toUpperCase() : "ADULT";
        String safeType = (emergencyType != null) ? emergencyType.toUpperCase() : "GENERAL_EMERGENCY";

        // Smart Hospital & ICU Bed Routing Logic
        String hospital;
        int etaMinutes;

        if ("CHILD".equals(safeGroup)) {
            hospital = "Rainbow Pediatric Emergency & NICU Center (2.4 km)";
            etaMinutes = 8;
        } else if ("SENIOR".equals(safeGroup)) {
            hospital = "Apollo Geriatric & Cardiac Critical Care Unit (3.1 km)";
            etaMinutes = 11;
        } else {
            hospital = "Government General Hospital 24/7 Trauma Wing (1.9 km)";
            etaMinutes = 7;
        }

        int randomCode = ThreadLocalRandom.current().nextInt(1000, 9999);
        EmergencyDispatchTicket ticket = new EmergencyDispatchTicket();
        ticket.setTicketCode("EMS-2026-" + randomCode);
        ticket.setPatientName(patientName != null ? patientName : "Emergency Patient");
        ticket.setAgeGroup(safeGroup);
        ticket.setEmergencyType(safeType);
        ticket.setAssignedHospital(hospital);
        ticket.setEstimatedArrivalMin(etaMinutes);
        ticket.setDispatchStatus("HOSPITAL_NOTIFIED_&_AMBULANCE_DISPATCHED");

        return dispatchRepository.save(ticket);
    }

    public List<EmergencyDispatchTicket> getAllDispatches() {
        return dispatchRepository.findAllByOrderByDispatchedAtDesc();
    }

    public List<Map<String, Object>> getHospitalReadinessStatus() {
        return List.of(
                Map.of("hospital", "Rainbow Pediatric Emergency & NICU", "specialty", "CHILD", "icuBedsAvailable", 4, "distanceKm", 2.4, "status", "READY"),
                Map.of("hospital", "Apollo Geriatric & Cardiac Critical Care", "specialty", "SENIOR", "icuBedsAvailable", 3, "distanceKm", 3.1, "status", "READY"),
                Map.of("hospital", "Govt General 24/7 Trauma & Burn Center", "specialty", "ALL", "icuBedsAvailable", 9, "distanceKm", 1.9, "status", "READY")
        );
    }
}
