package caressyncbackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import caressyncbackend.entity.HealthLog;
import caressyncbackend.enums.AgeGroup;
import caressyncbackend.enums.RiskLevel;

@Repository
public interface HealthLogRepository extends JpaRepository<HealthLog, Long> {

    List<HealthLog> findAllByOrderBySyncedAtDesc();

    List<HealthLog> findByRiskLevelOrderBySyncedAtDesc(RiskLevel riskLevel);

    long countByRiskLevel(RiskLevel riskLevel);

    long countByAgeGroup(AgeGroup ageGroup);

    @Query("SELECT COUNT(h) FROM HealthLog h WHERE h.aiMode LIKE '%OFFLINE%'")
    long countOfflineInferences();

    @Query("SELECT COUNT(h) FROM HealthLog h WHERE h.aiMode LIKE '%ONLINE%'")
    long countOnlineInferences();
}