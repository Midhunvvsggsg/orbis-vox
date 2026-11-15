// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * ORBIS VOX E2E Test Runner.
 * Executes test suites using Node.js 22 native test runner (node:test) and spec reporter.
 * Supports running all tests or filtering by tier (--tier=1, --tier=2, --tier=3, --tier=4).
 */

import { run } from 'node:test';
import { spec as Spec } from 'node:test/reporters';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../..');
const E2E_DIR = resolve(ROOT_DIR, 'tests/e2e');

const TIER_DIRS = {
  '1': resolve(E2E_DIR, 'tier1-features'),
  '2': resolve(E2E_DIR, 'tier2-boundaries'),
  '3': resolve(E2E_DIR, 'tier3-cross-feature'),
  '4': resolve(E2E_DIR, 'tier4-workloads')
};

/**
 * Recursively scans directory for test_*.js files.
 */
function findTestFiles(dir) {
  const files = [];
  if (!existsSync(dir)) return files;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...findTestFiles(fullPath));
    } else if (stat.isFile() && (entry.startsWith('test_') || entry.endsWith('.test.js')) && entry.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Discovers test files matching CLI arguments.
 */
function discoverFiles() {
  const args = process.argv.slice(2);
  let requestedTier = null;
  const specificFiles = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--tier=')) {
      requestedTier = arg.split('=')[1];
    } else if (arg === '-t' || arg === '--tier') {
      requestedTier = args[i + 1];
      i++;
    } else if (!arg.startsWith('-')) {
      specificFiles.push(resolve(process.cwd(), arg));
    }
  }

  if (specificFiles.length > 0) {
    return { files: specificFiles, tier: requestedTier, mode: 'specific-files' };
  }

  if (requestedTier) {
    const tierDir = TIER_DIRS[requestedTier];
    if (!tierDir) {
      console.error(`Unknown tier '${requestedTier}'. Supported tiers: 1, 2, 3, 4`);
      process.exit(1);
    }
    const files = findTestFiles(tierDir);
    return { files, tier: requestedTier, mode: `tier-${requestedTier}` };
  }

  // No specific tier requested: run all discovered tests
  const files = [];

  // Top-level E2E tests (e.g. test_harness_smoke.js)
  if (existsSync(E2E_DIR)) {
    const rootEntries = readdirSync(E2E_DIR);
    for (const entry of rootEntries) {
      const fullPath = join(E2E_DIR, entry);
      const stat = statSync(fullPath);
      if (stat.isFile() && entry.startsWith('test_') && entry.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }

  // Add tests from all tier directories
  for (const tierDir of Object.values(TIER_DIRS)) {
    files.push(...findTestFiles(tierDir));
  }

  return { files, tier: null, mode: 'all' };
}

async function main() {
  const { files, tier, mode } = discoverFiles();

  console.log('='.repeat(70));
  console.log('  ORBIS VOX E2E Test Suite Runner');
  console.log(`  Execution Mode: ${mode}${tier ? ` (Tier ${tier})` : ''}`);
  console.log(`  Discovered Test Files: ${files.length}`);
  console.log('='.repeat(70));

  if (files.length === 0) {
    console.log(`\nNo test files found for execution mode: ${mode}`);
    console.log('Ensure test files follow naming convention: test_*.js\n');
    process.exit(0);
  }

  for (const f of files) {
    console.log(`  • ${relative(ROOT_DIR, f)}`);
  }
  console.log('-'.repeat(70));

  const startTime = Date.now();
  let hadFailure = false;
  let passedCount = 0;
  let failedCount = 0;
  let totalTests = 0;
  let durationMs = 0;

  const testStream = run({
    files,
    concurrency: 1
  });

  testStream.on('test:fail', () => {
    hadFailure = true;
  });

  testStream.on('test:summary', (summary) => {
    if (summary && !summary.file) {
      if (!summary.success || summary.counts.failed > 0) {
        hadFailure = true;
      }
      totalTests = summary.counts.tests;
      passedCount = summary.counts.passed;
      failedCount = summary.counts.failed;
      durationMs = summary.duration_ms;
    }
  });

  const reporter = testStream.compose(new Spec());
  reporter.pipe(process.stdout);

  reporter.on('end', () => {
    const elapsed = durationMs || (Date.now() - startTime);
    const isSuccess = !hadFailure && failedCount === 0;

    console.log('\n' + '='.repeat(70));
    console.log('  ORBIS VOX E2E Test Suite Execution Summary');
    console.log('='.repeat(70));
    console.log(`  Files Discovered: ${files.length}`);
    console.log(`  Total Tests:      ${totalTests}`);
    console.log(`  Tests Passed:     ${passedCount}`);
    console.log(`  Tests Failed:     ${failedCount}`);
    console.log(`  Duration:         ${elapsed.toFixed(2)} ms`);
    console.log(`  Final Result:     ${isSuccess ? 'PASSED (Exit Code: 0)' : 'FAILED (Exit Code: 1)'}`);
    console.log('='.repeat(70) + '\n');

    process.exitCode = isSuccess ? 0 : 1;
  });
}

main().catch((err) => {
  console.error('\nFatal error executing test runner:', err);
  process.exit(1);
});
