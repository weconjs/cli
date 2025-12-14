/**
 * Template Engine
 * 
 * Utility for rendering Handlebars templates.
 */

import Handlebars from "handlebars";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Templates are in dist/templates after build
const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

/**
 * Render a single template file with given data
 */
export function renderTemplate(templatePath: string, data: Record<string, unknown>): string {
  const fullPath = path.join(TEMPLATES_DIR, templatePath);
  const templateContent = fs.readFileSync(fullPath, "utf-8");
  const template = Handlebars.compile(templateContent);
  return template(data);
}

/**
 * Render a template and write to destination
 */
export async function renderTemplateToFile(
  templatePath: string,
  destPath: string,
  data: Record<string, unknown>
): Promise<void> {
  const content = renderTemplate(templatePath, data);
  await fs.ensureDir(path.dirname(destPath));
  await fs.writeFile(destPath, content);
}

/**
 * Copy and render all templates from a directory
 */
export async function copyTemplateDir(
  templateDir: string,
  destDir: string,
  data: Record<string, unknown>
): Promise<void> {
  const srcDir = path.join(TEMPLATES_DIR, templateDir);
  const files = await fs.readdir(srcDir, { recursive: true, withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) continue;

    const relativePath = path.relative(srcDir, path.join(file.parentPath || file.path, file.name));
    let destFileName = relativePath;

    // Handle dynamic file names like {{name}}.module.ts.hbs
    if (destFileName.includes("{{name}}")) {
      destFileName = destFileName.replace(/\{\{name\}\}/g, data.name as string);
    }

    // Remove .hbs extension
    if (destFileName.endsWith(".hbs")) {
      destFileName = destFileName.slice(0, -4);
    }

    const destPath = path.join(destDir, destFileName);
    const srcPath = path.join(srcDir, relativePath);

    if (relativePath.endsWith(".hbs")) {
      // Render template
      const templateContent = await fs.readFile(srcPath, "utf-8");
      const template = Handlebars.compile(templateContent);
      const content = template(data);
      await fs.ensureDir(path.dirname(destPath));
      await fs.writeFile(destPath, content);
    } else {
      // Copy as-is
      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(srcPath, destPath);
    }
  }
}

// Register Handlebars helpers
Handlebars.registerHelper("capitalize", (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper("uppercase", (str: string) => {
  if (!str) return "";
  return str.toUpperCase();
});

Handlebars.registerHelper("lowercase", (str: string) => {
  if (!str) return "";
  return str.toLowerCase();
});

Handlebars.registerHelper("json", (obj: unknown) => {
  return JSON.stringify(obj, null, 2);
});
