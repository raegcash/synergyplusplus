package com.superapp.product.investment.repository;

import com.superapp.product.investment.domain.entity.Position;
import com.superapp.product.investment.domain.enums.PositionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PositionRepository extends JpaRepository<Position, UUID> {
    
    Optional<Position> findByIdAndPortfolioId(UUID id, UUID portfolioId);
    
    List<Position> findByPortfolioIdAndStatus(UUID portfolioId, PositionStatus status);
    
    List<Position> findByPortfolioId(UUID portfolioId);
}




