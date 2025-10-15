package com.superapp.marketplace.domain.repository;

import com.superapp.marketplace.domain.entity.Greylist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GreylistRepository extends JpaRepository<Greylist, UUID> {

    List<Greylist> findByListType(String listType);

    List<Greylist> findByProductId(UUID productId);

    List<Greylist> findByListTypeAndStatus(String listType, String status);

    List<Greylist> findByUserIdAndProductId(UUID userId, UUID productId);

    List<Greylist> findByMsisdn(String msisdn);
}



