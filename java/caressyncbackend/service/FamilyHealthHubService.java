package caressyncbackend.service;

import caressyncbackend.entity.FamilyMemberProfile;
import caressyncbackend.repository.FamilyProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FamilyHealthHubService {

    @Autowired
    private FamilyProfileRepository profileRepository;

    public FamilyMemberProfile saveMember(FamilyMemberProfile profile) {
        return profileRepository.save(profile);
    }

    public List<FamilyMemberProfile> getAllMembers() {
        return profileRepository.findAllByOrderByCreatedAtDesc();
    }

    public Map<String, Object> getPersonalizedCarePlan(Long memberId) {
        FamilyMemberProfile m = profileRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Family member not found"));

        Map<String, Object> plan = new LinkedHashMap<>();
        plan.put("memberName", m.getFullName());
        plan.put("bloodGroup", m.getBloodGroup());
        plan.put("age", m.getAge());

        if (m.getAge() != null && m.getAge() <= 12) {
            plan.put("careCategory", "PEDIATRIC_WELLNESS");
            plan.put("emergencyChecklist", List.of(
                    "Keep pediatric ORS packets and digital thermometer ready.",
                    "Avoid Aspirin or adult fever syrups.",
                    "Maintain immunization & growth weight log every 3 months."
            ));
        } else if (m.getAge() != null && m.getAge() >= 60) {
            plan.put("careCategory", "GERIATRIC_MONITORING");
            plan.put("emergencyChecklist", List.of(
                    "Monitor Blood Pressure & Blood Sugar weekly.",
                    "Keep emergency cardiac/diabetes medicine list printed.",
                    "Ensure adequate daily hydration (2000ml+ unless restricted)."
            ));
        } else {
            plan.put("careCategory", "ADULT_PREVENTIVE_CARE");
            plan.put("emergencyChecklist", List.of(
                    "Annual full-body blood panel & blood pressure check.",
                    "Keep first-aid burn & antiseptic kit accessible at home."
            ));
        }
        return plan;
    }
}
