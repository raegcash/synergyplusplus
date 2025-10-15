package com.superapp.marketplace.domain.repository;

import com.superapp.marketplace.domain.entity.ChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, UUID> {

    List<ChangeRequest> findByStatus(String status);

    List<ChangeRequest> findByProductId(UUID productId);

    List<ChangeRequest> findByProductIdAndStatus(UUID productId, String status);

    List<ChangeRequest> findByChangeType(String changeType);
}



