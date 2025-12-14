/**
 * wecon dev
 *
 * Start development server with hot reload.
 */

import { Command } from "commander";
import chalk from "chalk";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const devCommand = new Command("dev")
  .description("Start development server with hot reload")
  .option("-p, --port <port>", "Port to run on", "3000")
  .option("-m, --mode <mode>", "Config mode", "development")
  .action(async (options: { port: string; mode: string }) => {
    console.log(chalk.cyan("\n🚀 Starting Wecon development server...\n"));

    // Check if we're in a Wecon project
    const configPath = path.resolve(process.cwd(), "wecon.config.ts");
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red("Error: wecon.config.ts not found."));
      console.log(chalk.gray("Make sure you're in a Wecon project directory."));
      process.exit(1);
    }

    // Set environment variables
    process.env.NODE_ENV = options.mode;
    process.env.PORT = options.port;

    console.log(chalk.gray(`Mode: ${options.mode}`));
    console.log(chalk.gray(`Port: ${options.port}\n`));

    // Find the entry point
    const entryPoints = [
      "src/shared/server/index.ts",
      "src/server/index.ts",
      "src/index.ts",
    ];

    let entryPoint = "";
    for (const ep of entryPoints) {
      if (fs.existsSync(path.resolve(process.cwd(), ep))) {
        entryPoint = ep;
        break;
      }
    }

    if (!entryPoint) {
      console.log(chalk.red("Error: No entry point found."));
      console.log(chalk.gray("Expected one of: " + entryPoints.join(", ")));
      process.exit(1);
    }

    // Start with ts-node-dev for hot reload
    const child = spawn(
      "npx",
      [
        "ts-node-dev",
        "--respawn",
        "--transpile-only",
        "-r",
        "tsconfig-paths/register",
        entryPoint,
      ],
      {
        cwd: process.cwd(),
        stdio: "inherit",
        env: {
          ...process.env,
          NODE_ENV: options.mode,
          PORT: options.port,
        },
      }
    );

    child.on("error", (error) => {
      console.error(chalk.red("Failed to start server:"), error.message);
      process.exit(1);
    });

    child.on("close", (code) => {
      process.exit(code || 0);
    });
  });
