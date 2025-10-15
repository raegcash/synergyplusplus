package com.superapp.core.ledger.dto.mapper;

import com.superapp.core.ledger.domain.entity.Transaction;
import com.superapp.core.ledger.domain.entity.TransactionEntry;
import com.superapp.core.ledger.dto.response.TransactionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Transaction entity
 */
@Mapper(componentModel = "spring")
public interface TransactionMapper {

    TransactionResponse toResponse(Transaction transaction);

    @Mapping(target = "accountCode", source = "account.accountCode")
    @Mapping(target = "accountName", source = "account.accountName")
    @Mapping(target = "entryType", source = "entryType")
    TransactionResponse.TransactionEntryResponse toEntryResponse(TransactionEntry entry);
}




