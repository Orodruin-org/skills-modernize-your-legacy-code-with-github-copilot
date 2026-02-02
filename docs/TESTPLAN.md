# Test Plan - Account Management System

## Overview
This test plan covers the business logic for the Account Management System that manages account balance operations including viewing balance, crediting accounts, and debiting accounts.

**Initial State**: All tests assume an initial account balance of $1000.00 unless otherwise specified.

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-001 | View initial account balance | Account initialized with default balance | 1. Launch application<br>2. Select option 1 (View Balance) | System displays "Current balance: 1000.00" | | | Tests initial balance display |
| TC-002 | Credit account with valid amount | Account balance is $1000.00 | 1. Launch application<br>2. Select option 2 (Credit Account)<br>3. Enter amount: 500.00 | System displays "Amount credited. New balance: 1500.00"<br>Balance updated to $1500.00 | | | Tests successful credit operation |
| TC-003 | Credit account with small amount | Account balance is $1000.00 | 1. Launch application<br>2. Select option 2 (Credit Account)<br>3. Enter amount: 0.01 | System displays "Amount credited. New balance: 1000.01"<br>Balance updated to $1000.01 | | | Tests minimum credit amount |
| TC-004 | Credit account with large amount | Account balance is $1000.00 | 1. Launch application<br>2. Select option 2 (Credit Account)<br>3. Enter amount: 99999.99 | System displays "Amount credited. New balance: 100999.99"<br>Balance updated to $100999.99 | | | Tests maximum credit amount within limit |
| TC-005 | Credit account with zero amount | Account balance is $1000.00 | 1. Launch application<br>2. Select option 2 (Credit Account)<br>3. Enter amount: 0.00 | System displays "Amount credited. New balance: 1000.00"<br>Balance remains $1000.00 | | | Tests zero credit amount |
| TC-006 | Multiple consecutive credits | Account balance is $1000.00 | 1. Launch application<br>2. Select option 2 (Credit Account)<br>3. Enter amount: 250.00<br>4. Select option 2 again<br>5. Enter amount: 750.00 | After first credit: Balance = $1250.00<br>After second credit: Balance = $2000.00 | | | Tests cumulative credit operations |
| TC-007 | Debit account with valid amount (sufficient funds) | Account balance is $1000.00 | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 300.00 | System displays "Amount debited. New balance: 700.00"<br>Balance updated to $700.00 | | | Tests successful debit operation |
| TC-008 | Debit exact account balance | Account balance is $1000.00 | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 1000.00 | System displays "Amount debited. New balance: 0.00"<br>Balance updated to $0.00 | | | Tests boundary condition - exact balance debit |
| TC-009 | Debit account with insufficient funds | Account balance is $1000.00 | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 1500.00 | System displays "Insufficient funds for this debit."<br>Balance remains $1000.00 | | | Tests overdraft prevention |
| TC-010 | Debit account with amount exceeding balance by small margin | Account balance is $1000.00 | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 1000.01 | System displays "Insufficient funds for this debit."<br>Balance remains $1000.00 | | | Tests insufficient funds check precision |
| TC-011 | Debit account with small amount | Account balance is $1000.00 | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 0.01 | System displays "Amount debited. New balance: 999.99"<br>Balance updated to $999.99 | | | Tests minimum debit amount |
| TC-012 | Debit account with zero amount | Account balance is $1000.00 | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 0.00 | System displays "Amount debited. New balance: 1000.00"<br>Balance remains $1000.00 | | | Tests zero debit amount |
| TC-013 | Multiple consecutive debits (sufficient funds) | Account balance is $1000.00 | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 200.00<br>4. Select option 3 again<br>5. Enter amount: 300.00 | After first debit: Balance = $800.00<br>After second debit: Balance = $500.00 | | | Tests cumulative debit operations |
| TC-014 | Multiple debits until insufficient funds | Account balance is $1000.00 | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 600.00<br>4. Select option 3 again<br>5. Enter amount: 600.00 | After first debit: Balance = $400.00<br>After second debit attempt: "Insufficient funds" message, Balance remains $400.00 | | | Tests insufficient funds after partial depletion |
| TC-015 | Credit and debit sequence | Account balance is $1000.00 | 1. Launch application<br>2. Select option 2 (Credit Account)<br>3. Enter amount: 500.00<br>4. Select option 3 (Debit Account)<br>5. Enter amount: 750.00 | After credit: Balance = $1500.00<br>After debit: Balance = $750.00 | | | Tests combined operations |
| TC-016 | View balance after credit operation | Account balance is $1000.00, credit $200.00 performed | 1. Launch application<br>2. Select option 2 (Credit Account)<br>3. Enter amount: 200.00<br>4. Select option 1 (View Balance) | System displays "Current balance: 1200.00" | | | Tests balance persistence after credit |
| TC-017 | View balance after debit operation | Account balance is $1000.00, debit $300.00 performed | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 300.00<br>4. Select option 1 (View Balance) | System displays "Current balance: 700.00" | | | Tests balance persistence after debit |
| TC-018 | View balance after failed debit | Account balance is $1000.00, debit $1500.00 attempted | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 1500.00<br>4. Select option 1 (View Balance) | System displays "Current balance: 1000.00" | | | Tests balance unchanged after failed debit |
| TC-019 | Select invalid menu option (0) | Application running | 1. Launch application<br>2. Enter choice: 0 | System displays "Invalid choice, please select 1-4."<br>Menu displayed again | | | Tests input validation for out-of-range low |
| TC-020 | Select invalid menu option (5) | Application running | 1. Launch application<br>2. Enter choice: 5 | System displays "Invalid choice, please select 1-4."<br>Menu displayed again | | | Tests input validation for out-of-range high |
| TC-021 | Select invalid menu option (non-numeric) | Application running | 1. Launch application<br>2. Enter choice: A (or any non-numeric) | System handles invalid input appropriately | | | Tests input validation for non-numeric input |
| TC-022 | Exit application (option 4) | Application running | 1. Launch application<br>2. Select option 4 (Exit) | System displays "Exiting the program. Goodbye!"<br>Application terminates | | | Tests clean exit functionality |
| TC-023 | Menu redisplay after operation | Application running | 1. Launch application<br>2. Select option 1 (View Balance)<br>3. Observe screen | After displaying balance, menu is displayed again | | | Tests menu loop functionality |
| TC-024 | Data persistence - read after write (credit) | Account balance is $1000.00 | 1. Credit $500.00<br>2. Call DataProgram with 'READ' operation | Balance returned is $1500.00 | | | Tests data storage consistency for credit |
| TC-025 | Data persistence - read after write (debit) | Account balance is $1000.00 | 1. Debit $300.00<br>2. Call DataProgram with 'READ' operation | Balance returned is $700.00 | | | Tests data storage consistency for debit |
| TC-026 | Maximum balance limit | Account balance is $900000.00 | 1. Launch application<br>2. Select option 2 (Credit Account)<br>3. Enter amount: 99999.99 | System behavior when approaching/exceeding max balance (999999.99) | | | Tests balance upper limit handling |
| TC-027 | Decimal precision - credit operation | Account balance is $1000.00 | 1. Launch application<br>2. Select option 2 (Credit Account)<br>3. Enter amount: 123.45 | System displays "Amount credited. New balance: 1123.45"<br>Decimal precision maintained | | | Tests decimal handling in credit |
| TC-028 | Decimal precision - debit operation | Account balance is $1000.00 | 1. Launch application<br>2. Select option 3 (Debit Account)<br>3. Enter amount: 67.89 | System displays "Amount debited. New balance: 932.11"<br>Decimal precision maintained | | | Tests decimal handling in debit |
| TC-029 | Complex operation sequence | Account balance is $1000.00 | 1. View Balance<br>2. Credit $250.50<br>3. View Balance<br>4. Debit $100.25<br>5. View Balance<br>6. Credit $50.00<br>7. View Balance | Final balance: $1200.25<br>All intermediate balances correct | | | Tests extended operation sequence |
| TC-030 | Rapid consecutive operations | Account balance is $1000.00 | 1. Perform 10 consecutive credits of $10.00 each<br>2. View balance | Final balance: $1100.00 | | | Tests system stability with multiple operations |

---

## Test Coverage Summary

### Functional Areas Covered:
1. **Balance Display**: TC-001, TC-016, TC-017, TC-018
2. **Credit Operations**: TC-002, TC-003, TC-004, TC-005, TC-006, TC-027
3. **Debit Operations**: TC-007, TC-008, TC-009, TC-010, TC-011, TC-012, TC-013, TC-014, TC-028
4. **Combined Operations**: TC-015, TC-029, TC-030
5. **Input Validation**: TC-019, TC-020, TC-021
6. **Application Control Flow**: TC-022, TC-023
7. **Data Persistence**: TC-024, TC-025
8. **Boundary Conditions**: TC-008, TC-009, TC-010, TC-026
9. **Decimal Precision**: TC-027, TC-028

### Business Rules Validated:
- Initial balance is $1000.00
- Credits add to the current balance
- Debits subtract from the current balance only if sufficient funds exist
- Insufficient funds prevent debit operations and preserve current balance
- Balance is persisted across operations
- Decimal precision to 2 places is maintained
- Balance range: 0.00 to 999999.99
- Menu provides 4 options: View Balance, Credit, Debit, Exit
- Invalid menu selections prompt user to re-select
- Application continues in a loop until exit is selected

---

## Notes for Node.js Implementation

When implementing unit and integration tests for the Node.js version:

1. **Unit Tests**: Focus on individual functions for credit, debit, and balance retrieval
2. **Integration Tests**: Test the interaction between data storage and operations modules
3. **Mock Data**: Create test fixtures with known initial states
4. **Edge Cases**: Pay special attention to:
   - Floating-point arithmetic precision
   - Boundary values (zero balance, maximum balance)
   - Negative amount inputs (if not handled by input validation)
   - Concurrent operations (if multi-user support is added)
5. **Test Framework**: Consider using Jest, Mocha, or similar Node.js testing frameworks
6. **Assertions**: Implement strict equality checks for monetary values
7. **Test Database**: Use a separate test database or in-memory storage for integration tests

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-02 | Initial | Created comprehensive test plan based on COBOL application analysis |
