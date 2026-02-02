#!/usr/bin/env node

/**
 * Student Account Management System
 * Modernized from COBOL legacy application
 * 
 * This application preserves the original business logic, data integrity,
 * and menu options from the COBOL version (main.cob, operations.cob, data.cob)
 */

const readline = require('readline');

// ============================================================================
// DATA LAYER (DataProgram equivalent from data.cob)
// ============================================================================

class DataProgram {
    constructor() {
        // STORAGE-BALANCE PIC 9(6)V99 VALUE 1000.00
        this.storageBalance = 1000.00;
    }

    /**
     * Performs READ or WRITE operations on the balance storage
     * @param {string} operationType - 'READ' or 'WRITE'
     * @param {number} balance - Balance value for WRITE operations
     * @returns {number} Current balance for READ operations
     */
    execute(operationType, balance = null) {
        if (operationType === 'READ') {
            // MOVE STORAGE-BALANCE TO BALANCE
            return this.storageBalance;
        } else if (operationType === 'WRITE') {
            // MOVE BALANCE TO STORAGE-BALANCE
            this.storageBalance = balance;
            return balance;
        }
    }
}

// ============================================================================
// BUSINESS LOGIC LAYER (Operations equivalent from operations.cob)
// ============================================================================

class Operations {
    constructor(dataProgram) {
        this.dataProgram = dataProgram;
        // AMOUNT PIC 9(6)V99
        // FINAL-BALANCE PIC 9(6)V99 VALUE 1000.00
        this.amount = 0.00;
        this.finalBalance = 1000.00;
    }

    /**
     * Handles all account operations
     * @param {string} operationType - 'TOTAL ', 'CREDIT', or 'DEBIT '
     * @param {readline.Interface} rl - Readline interface for user input
     * @returns {Promise<void>}
     */
    async execute(operationType, rl) {
        if (operationType === 'TOTAL ') {
            // View Balance Operation
            this.finalBalance = this.dataProgram.execute('READ');
            console.log(`Current balance: ${this.formatCurrency(this.finalBalance)}`);
        } else if (operationType === 'CREDIT') {
            // Credit Account Operation
            const amount = await this.promptForAmount(rl, 'Enter credit amount: ');
            this.finalBalance = this.dataProgram.execute('READ');
            // ADD AMOUNT TO FINAL-BALANCE
            this.finalBalance += amount;
            this.dataProgram.execute('WRITE', this.finalBalance);
            console.log(`Amount credited. New balance: ${this.formatCurrency(this.finalBalance)}`);
        } else if (operationType === 'DEBIT ') {
            // Debit Account Operation
            const amount = await this.promptForAmount(rl, 'Enter debit amount: ');
            this.finalBalance = this.dataProgram.execute('READ');
            
            // IF FINAL-BALANCE >= AMOUNT
            if (this.finalBalance >= amount) {
                // SUBTRACT AMOUNT FROM FINAL-BALANCE
                this.finalBalance -= amount;
                this.dataProgram.execute('WRITE', this.finalBalance);
                console.log(`Amount debited. New balance: ${this.formatCurrency(this.finalBalance)}`);
            } else {
                // Insufficient funds protection
                console.log('Insufficient funds for this debit.');
            }
        }
    }

    /**
     * Prompts user for transaction amount
     * @param {readline.Interface} rl - Readline interface
     * @param {string} promptText - Text to display
     * @returns {Promise<number>} Amount entered by user
     */
    promptForAmount(rl, promptText) {
        return new Promise((resolve) => {
            rl.question(promptText, (input) => {
                const amount = parseFloat(input);
                // Validate input and enforce PIC 9(6)V99 constraints
                if (isNaN(amount) || amount < 0 || amount > 999999.99) {
                    console.log('Invalid amount. Please enter a value between 0.00 and 999999.99');
                    resolve(this.promptForAmount(rl, promptText));
                } else {
                    // Round to 2 decimal places for precision
                    resolve(Math.round(amount * 100) / 100);
                }
            });
        });
    }

    /**
     * Formats number as currency with 2 decimal places
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return amount.toFixed(2);
    }
}

// ============================================================================
// MAIN PROGRAM (MainProgram equivalent from main.cob)
// ============================================================================

class MainProgram {
    constructor() {
        // Initialize data layer
        this.dataProgram = new DataProgram();
        // Initialize operations layer
        this.operations = new Operations(this.dataProgram);
        // CONTINUE-FLAG PIC X(3) VALUE 'YES'
        this.continueFlag = 'YES';
        // Setup readline interface for user input
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Displays the main menu
     */
    displayMenu() {
        console.log('--------------------------------');
        console.log('Account Management System');
        console.log('1. View Balance');
        console.log('2. Credit Account');
        console.log('3. Debit Account');
        console.log('4. Exit');
        console.log('--------------------------------');
    }

    /**
     * Prompts for and returns user's menu choice
     * @returns {Promise<number>} User's choice (1-4)
     */
    getUserChoice() {
        return new Promise((resolve) => {
            this.rl.question('Enter your choice (1-4): ', (input) => {
                const choice = parseInt(input);
                resolve(choice);
            });
        });
    }

    /**
     * Main program loop - PERFORM UNTIL CONTINUE-FLAG = 'NO'
     */
    async mainLoop() {
        while (this.continueFlag === 'YES') {
            this.displayMenu();
            const userChoice = await this.getUserChoice();

            // EVALUATE USER-CHOICE
            switch (userChoice) {
                case 1:
                    // CALL 'Operations' USING 'TOTAL '
                    await this.operations.execute('TOTAL ', this.rl);
                    break;
                case 2:
                    // CALL 'Operations' USING 'CREDIT'
                    await this.operations.execute('CREDIT', this.rl);
                    break;
                case 3:
                    // CALL 'Operations' USING 'DEBIT '
                    await this.operations.execute('DEBIT ', this.rl);
                    break;
                case 4:
                    // MOVE 'NO' TO CONTINUE-FLAG
                    this.continueFlag = 'NO';
                    break;
                default:
                    // WHEN OTHER
                    console.log('Invalid choice, please select 1-4.');
                    break;
            }
        }

        // DISPLAY "Exiting the program. Goodbye!"
        console.log('Exiting the program. Goodbye!');
        this.rl.close();
        // STOP RUN
        process.exit(0);
    }

    /**
     * Starts the application
     */
    async start() {
        await this.mainLoop();
    }
}

// Export classes for testing
module.exports = { DataProgram, Operations, MainProgram };

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================

// Only run the application if this is the main module
if (require.main === module) {
    // Create and start the main program
    const app = new MainProgram();
    app.start().catch((error) => {
        console.error('An error occurred:', error);
        process.exit(1);
    });
}
