package com.superapp.core.ledger.domain.enums;

/**
 * Account types based on standard accounting principles
 */
public enum AccountType {
    /**
     * Assets - resources owned (debit normal balance)
     * e.g., Cash, Bank Accounts, User Wallets, Investments
     */
    ASSET,

    /**
     * Liabilities - obligations owed (credit normal balance)
     * e.g., Loans Payable, Accounts Payable
     */
    LIABILITY,

    /**
     * Equity - owner's interest (credit normal balance)
     * e.g., Capital, Retained Earnings
     */
    EQUITY,

    /**
     * Revenue - income earned (credit normal balance)
     * e.g., Fees, Interest Income, Commission Income
     */
    REVENUE,

    /**
     * Expenses - costs incurred (debit normal balance)
     * e.g., Operating Expenses, Interest Expense, Fees Paid
     */
    EXPENSE
}




