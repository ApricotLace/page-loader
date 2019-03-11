#!/usr/bin/env node

import program from 'commander';
import { version } from '../../package.json';
import pageloader from '..';

program
  .version(version)
  .description('loads the page from the web and places it in the specified folder (by default in the program launch directory)')
  .option('-o, --output [path]', 'specify download path')
  .arguments('<downloadedResourcePath>')
  .action((downloadedResourcePath, options) => {
    console.log(options.output ? options.output : 'flag -o not passed');
    pageloader(options.output, downloadedResourcePath);
  })
  .parse(process.argv);
