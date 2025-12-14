/**
 * wecon start
 *
 * Start production server (no hot reload).
 */

import { Command } from "commander";
import chalk from "chalk";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const startCommand = new Command("start")
  .description("Start production server")
  .option("-p, --port <port>", "Port to run on", "3000")
  .option("-m, --mode <mode>", "Config mode", "production")
  .action(async (options: { port: string; mode: string }) => {
    console.log(chalk.cyan("\n🚀 Starting Wecon production server...\n"));

    // Check if built files exist
    const distPath = path.resolve(process.cwd(), "dist");
    if (!fs.existsSync(distPath)) {
      console.log(chalk.yellow("Warning: dist/ directory not found."));
      console.log(chalk.gray("Running 'wecon build' first...\n"));

      // Run build first
      const { execSync } = await import("child_process");
      try {
        execSync("npx wecon build", { cwd: process.cwd(), stdio: "inherit" });
      } catch {
        console.log(chalk.red("Build failed."));
        process.exit(1);
      }
    }

    // Find the entry point
    const entryPoints = [
      "dist/shared/server/index.js",
      "dist/server/index.js",
      "dist/index.js",
    ];

    let entryPoint = "";
    for (const ep of entryPoints) {
      if (fs.existsSync(path.resolve(process.cwd(), ep))) {
        entryPoint = ep;
        break;
      }
    }

    if (!entryPoint) {
      console.log(chalk.red("Error: No entry point found in dist/."));
      console.log(chalk.gray("Make sure the build completed successfully."));
      process.exit(1);
    }

    console.log(chalk.gray(`Mode: ${options.mode}`));
    console.log(chalk.gray(`Port: ${options.port}\n`));

    // Start with node
    const child = spawn("node", [entryPoint], {
      cwd: process.cwd(),
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: options.mode,
        PORT: options.port,
      },
    });

    child.on("error", (error) => {
      console.error(chalk.red("Failed to start server:"), error.message);
      process.exit(1);
    });

    child.on("close", (code) => {
      process.exit(code || 0);
    });
  });
