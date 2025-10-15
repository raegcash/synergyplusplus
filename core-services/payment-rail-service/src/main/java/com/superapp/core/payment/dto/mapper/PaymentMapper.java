package com.superapp.core.payment.dto.mapper;

import com.superapp.core.payment.domain.entity.PaymentTransaction;
import com.superapp.core.payment.dto.response.PaymentTransactionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * Payment transaction mapper
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentMapper {

    PaymentTransactionResponse toResponse(PaymentTransaction transaction);
}




