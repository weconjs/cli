#!/usr/bin/env node
/**
 * @weconjs/cli
 *
 * Wecon Framework CLI - Create and manage Wecon applications.
 *
 * Commands:
 * - wecon create <name>     Create a new Wecon project
 * - wecon dev               Start development server
 * - wecon start             Start production server
 * - wecon build             Build for production
 * - wecon generate module   Generate a new module
 */

import { Command } from "commander";
import chalk from "chalk";
import { createCommand } from "./commands/create.js";
import { devCommand } from "./commands/dev.js";
import { startCommand } from "./commands/start.js";
import { buildCommand } from "./commands/build.js";
import { generateCommand } from "./commands/generate.js";
import { postmanCommand } from "./commands/postman.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8")
);

const program = new Command();

// CLI header
const logo = `
${chalk.cyan("██╗    ██╗███████╗ ██████╗ ██████╗ ███╗   ██╗")}
${chalk.cyan("██║    ██║██╔════╝██╔════╝██╔═══██╗████╗  ██║")}
${chalk.cyan("██║ █╗ ██║█████╗  ██║     ██║   ██║██╔██╗ ██║")}
${chalk.cyan("██║███╗██║██╔══╝  ██║     ██║   ██║██║╚██╗██║")}
${chalk.cyan("╚███╔███╔╝███████╗╚██████╗╚██████╔╝██║ ╚████║")}
${chalk.cyan(" ╚══╝╚══╝ ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝")}
`;

program
  .name("wecon")
  .description("Wecon Framework CLI")
  .version(packageJson.version)
  .addHelpText("before", logo);

// Register commands
program.addCommand(createCommand);
program.addCommand(devCommand);
program.addCommand(startCommand);
program.addCommand(buildCommand);
program.addCommand(generateCommand);
program.addCommand(postmanCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
