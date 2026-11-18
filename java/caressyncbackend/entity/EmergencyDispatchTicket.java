package caressyncbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_dispatches")
public class EmergencyDispatchTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ticketCode;          // e.g., EMS-2026-8492
    private String patientName;
    private String ageGroup;
    private String emergencyType;       // PEDIATRIC_FEVER, CARDIAC_SENIOR, BURN_TRAUMA
    private String assignedHospital;
    private Integer estimatedArrivalMin;
    private String dispatchStatus;      // DISPATCHED, EN_ROUTE, HOSPITAL_NOTIFIED
    private LocalDateTime dispatchedAt;

    @PrePersist
    public void onCreate() {
        this.dispatchedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }

    public String getEmergencyType() { return emergencyType; }
    public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }

    public String getAssignedHospital() { return assignedHospital; }
    public void setAssignedHospital(String assignedHospital) { this.assignedHospital = assignedHospital; }

    public Integer getEstimatedArrivalMin() { return estimatedArrivalMin; }
    public void setEstimatedArrivalMin(Integer estimatedArrivalMin) { this.estimatedArrivalMin = estimatedArrivalMin; }

    public String getDispatchStatus() { return dispatchStatus; }
    public void setDispatchStatus(String dispatchStatus) { this.dispatchStatus = dispatchStatus; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }
}
