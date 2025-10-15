package com.superapp.core.ledger.dto.mapper;

import com.superapp.core.ledger.domain.entity.Account;
import com.superapp.core.ledger.dto.request.CreateAccountRequest;
import com.superapp.core.ledger.dto.response.AccountResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Account entity
 */
@Mapper(componentModel = "spring")
public interface AccountMapper {

    AccountResponse toResponse(Account account);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "balance", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    Account toEntity(CreateAccountRequest request);
}




