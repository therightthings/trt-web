#!/usr/bin/env node

import { runCli } from './cli/commands.js';

await runCli(process.argv.slice(2));
