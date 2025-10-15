package com.superapp.product.investment.dto.mapper;

import com.superapp.product.investment.domain.entity.Portfolio;
import com.superapp.product.investment.dto.response.PortfolioResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PortfolioMapper {

    PortfolioResponse toResponse(Portfolio portfolio);
}




