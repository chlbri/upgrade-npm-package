#!/usr/bin/env node

import { formatSummaryReport } from '../lib/report.js';
import { UpgradeOrchestrator } from '../services/upgrade-orchestrator.js';

async function main() {
  try {
    const orchestrator = new UpgradeOrchestrator();
    const report = await orchestrator.upgrade();

    console.log(formatSummaryReport(report));

    // Exit codes: 0 = success, 1 = some upgrades failed but process completed
    process.exit(0);
  } catch (error) {
    console.error('❌ Upgrade failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
