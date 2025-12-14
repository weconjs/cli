/**
 * wecon generate
 *
 * Generate new modules and resources.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import fs from "fs-extra";
import path from "path";

export const generateCommand = new Command("generate")
  .description("Generate new resources")
  .alias("g");

// Generate module subcommand
generateCommand
  .command("module <name>")
  .description("Generate a new module")
  .option("--crud", "Include CRUD routes")
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
      const dirs = [
        "",
        "controllers",
        "services",
        "routes",
        "models",
        "i18n",
      ];

      for (const dir of dirs) {
        fs.mkdirSync(path.join(modulePath, dir), { recursive: true });
      }

      // Create module definition
      const moduleContent = `/**
 * ${name.charAt(0).toUpperCase() + name.slice(1)} Module
 */

import { Routes, PostmanGroup } from "@weconjs/lib";
import { defineModule } from "@/modules/module.utils";

export default defineModule({
  name: "${name}",
  description: "${name.charAt(0).toUpperCase() + name.slice(1)} module",
  routes: new Routes({
    prefix: "/${name}",
    postman: new PostmanGroup({ folderName: "${name.charAt(0).toUpperCase() + name.slice(1)}" }),
    routes: [],
  }),
});
`;
      fs.writeFileSync(path.join(modulePath, `${name}.module.ts`), moduleContent);

      // Create translation file
      const i18nContent = `{
  "welcome": "Welcome to ${name} module"
}
`;
      fs.writeFileSync(path.join(modulePath, "i18n/en.translation.json"), i18nContent);

      // Create controller template
      if (options.crud) {
        const controllerContent = `/**
 * ${name.charAt(0).toUpperCase() + name.slice(1)} Controller
 */

import type { Request, Response } from "express";

export class ${name.charAt(0).toUpperCase() + name.slice(1)}Controller {
  async findAll(req: Request, res: Response) {
    res.json({ message: "Get all ${name}" });
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ message: \`Get ${name} \${id}\` });
  }

  async create(req: Request, res: Response) {
    res.json({ message: "Create ${name}" });
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ message: \`Update ${name} \${id}\` });
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ message: \`Delete ${name} \${id}\` });
  }
}

export const ${name}Controller = new ${name.charAt(0).toUpperCase() + name.slice(1)}Controller();
`;
        fs.writeFileSync(
          path.join(modulePath, `controllers/${name}.controller.ts`),
          controllerContent
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
