/**
 * wecon generate
 *
 * Generate new modules and resources.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { copyTemplateDir, renderTemplateToFile } from "../utils/template-engine.js";

export const generateCommand = new Command("generate")
  .description("Generate new resources")
  .alias("g");

// Generate module subcommand
generateCommand
  .command("module <name>")
  .description("Generate a new module")
  .option("--crud", "Include CRUD controller")
  .action(async (name: string, options: { crud?: boolean }) => {
    console.log(chalk.cyan(`\n📦 Generating module: ${name}\n`));

    const modulesDir = path.resolve(process.cwd(), "src/modules");
    const modulePath = path.join(modulesDir, name);

    // Check if module exists
    if (fs.existsSync(modulePath)) {
      console.log(chalk.red(`Error: Module "${name}" already exists.`));
      process.exit(1);
    }

    const spinner = ora("Creating module structure...").start();

    try {
      // Create directories
      const dirs = ["", "controllers", "services", "routes", "models", "i18n"];
      for (const dir of dirs) {
        fs.mkdirSync(path.join(modulePath, dir), { recursive: true });
      }

      const templateData = { name };

      // Render module file
      await renderTemplateToFile(
        "module/{{name}}.module.ts.hbs",
        path.join(modulePath, `${name}.module.ts`),
        templateData
      );

      // Render i18n file
      await renderTemplateToFile(
        "module/i18n/en.translation.json.hbs",
        path.join(modulePath, "i18n/en.translation.json"),
        templateData
      );

      // Render controller if CRUD requested
      if (options.crud) {
        await renderTemplateToFile(
          "module/controllers/{{name}}.controller.ts.hbs",
          path.join(modulePath, `controllers/${name}.controller.ts`),
          templateData
        );
      }

      spinner.succeed("Module created");

      console.log(chalk.green(`\n✅ Module "${name}" created successfully!\n`));
      console.log(chalk.gray(`Location: ${modulePath}`));
      console.log(chalk.gray("Don't forget to register it in src/modules/index.ts\n"));
    } catch (error) {
      spinner.fail("Failed to generate module");
      console.error(chalk.red(error));
      process.exit(1);
    }
  });
