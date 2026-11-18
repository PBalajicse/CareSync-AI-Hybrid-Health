package caressyncbackend.controller;

import caressyncbackend.entity.FamilyMemberProfile;
import caressyncbackend.service.FamilyHealthHubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/family")
@CrossOrigin(origins = "*")
public class FamilyHubController {

    @Autowired
    private FamilyHealthHubService hubService;

    @PostMapping("/members")
    public ResponseEntity<FamilyMemberProfile> addFamilyMember(@RequestBody FamilyMemberProfile profile) {
        return ResponseEntity.ok(hubService.saveMember(profile));
    }

    @GetMapping("/members")
    public ResponseEntity<List<FamilyMemberProfile>> listMembers() {
        return ResponseEntity.ok(hubService.getAllMembers());
    }

    @GetMapping("/care-plan/{id}")
    public ResponseEntity<Map<String, Object>> getCarePlan(@PathVariable Long id) {
        return ResponseEntity.ok(hubService.getPersonalizedCarePlan(id));
    }
}
