package com.superapp.core.risk.dto.mapper;

import com.superapp.core.risk.domain.entity.RiskScore;
import com.superapp.core.risk.dto.response.RiskScoreResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RiskScoreMapper {

    RiskScoreResponse toResponse(RiskScore score);
}




