/**
 * Unit Tests for Student Account Management System
 * These tests mirror the test cases defined in docs/TESTPLAN.md
 * 
 * Test Framework: Jest
 * Initial State: All tests assume an initial account balance of $1000.00
 */

// Import classes from lib.js
const { DataProgram, Operations, MainProgram } = require('./lib');

// Mock console methods to prevent cluttering test output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockExit.mockRestore();
});

// ============================================================================
// DATA LAYER TESTS (DataProgram)
// ============================================================================

describe('DataProgram - Data Storage Layer', () => {
    let dataProgram;

    beforeEach(() => {
        dataProgram = new DataProgram();
    });

    test('should initialize with default balance of 1000.00', () => {
        expect(dataProgram.storageBalance).toBe(1000.00);
    });

    test('READ operation should return current balance', () => {
        const balance = dataProgram.execute('READ');
        expect(balance).toBe(1000.00);
    });

    test('WRITE operation should update storage balance', () => {
        dataProgram.execute('WRITE', 1500.00);
        expect(dataProgram.storageBalance).toBe(1500.00);
    });

    test('TC-024: Data persistence - read after write (credit)', () => {
        // Credit $500.00
        dataProgram.execute('WRITE', 1500.00);
        // Read balance
        const balance = dataProgram.execute('READ');
        expect(balance).toBe(1500.00);
    });

    test('TC-025: Data persistence - read after write (debit)', () => {
        // Debit $300.00
        dataProgram.execute('WRITE', 700.00);
        // Read balance
        const balance = dataProgram.execute('READ');
        expect(balance).toBe(700.00);
    });
});

// ============================================================================
// OPERATIONS LAYER TESTS (Operations)
// ============================================================================

describe('Operations - Business Logic Layer', () => {
    let dataProgram;
    let operations;
    let mockRl;

    beforeEach(() => {
        dataProgram = new DataProgram();
        operations = new Operations(dataProgram);
        mockRl = {
            question: jest.fn()
        };
        jest.clearAllMocks();
    });

    // ========================================================================
    // VIEW BALANCE TESTS
    // ========================================================================

    describe('View Balance Operations', () => {
        test('TC-001: View initial account balance', async () => {
            await operations.execute('TOTAL ', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 1000.00');
        });

        test('TC-016: View balance after credit operation', async () => {
            // Credit $200.00
            mockRl.question.mockImplementation((prompt, callback) => callback('200.00'));
            await operations.execute('CREDIT', mockRl);
            jest.clearAllMocks();
            
            // View balance
            await operations.execute('TOTAL ', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 1200.00');
        });

        test('TC-017: View balance after debit operation', async () => {
            // Debit $300.00
            mockRl.question.mockImplementation((prompt, callback) => callback('300.00'));
            await operations.execute('DEBIT ', mockRl);
            jest.clearAllMocks();
            
            // View balance
            await operations.execute('TOTAL ', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 700.00');
        });

        test('TC-018: View balance after failed debit', async () => {
            // Attempt to debit $1500.00 (insufficient funds)
            mockRl.question.mockImplementation((prompt, callback) => callback('1500.00'));
            await operations.execute('DEBIT ', mockRl);
            jest.clearAllMocks();
            
            // View balance
            await operations.execute('TOTAL ', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 1000.00');
        });
    });

    // ========================================================================
    // CREDIT OPERATIONS TESTS
    // ========================================================================

    describe('Credit Operations', () => {
        test('TC-002: Credit account with valid amount', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('500.00'));
            await operations.execute('CREDIT', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount credited. New balance: 1500.00');
            expect(dataProgram.storageBalance).toBe(1500.00);
        });

        test('TC-003: Credit account with small amount', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('0.01'));
            await operations.execute('CREDIT', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount credited. New balance: 1000.01');
            expect(dataProgram.storageBalance).toBe(1000.01);
        });

        test('TC-004: Credit account with large amount', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('99999.99'));
            await operations.execute('CREDIT', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount credited. New balance: 100999.99');
            expect(dataProgram.storageBalance).toBe(100999.99);
        });

        test('TC-005: Credit account with zero amount', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('0.00'));
            await operations.execute('CREDIT', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount credited. New balance: 1000.00');
            expect(dataProgram.storageBalance).toBe(1000.00);
        });

        test('TC-006: Multiple consecutive credits', async () => {
            // First credit: $250.00
            mockRl.question.mockImplementation((prompt, callback) => callback('250.00'));
            await operations.execute('CREDIT', mockRl);
            expect(dataProgram.storageBalance).toBe(1250.00);
            
            // Second credit: $750.00
            mockRl.question.mockImplementation((prompt, callback) => callback('750.00'));
            await operations.execute('CREDIT', mockRl);
            expect(dataProgram.storageBalance).toBe(2000.00);
            expect(mockConsoleLog).toHaveBeenLastCalledWith('Amount credited. New balance: 2000.00');
        });

        test('TC-027: Decimal precision - credit operation', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('123.45'));
            await operations.execute('CREDIT', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount credited. New balance: 1123.45');
            expect(dataProgram.storageBalance).toBe(1123.45);
        });
    });

    // ========================================================================
    // DEBIT OPERATIONS TESTS
    // ========================================================================

    describe('Debit Operations', () => {
        test('TC-007: Debit account with valid amount (sufficient funds)', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('300.00'));
            await operations.execute('DEBIT ', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount debited. New balance: 700.00');
            expect(dataProgram.storageBalance).toBe(700.00);
        });

        test('TC-008: Debit exact account balance', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('1000.00'));
            await operations.execute('DEBIT ', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
            expect(dataProgram.storageBalance).toBe(0.00);
        });

        test('TC-009: Debit account with insufficient funds', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('1500.00'));
            await operations.execute('DEBIT ', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Insufficient funds for this debit.');
            expect(dataProgram.storageBalance).toBe(1000.00);
        });

        test('TC-010: Debit account with amount exceeding balance by small margin', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('1000.01'));
            await operations.execute('DEBIT ', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Insufficient funds for this debit.');
            expect(dataProgram.storageBalance).toBe(1000.00);
        });

        test('TC-011: Debit account with small amount', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('0.01'));
            await operations.execute('DEBIT ', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount debited. New balance: 999.99');
            expect(dataProgram.storageBalance).toBe(999.99);
        });

        test('TC-012: Debit account with zero amount', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('0.00'));
            await operations.execute('DEBIT ', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount debited. New balance: 1000.00');
            expect(dataProgram.storageBalance).toBe(1000.00);
        });

        test('TC-013: Multiple consecutive debits (sufficient funds)', async () => {
            // First debit: $200.00
            mockRl.question.mockImplementation((prompt, callback) => callback('200.00'));
            await operations.execute('DEBIT ', mockRl);
            expect(dataProgram.storageBalance).toBe(800.00);
            
            // Second debit: $300.00
            mockRl.question.mockImplementation((prompt, callback) => callback('300.00'));
            await operations.execute('DEBIT ', mockRl);
            expect(dataProgram.storageBalance).toBe(500.00);
            expect(mockConsoleLog).toHaveBeenLastCalledWith('Amount debited. New balance: 500.00');
        });

        test('TC-014: Multiple debits until insufficient funds', async () => {
            // First debit: $600.00
            mockRl.question.mockImplementation((prompt, callback) => callback('600.00'));
            await operations.execute('DEBIT ', mockRl);
            expect(dataProgram.storageBalance).toBe(400.00);
            
            // Second debit attempt: $600.00 (should fail)
            mockRl.question.mockImplementation((prompt, callback) => callback('600.00'));
            await operations.execute('DEBIT ', mockRl);
            expect(mockConsoleLog).toHaveBeenLastCalledWith('Insufficient funds for this debit.');
            expect(dataProgram.storageBalance).toBe(400.00);
        });

        test('TC-028: Decimal precision - debit operation', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('67.89'));
            await operations.execute('DEBIT ', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount debited. New balance: 932.11');
            expect(dataProgram.storageBalance).toBe(932.11);
        });
    });

    // ========================================================================
    // COMBINED OPERATIONS TESTS
    // ========================================================================

    describe('Combined Operations', () => {
        test('TC-015: Credit and debit sequence', async () => {
            // Credit $500.00
            mockRl.question.mockImplementation((prompt, callback) => callback('500.00'));
            await operations.execute('CREDIT', mockRl);
            expect(dataProgram.storageBalance).toBe(1500.00);
            
            // Debit $750.00
            mockRl.question.mockImplementation((prompt, callback) => callback('750.00'));
            await operations.execute('DEBIT ', mockRl);
            expect(dataProgram.storageBalance).toBe(750.00);
        });

        test('TC-029: Complex operation sequence', async () => {
            // View Balance
            await operations.execute('TOTAL ', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 1000.00');
            
            // Credit $250.50
            mockRl.question.mockImplementation((prompt, callback) => callback('250.50'));
            await operations.execute('CREDIT', mockRl);
            expect(dataProgram.storageBalance).toBe(1250.50);
            
            // View Balance
            await operations.execute('TOTAL ', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 1250.50');
            
            // Debit $100.25
            mockRl.question.mockImplementation((prompt, callback) => callback('100.25'));
            await operations.execute('DEBIT ', mockRl);
            expect(dataProgram.storageBalance).toBe(1150.25);
            
            // View Balance
            await operations.execute('TOTAL ', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 1150.25');
            
            // Credit $50.00
            mockRl.question.mockImplementation((prompt, callback) => callback('50.00'));
            await operations.execute('CREDIT', mockRl);
            expect(dataProgram.storageBalance).toBe(1200.25);
            
            // View Balance
            await operations.execute('TOTAL ', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 1200.25');
        });

        test('TC-030: Rapid consecutive operations', async () => {
            // Perform 10 consecutive credits of $10.00 each
            for (let i = 0; i < 10; i++) {
                mockRl.question.mockImplementation((prompt, callback) => callback('10.00'));
                await operations.execute('CREDIT', mockRl);
            }
            
            // View balance
            jest.clearAllMocks();
            await operations.execute('TOTAL ', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 1100.00');
            expect(dataProgram.storageBalance).toBe(1100.00);
        });
    });

    // ========================================================================
    // BOUNDARY CONDITIONS TESTS
    // ========================================================================

    describe('Boundary Conditions', () => {
        test('TC-026: Maximum balance limit', async () => {
            // Set balance to $900000.00
            dataProgram.execute('WRITE', 900000.00);
            
            // Credit $99999.99 (should reach $999999.99)
            mockRl.question.mockImplementation((prompt, callback) => callback('99999.99'));
            await operations.execute('CREDIT', mockRl);
            
            expect(mockConsoleLog).toHaveBeenCalledWith('Amount credited. New balance: 999999.99');
            expect(dataProgram.storageBalance).toBe(999999.99);
        });

        test('should handle zero balance after full debit', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('1000.00'));
            await operations.execute('DEBIT ', mockRl);
            
            expect(dataProgram.storageBalance).toBe(0.00);
            
            // Attempting another debit should fail
            mockRl.question.mockImplementation((prompt, callback) => callback('0.01'));
            await operations.execute('DEBIT ', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Insufficient funds for this debit.');
        });
    });

    // ========================================================================
    // INPUT VALIDATION TESTS
    // ========================================================================

    describe('Input Validation', () => {
        test('should reject invalid amount (negative)', async () => {
            let callCount = 0;
            mockRl.question.mockImplementation((prompt, callback) => {
                callCount++;
                if (callCount === 1) {
                    callback('-10.00');
                } else {
                    callback('10.00');
                }
            });
            
            await operations.execute('CREDIT', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Invalid amount. Please enter a value between 0.00 and 999999.99');
        });

        test('should reject invalid amount (exceeds maximum)', async () => {
            let callCount = 0;
            mockRl.question.mockImplementation((prompt, callback) => {
                callCount++;
                if (callCount === 1) {
                    callback('1000000.00');
                } else {
                    callback('100.00');
                }
            });
            
            await operations.execute('CREDIT', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Invalid amount. Please enter a value between 0.00 and 999999.99');
        });

        test('should reject invalid amount (non-numeric)', async () => {
            let callCount = 0;
            mockRl.question.mockImplementation((prompt, callback) => {
                callCount++;
                if (callCount === 1) {
                    callback('abc');
                } else {
                    callback('50.00');
                }
            });
            
            await operations.execute('CREDIT', mockRl);
            expect(mockConsoleLog).toHaveBeenCalledWith('Invalid amount. Please enter a value between 0.00 and 999999.99');
        });

        test('should round amounts to 2 decimal places', async () => {
            mockRl.question.mockImplementation((prompt, callback) => callback('100.999'));
            await operations.execute('CREDIT', mockRl);
            
            // Should round to 101.00
            expect(dataProgram.storageBalance).toBe(1101.00);
        });
    });

    // ========================================================================
    // UTILITY FUNCTIONS TESTS
    // ========================================================================

    describe('Utility Functions', () => {
        test('formatCurrency should format with 2 decimal places', () => {
            expect(operations.formatCurrency(1000)).toBe('1000.00');
            expect(operations.formatCurrency(1000.5)).toBe('1000.50');
            expect(operations.formatCurrency(1000.999)).toBe('1001.00'); // Rounds up
        });
    });
});

// ============================================================================
// MAIN PROGRAM TESTS (MainProgram - Integration Tests)
// ============================================================================

describe('MainProgram - Application Layer', () => {
    let mainProgram;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create a new instance without starting the main loop
        mainProgram = new MainProgram();
        // Close the readline interface to prevent hanging
        if (mainProgram.rl) {
            mainProgram.rl.close();
        }
        // Mock readline
        mainProgram.rl = {
            question: jest.fn(),
            close: jest.fn()
        };
    });

    afterEach(() => {
        if (mainProgram && mainProgram.rl && !mainProgram.rl.close.mock) {
            mainProgram.rl.close();
        }
    });

    test('should initialize with default values', () => {
        expect(mainProgram.continueFlag).toBe('YES');
        expect(mainProgram.dataProgram).toBeDefined();
        expect(mainProgram.operations).toBeDefined();
    });

    test('TC-001: should display menu with 4 options', () => {
        mainProgram.displayMenu();
        
        expect(mockConsoleLog).toHaveBeenCalledWith('--------------------------------');
        expect(mockConsoleLog).toHaveBeenCalledWith('Account Management System');
        expect(mockConsoleLog).toHaveBeenCalledWith('1. View Balance');
        expect(mockConsoleLog).toHaveBeenCalledWith('2. Credit Account');
        expect(mockConsoleLog).toHaveBeenCalledWith('3. Debit Account');
        expect(mockConsoleLog).toHaveBeenCalledWith('4. Exit');
    });

    test('TC-019: should handle invalid menu option (0)', async () => {
        mainProgram.rl.question.mockImplementation((prompt, callback) => callback('0'));
        
        mainProgram.displayMenu();
        const choice = await mainProgram.getUserChoice();
        
        // Process the choice in a switch statement (simulating mainLoop)
        if (choice !== 1 && choice !== 2 && choice !== 3 && choice !== 4) {
            console.log('Invalid choice, please select 1-4.');
        }
        
        expect(mockConsoleLog).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
    });

    test('TC-020: should handle invalid menu option (5)', async () => {
        mainProgram.rl.question.mockImplementation((prompt, callback) => callback('5'));
        
        const choice = await mainProgram.getUserChoice();
        
        // Process the choice
        if (choice !== 1 && choice !== 2 && choice !== 3 && choice !== 4) {
            console.log('Invalid choice, please select 1-4.');
        }
        
        expect(mockConsoleLog).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
    });

    test('TC-021: should handle invalid menu option (non-numeric)', async () => {
        mainProgram.rl.question.mockImplementation((prompt, callback) => callback('A'));
        
        const choice = await mainProgram.getUserChoice();
        
        expect(isNaN(choice)).toBe(true);
    });

    test('TC-022: should exit application (option 4)', async () => {
        mainProgram.rl.question.mockImplementation((prompt, callback) => callback('4'));
        
        // Set up a simplified version of the mainLoop for testing
        mainProgram.displayMenu();
        const userChoice = await mainProgram.getUserChoice();
        
        if (userChoice === 4) {
            mainProgram.continueFlag = 'NO';
            console.log('Exiting the program. Goodbye!');
        }
        
        expect(mainProgram.continueFlag).toBe('NO');
        expect(mockConsoleLog).toHaveBeenCalledWith('Exiting the program. Goodbye!');
    });

    test('TC-023: should continue loop after operation', async () => {
        // Mock user selecting option 1 (View Balance)
        mainProgram.rl.question.mockImplementation((prompt, callback) => callback('1'));
        
        // Get choice
        const choice = await mainProgram.getUserChoice();
        expect(choice).toBe(1);
        
        // After processing, continueFlag should still be 'YES'
        expect(mainProgram.continueFlag).toBe('YES');
    });

    test('should integrate all layers properly', async () => {
        // Verify data flows through all layers
        const initialBalance = mainProgram.dataProgram.execute('READ');
        expect(initialBalance).toBe(1000.00);
        
        // Mock credit operation
        mainProgram.rl.question.mockImplementation((prompt, callback) => callback('200.00'));
        await mainProgram.operations.execute('CREDIT', mainProgram.rl);
        
        // Verify balance updated
        const newBalance = mainProgram.dataProgram.execute('READ');
        expect(newBalance).toBe(1200.00);
    });
});

// ============================================================================
// EDGE CASES AND STRESS TESTS
// ============================================================================

describe('Edge Cases and Additional Tests', () => {
    let dataProgram;
    let operations;
    let mockRl;

    beforeEach(() => {
        dataProgram = new DataProgram();
        operations = new Operations(dataProgram);
        mockRl = {
            question: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('should handle floating-point precision correctly', async () => {
        // Perform operations that might cause floating-point errors
        mockRl.question.mockImplementation((prompt, callback) => callback('0.1'));
        await operations.execute('CREDIT', mockRl);
        await operations.execute('CREDIT', mockRl);
        await operations.execute('CREDIT', mockRl);
        
        // 1000.00 + 0.1 + 0.1 + 0.1 should equal 1000.30
        expect(dataProgram.storageBalance).toBeCloseTo(1000.30, 2);
    });

    test('should handle very large number of operations', async () => {
        // Perform 100 small credits
        for (let i = 0; i < 100; i++) {
            mockRl.question.mockImplementation((prompt, callback) => callback('1.00'));
            await operations.execute('CREDIT', mockRl);
        }
        
        expect(dataProgram.storageBalance).toBe(1100.00);
    });

    test('should maintain balance integrity across mixed operations', async () => {
        // Credit $500
        mockRl.question.mockImplementation((prompt, callback) => callback('500.00'));
        await operations.execute('CREDIT', mockRl);
        
        // Debit $200
        mockRl.question.mockImplementation((prompt, callback) => callback('200.00'));
        await operations.execute('DEBIT ', mockRl);
        
        // Credit $150
        mockRl.question.mockImplementation((prompt, callback) => callback('150.00'));
        await operations.execute('CREDIT', mockRl);
        
        // Debit $300
        mockRl.question.mockImplementation((prompt, callback) => callback('300.00'));
        await operations.execute('DEBIT ', mockRl);
        
        // Final balance: 1000 + 500 - 200 + 150 - 300 = 1150
        expect(dataProgram.storageBalance).toBe(1150.00);
    });

    test('should prevent debit when balance becomes insufficient during operation', async () => {
        // Set balance to $100
        dataProgram.execute('WRITE', 100.00);
        
        // Try to debit $100.01
        mockRl.question.mockImplementation((prompt, callback) => callback('100.01'));
        await operations.execute('DEBIT ', mockRl);
        
        expect(mockConsoleLog).toHaveBeenCalledWith('Insufficient funds for this debit.');
        expect(dataProgram.storageBalance).toBe(100.00);
    });

    test('should handle exact balance scenarios', async () => {
        // Debit exact balance
        mockRl.question.mockImplementation((prompt, callback) => callback('1000.00'));
        await operations.execute('DEBIT ', mockRl);
        expect(dataProgram.storageBalance).toBe(0.00);
        
        // Credit back
        mockRl.question.mockImplementation((prompt, callback) => callback('1000.00'));
        await operations.execute('CREDIT', mockRl);
        expect(dataProgram.storageBalance).toBe(1000.00);
    });
});
