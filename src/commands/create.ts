/**
 * wecon create <name>
 *
 * Scaffold a new Wecon project with production-ready template.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import prompts from "prompts";
import { copyTemplateDir } from "../utils/template-engine.js";

export const createCommand = new Command("create")
  .description("Create a new Wecon project")
  .argument("[name]", "Project name")
  .option("--git", "Initialize git repository", true)
  .option("--no-install", "Skip dependency installation")
  .action(async (cliName: string, options: { git?: boolean; install?: boolean }) => {
    console.log(chalk.cyan("\n🚀 Welcome to Wecon CLI\n"));

    const response = await prompts([
      {
        type: cliName ? null : "text",
        name: "name",
        message: "What is the name of your project?",
        initial: "my-wecon-app",
        validate: (value) => {
          if (!value) return "Project name is required";
          if (fs.existsSync(path.resolve(process.cwd(), value))) {
            return "Directory already exists";
          }
          return true;
        },
      },
      {
        type: "text",
        name: "description",
        message: "Project description:",
        initial: "A Wecon-powered API",
      },
      {
        type: "text",
        name: "author",
        message: "Author:",
        initial: "Wecon Developer",
      },
      {
        type: "number",
        name: "port",
        message: "Dev Server Port:",
        initial: 3000,
      },
      {
        type: "text",
        name: "dbName",
        message: "Database Name:",
        initial: (prev: string) => prev || cliName || "wecon-app",
      },
      {
        type: "select",
        name: "packageManager",
        message: "Pick a package manager",
        choices: [
          { title: "npm", value: "npm" },
          { title: "yarn", value: "yarn" },
          { title: "pnpm", value: "pnpm" },
        ],
        initial: 0,
      },
    ]);

    const name = cliName || response.name;

    if (!name) {
      console.log(chalk.red("✖ Operation cancelled"));
      process.exit(1);
    }

    const config = {
      name,
      description: response.description,
      author: response.author,
      port: response.port,
      dbName: response.dbName,
      packageManager: response.packageManager,
    };

    const projectPath = path.resolve(process.cwd(), name);
    const spinner = ora("Creating project structure...").start();

    try {
      // Create project directory
      fs.mkdirSync(projectPath, { recursive: true });

      // Create additional directories not in templates
      const extraDirs = [
        "src/shared/middleware",
        "src/shared/utils",
        "src/shared/types",
        "src/shared/auth",
        "public",
        "logs",
      ];
      for (const dir of extraDirs) {
        fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
      }

      spinner.text = "Rendering templates...";

      // Copy and render all templates
      await copyTemplateDir("project", projectPath, config);

      spinner.succeed("Project structure created");

      // Initialize git
      if (options.git !== false) {
        spinner.start("Initializing git repository...");
        try {
          execSync("git init", { cwd: projectPath, stdio: "pipe" });
          spinner.succeed("Git repository initialized");
        } catch {
          spinner.warn("Failed to initialize git repository");
        }
      }

      // Install dependencies
      if (options.install !== false) {
        spinner.start("Installing dependencies...");
        try {
          execSync(`${config.packageManager} install`, { cwd: projectPath, stdio: "pipe" });
          spinner.succeed("Dependencies installed");
        } catch {
          spinner.warn(`Failed to install dependencies (run ${config.packageManager} install manually)`);
        }
      }

      console.log(chalk.green("\n✅ Project created successfully!\n"));
      console.log(chalk.white("Next steps:"));
      console.log(chalk.gray(`  cd ${name}`));
      console.log(chalk.gray(`  ${config.packageManager} run dev\n`));
    } catch (error) {
      spinner.fail("Failed to create project");
      console.error(chalk.red(error));
      process.exit(1);
    }
  });
