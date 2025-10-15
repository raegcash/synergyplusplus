package com.superapp.marketplace.domain.repository;

import com.superapp.marketplace.domain.entity.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, UUID> {

    Optional<Partner> findByCode(String code);

    List<Partner> findByStatus(String status);

    List<Partner> findByPartnerType(String partnerType);

    boolean existsByCode(String code);
}



