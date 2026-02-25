#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * Validates that required environment variables are properly configured
 * by reading .env.example and checking against the current environment.
 * 
 * Usage: node tooling/qa/env-validate.js
 *        pnpm env:validate
 * 
 * CI Mode: Set CI=true to allow placeholder values for CI environments
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logError(msg) {
  console.error(`${colors.red}❌ ${msg}${colors.reset}`);
}

function logSuccess(msg) {
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function logWarning(msg) {
  console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

function logInfo(msg) {
  console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
}

// Parse .env file to extract variable definitions
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const variables = [];
  
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Parse variable assignment
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const [, name, value] = match;
      const isQuoted = (value.startsWith('"') && value.endsWith('"')) || 
                       (value.startsWith("'") && value.endsWith("'"));
      const cleanValue = isQuoted ? value.slice(1, -1) : value;
      
      variables.push({
        name,
        value: cleanValue.trim(),
      });
    }
  }
  
  return variables;
}

// Load environment from .env file
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const [, name, value] = match;
      const isQuoted = (value.startsWith('"') && value.endsWith('"')) || 
                       (value.startsWith("'") && value.endsWith("'"));
      env[name] = isQuoted ? value.slice(1, -1).trim() : value.trim();
    }
  }
  
  return env;
}

// Check if a value looks like a placeholder
function isPlaceholder(value, isCI = false) {
  // In CI mode, allow placeholder values
  if (isCI) return false;
  
  if (!value || value.trim() === '') return true;
  
  const placeholderPatterns = [
    /^<.*>$/,
    /^http:\/\/localhost/,
    /^https:\/\/localhost/,
    /^pk_test_/,
    /^sk_test_/,
    /^sk_live_/,
    /^whsec_/,
    /^re_/,
    /^prod_/,
    /^price_/,
    /^"*"$/,
    /^' '*$/,
    /placeholder$/,
    /^_placeholder$/,
    /^ci_/,
  ];
  
  return placeholderPatterns.some(pattern => pattern.test(value.trim()));
}

// Required variables that MUST be set
const REQUIRED_SERVER_VARS = [
  'CLERK_SECRET_KEY',
  'STRIPE_API_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'POSTGRES_URL',
];

const REQUIRED_CLIENT_VARS = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
];

// Variables that are optional but warned if missing
const OPTIONAL_BUT_RECOMMENDED = [
  'RESEND_API_KEY',
  'RESEND_FROM',
  'ADMIN_EMAIL',
];

async function validate() {
  log(`${colors.bold}Environment Variable Validation${colors.reset}\n`);
  
  const rootDir = process.cwd();
  const envExamplePath = path.join(rootDir, '.env.example');
  const envLocalPath = path.join(rootDir, '.env.local');
  const envCiPath = path.join(rootDir, '.env.ci');
  
  // Check if .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    logError('.env.example not found');
    process.exit(1);
  }
  
  // Check if running in CI mode
  const isCI = process.env.CI === 'true';
  if (isCI) {
    logInfo('Running in CI mode - placeholder values allowed\n');
  }
  
  logInfo(`Reading ${colors.cyan}.env.example${colors.reset}...`);
  const envExample = parseEnvFile(envExamplePath);
  logSuccess(`Found ${envExample.length} environment variables defined\n`);
  
  // Determine which env file to load
  let envData = {};
  let envSource = null;
  
  if (fs.existsSync(envLocalPath)) {
    envData = loadEnvFile(envLocalPath);
    envSource = '.env.local';
  } else if (fs.existsSync(envCiPath) && isCI) {
    envData = loadEnvFile(envCiPath);
    envSource = '.env.ci (CI mode)';
  }
  
  if (envSource) {
    logInfo(`Loaded environment from ${colors.cyan}${envSource}${colors.reset}...`);
    logSuccess(`Found ${Object.keys(envData).length} variables\n`);
  } else {
    logWarning('.env.local not found');
    logInfo('Creating a copy from .env.example is recommended: cp .env.example .env.local\n');
  }
  
  // Merge with process.env (process.env takes precedence)
  const processEnv = { ...envData, ...process.env };
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Validate required server variables
  log(`${colors.bold}Required Server Variables:${colors.reset}`);
  for (const varName of REQUIRED_SERVER_VARS) {
    const value = processEnv[varName];
    if (!value || isPlaceholder(value, isCI)) {
      logError(`${varName} is not set or is a placeholder`);
      hasErrors = true;
    } else {
      logSuccess(`${varName} ✓`);
    }
  }
  console.log();
  
  // Validate required client variables
  log(`${colors.bold}Required Client Variables:${colors.reset}`);
  for (const varName of REQUIRED_CLIENT_VARS) {
    const value = processEnv[varName];
    if (!value || isPlaceholder(value, isCI)) {
      logError(`${varName} is not set or is a placeholder`);
      hasErrors = true;
    } else {
      logSuccess(`${varName} ✓`);
    }
  }
  console.log();
  
  // Check optional but recommended
  log(`${colors.bold}Optional but Recommended:${colors.reset}`);
  for (const varName of OPTIONAL_BUT_RECOMMENDED) {
    const value = processEnv[varName];
    if (!value || isPlaceholder(value, isCI)) {
      logWarning(`${varName} is not set (optional but recommended)`);
      hasWarnings = true;
    } else {
      logSuccess(`${varName} ✓`);
    }
  }
  console.log();
  
  // Summary
  log(`${colors.bold}Summary:${colors.reset}`);
  if (hasErrors) {
    logError('Environment validation FAILED');
    logInfo('Please fix the errors above and try again');
    process.exit(1);
  } else if (hasWarnings) {
    logWarning('Environment validation passed with warnings');
    logInfo('The application may have limited functionality');
  } else {
    logSuccess('Environment validation PASSED');
  }
  
  console.log();
  logInfo('Tip: Run `pnpm dx:setup` to verify your development environment is ready');
}

// Run validation
validate().catch(err => {
  logError(`Validation error: ${err.message}`);
  process.exit(1);
});
