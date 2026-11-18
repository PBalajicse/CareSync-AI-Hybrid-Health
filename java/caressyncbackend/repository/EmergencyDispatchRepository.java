package caressyncbackend.repository;

import caressyncbackend.entity.EmergencyDispatchTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmergencyDispatchRepository extends JpaRepository<EmergencyDispatchTicket, Long> {
    List<EmergencyDispatchTicket> findAllByOrderByDispatchedAtDesc();
}
