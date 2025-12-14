/**
 * wecon create <name>
 *
 * Scaffold a new Wecon project with starter template.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";

export const createCommand = new Command("create")
  .description("Create a new Wecon project")
  .argument("<name>", "Project name")
  .option("--git", "Initialize git repository")
  .option("--no-install", "Skip dependency installation")
  .action(async (name: string, options: { git?: boolean; install?: boolean }) => {
    console.log(chalk.cyan("\n🚀 Creating new Wecon project...\n"));

    const projectPath = path.resolve(process.cwd(), name);

    // Check if directory exists
    if (fs.existsSync(projectPath)) {
      console.log(chalk.red(`Error: Directory "${name}" already exists.`));
      process.exit(1);
    }

    const spinner = ora("Creating project structure...").start();

    try {
      // Create project directory
      fs.mkdirSync(projectPath, { recursive: true });

      // Create directory structure
      const dirs = [
        "src/modules",
        "src/shared/middleware",
        "src/shared/utils",
        "config",
        "public",
        "logs",
      ];

      for (const dir of dirs) {
        fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
      }

      spinner.text = "Creating configuration files...";

      // Create package.json
      const packageJson = {
        name,
        version: "1.0.0",
        description: "A Wecon-powered API",
        type: "module",
        scripts: {
          dev: "wecon dev",
          start: "wecon start",
          build: "wecon build",
        },
        dependencies: {
          "@weconjs/lib": "^1.0.0",
          "@weconjs/core": "^1.0.0",
        },
        devDependencies: {
          typescript: "^5.3.0",
          "@types/node": "^20.10.0",
        },
      };
      fs.writeFileSync(
        path.join(projectPath, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      // Create wecon.config.ts
      const weconConfig = `import { defineConfig } from "@weconjs/core";

export default defineConfig({
  app: {
    name: "${name}",
    version: "1.0.0",
  },
  port: 3000,
  modes: {
    development: {
      database: {
        uri: "mongodb://localhost:27017/${name}",
      },
    },
    production: {
      database: {
        uri: process.env.DATABASE_URL || "",
      },
    },
  },
});
`;
      fs.writeFileSync(path.join(projectPath, "wecon.config.ts"), weconConfig);

      // Create tsconfig.json
      const tsConfig = {
        compilerOptions: {
          target: "ES2020",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          outDir: "./dist",
          rootDir: "./src",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"],
            "@/modules/*": ["./src/modules/*"],
            "@/shared/*": ["./src/shared/*"],
          },
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"],
      };
      fs.writeFileSync(
        path.join(projectPath, "tsconfig.json"),
        JSON.stringify(tsConfig, null, 2)
      );

      // Create bootstrap.ts
      const bootstrap = `/**
 * Application Bootstrap
 */

import { modules } from "@/modules";

export { modules };
`;
      fs.writeFileSync(path.join(projectPath, "src/bootstrap.ts"), bootstrap);

      // Create modules index
      const modulesIndex = `/**
 * Module Registry
 */

export const modules = [];
`;
      fs.writeFileSync(path.join(projectPath, "src/modules/index.ts"), modulesIndex);

      // Create .env.development
      const envDev = `NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/${name}
`;
      fs.writeFileSync(path.join(projectPath, ".env.development"), envDev);

      // Create .gitignore
      const gitignore = `node_modules/
dist/
logs/
.env
.env.production
`;
      fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignore);

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
          execSync("npm install", { cwd: projectPath, stdio: "pipe" });
          spinner.succeed("Dependencies installed");
        } catch {
          spinner.warn("Failed to install dependencies (run npm install manually)");
        }
      }

      console.log(chalk.green("\n✅ Project created successfully!\n"));
      console.log(chalk.white("Next steps:"));
      console.log(chalk.gray(`  cd ${name}`));
      console.log(chalk.gray("  wecon dev\n"));

    } catch (error) {
      spinner.fail("Failed to create project");
      console.error(chalk.red(error));
      process.exit(1);
    }
  });
