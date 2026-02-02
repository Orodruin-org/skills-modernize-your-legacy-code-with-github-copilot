# Student Account Management System - Node.js

This is a modernized version of the COBOL legacy application, converted to Node.js while preserving all original business logic, data integrity, and menu options.

## Features

The application maintains all functionality from the original COBOL system:

- **View Balance**: Display current account balance
- **Credit Account**: Add funds to the account
- **Debit Account**: Withdraw funds (with overdraft protection)
- **Exit**: Close the application

## Business Rules (Preserved from COBOL)

- Initial balance: **1000.00**
- Maximum balance: **999,999.99**
- Minimum balance: **0.00** (no negative balances)
- All amounts use 2 decimal places precision
- Overdraft protection prevents debits exceeding available balance

## Running the Application

### From Terminal

```bash
cd src/accounting
node index.js
```

Or using npm:

```bash
cd src/accounting
npm start
```

### From VS Code Debugger

1. Open the Run and Debug panel (Ctrl+Shift+D or Cmd+Shift+D)
2. Select "Launch Account Management System" from the dropdown
3. Click the green play button or press F5

## Application Architecture

The Node.js application preserves the three-layer architecture from the COBOL version:

### 1. **DataProgram Class** (data.cob equivalent)
- Manages persistent balance storage
- Handles READ and WRITE operations
- Initial balance: 1000.00

### 2. **Operations Class** (operations.cob equivalent)
- Implements business logic for all account operations
- Handles user input validation
- Enforces business rules (overdraft protection, amount limits)

### 3. **MainProgram Class** (main.cob equivalent)
- Entry point and user interface
- Displays interactive menu
- Routes user requests to operations
- Main program loop

## Data Flow

The application follows the same data flow as the COBOL version:

```
User Input → MainProgram → Operations → DataProgram → Balance Storage
```

## Code Quality

- **Modular Design**: Separated concerns across three classes
- **Input Validation**: Enforces amount constraints (0.00 - 999,999.99)
- **Error Handling**: Graceful error messages for invalid inputs
- **Documentation**: Inline comments mapping to COBOL equivalents
- **Decimal Precision**: 2 decimal places for all monetary values

## Differences from COBOL Version

While the core functionality is identical, the Node.js version includes:

- Async/await for user input handling
- Promise-based architecture
- Modern JavaScript classes
- Better error handling
- UTF-8 support for international characters

## Testing

You can test the application by:

1. Viewing the initial balance (should be 1000.00)
2. Crediting an amount (e.g., 500.00)
3. Viewing balance again (should be 1500.00)
4. Attempting to debit more than available (should show error)
5. Debiting a valid amount
6. Exiting the application

## Dependencies

The application uses only Node.js built-in modules:
- `readline` - For interactive terminal input

No external dependencies required!
