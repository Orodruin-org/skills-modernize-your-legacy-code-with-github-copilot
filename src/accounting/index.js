#!/usr/bin/env node

/**
 * Student Account Management System - Entry Point
 * Modernized from COBOL legacy application
 */

const { MainProgram } = require('./lib');

// Create and start the main program
const app = new MainProgram();
app.start().catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
});
