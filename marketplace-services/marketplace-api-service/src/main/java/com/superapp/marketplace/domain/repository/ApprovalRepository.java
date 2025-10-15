package com.superapp.marketplace.domain.repository;

import com.superapp.marketplace.domain.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, UUID> {

    List<Approval> findByStatus(String status);

    List<Approval> findByItemType(String itemType);

    List<Approval> findByStatusAndItemType(String status, String itemType);

    Optional<Approval> findByItemIdAndItemType(UUID itemId, String itemType);

    List<Approval> findByItemIdAndItemTypeAndStatus(UUID itemId, String itemType, String status);
}



