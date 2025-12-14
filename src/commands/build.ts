/**
 * wecon build
 *
 * Build project for production.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export const buildCommand = new Command("build")
  .description("Build for production")
  .option("-m, --mode <mode>", "Config mode", "production")
  .action(async (options: { mode: string }) => {
    console.log(chalk.cyan("\n📦 Building Wecon project...\n"));

    // Check if we're in a Wecon project
    const configPath = path.resolve(process.cwd(), "wecon.config.ts");
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red("Error: wecon.config.ts not found."));
      console.log(chalk.gray("Make sure you're in a Wecon project directory."));
      process.exit(1);
    }

    const spinner = ora("Compiling TypeScript...").start();

    try {
      // Set environment
      process.env.NODE_ENV = options.mode;

      // Clean dist directory
      const distPath = path.resolve(process.cwd(), "dist");
      if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true });
      }

      // Run TypeScript compiler
      execSync("npx tsc", { cwd: process.cwd(), stdio: "pipe" });
      spinner.succeed("TypeScript compiled");

      // Copy public files
      const publicPath = path.resolve(process.cwd(), "public");
      if (fs.existsSync(publicPath)) {
        spinner.start("Copying public files...");
        fs.cpSync(publicPath, path.join(distPath, "public"), { recursive: true });
        spinner.succeed("Public files copied");
      }

      // Copy env file
      const envFile = `.env.${options.mode}`;
      const envPath = path.resolve(process.cwd(), envFile);
      if (fs.existsSync(envPath)) {
        spinner.start("Copying environment file...");
        fs.copyFileSync(envPath, path.join(distPath, ".env"));
        spinner.succeed("Environment file copied");
      }

      console.log(chalk.green("\n✅ Build completed successfully!\n"));
      console.log(chalk.gray("Output: ./dist/"));
      console.log(chalk.gray("Start with: wecon start\n"));

    } catch (error) {
      spinner.fail("Build failed");
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
      }
      process.exit(1);
    }
  });
