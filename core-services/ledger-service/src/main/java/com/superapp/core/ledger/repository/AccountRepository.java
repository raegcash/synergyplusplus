package com.superapp.core.ledger.repository;

import com.superapp.core.ledger.domain.entity.Account;
import com.superapp.core.ledger.domain.enums.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Account Repository
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByAccountCode(String accountCode);

    List<Account> findByTenantId(String tenantId);

    List<Account> findByTenantIdAndAccountType(String tenantId, AccountType accountType);

    List<Account> findByUserId(UUID userId);

    Optional<Account> findByUserIdAndCurrency(UUID userId, String currency);

    List<Account> findByTenantIdAndIsActive(String tenantId, Boolean isActive);

    boolean existsByAccountCode(String accountCode);

    @Query("SELECT a FROM Account a WHERE a.tenantId = :tenantId AND a.accountType IN :types")
    List<Account> findByTenantIdAndAccountTypes(String tenantId, List<AccountType> types);

    long countByTenantId(String tenantId);
}




