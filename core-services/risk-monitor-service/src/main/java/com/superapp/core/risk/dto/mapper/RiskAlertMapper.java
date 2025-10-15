package com.superapp.core.risk.dto.mapper;

import com.superapp.core.risk.domain.entity.RiskAlert;
import com.superapp.core.risk.dto.response.RiskAlertResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RiskAlertMapper {

    RiskAlertResponse toResponse(RiskAlert alert);
}




