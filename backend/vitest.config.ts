import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // Test environment
        environment: 'node',

        // Include test files
        include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],

        // Global test timeout
        testTimeout: 10000,

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/server.ts'],
        },

        // Setup files (runs before each test file)
        setupFiles: ['./tests/setup.ts'],

        // Global variables like describe, it, expect
        globals: true,
    },
})
