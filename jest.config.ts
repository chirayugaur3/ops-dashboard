import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Custom Jest configuration
const customJestConfig: Config = {
  // Setup files to run before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Test environment for React components
  testEnvironment: 'jest-environment-jsdom',
  
  // Module path aliases matching tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
  ],
  
  // Coverage thresholds - aim for 80% on core logic
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Transform TypeScript files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  
  // Ignore patterns
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

export default createJestConfig(customJestConfig);
