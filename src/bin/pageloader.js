#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import { version } from '../../package.json';
import { loadPage } from '..';


program
  .version(version)
  .description('loads the page from the web and places it in the specified folder (by default in the program launch directory)')
  .option('-o, --output [path]', 'specify download path', process.cwd())
  .arguments('<downloadedResourcePath>')
  .action(downloadedResourcePath => loadPage(program.output, downloadedResourcePath)
    .then(paths => console
      .log(chalk.green(`Page successfully downloaded to ${paths[0]}\nLocal resourses successfully downloaded to ${paths[1]}`)))
    .catch((err) => {
      console.error(chalk.red(`${err.code}: ${err.message}`));
      process.exit(1);
    }))
  .parse(process.argv);
