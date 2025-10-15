package com.superapp.product.investment.dto.mapper;

import com.superapp.product.investment.domain.entity.Position;
import com.superapp.product.investment.dto.response.PositionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PositionMapper {

    PositionResponse toResponse(Position position);
}




