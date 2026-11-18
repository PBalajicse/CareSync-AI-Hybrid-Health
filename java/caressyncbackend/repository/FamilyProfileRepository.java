package caressyncbackend.repository;

import caressyncbackend.entity.FamilyMemberProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FamilyProfileRepository extends JpaRepository<FamilyMemberProfile, Long> {
    List<FamilyMemberProfile> findAllByOrderByCreatedAtDesc();
}
