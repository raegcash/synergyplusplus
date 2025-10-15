package com.superapp.product.investment.dto.mapper;

import com.superapp.product.investment.domain.entity.Trade;
import com.superapp.product.investment.dto.response.TradeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TradeMapper {

    TradeResponse toResponse(Trade trade);
}




