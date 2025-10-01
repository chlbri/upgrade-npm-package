#!/usr/bin/env node

import { run } from 'cmd-ts';
import { upgradeCommand } from './upgrade';

run(upgradeCommand, process.argv.slice(2));
