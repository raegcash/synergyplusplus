package com.superapp.marketplace.domain.repository;

import com.superapp.marketplace.domain.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findByCode(String code);

    List<Product> findByStatus(String status);

    List<Product> findByProductType(String productType);

    @Query("SELECT p FROM Product p WHERE p.status = :status ORDER BY p.createdAt DESC")
    List<Product> findByStatusOrderByCreatedAtDesc(String status);

    boolean existsByCode(String code);
}



