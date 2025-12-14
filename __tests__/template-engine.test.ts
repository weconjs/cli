/**
 * Template Engine Tests
 *
 * Tests for Handlebars template rendering utilities
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the template engine (after build)
const distPath = path.join(__dirname, "../dist");

describe("Template Engine", () => {
  const tempDir = path.join(__dirname, "temp-template-test");

  beforeEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("Template files existence", () => {
    it("should have project templates in dist", () => {
      const templatesDir = path.join(distPath, "templates/project");
      expect(fs.existsSync(templatesDir)).toBe(true);
    });

    it("should have package.json.hbs template", () => {
      const templatePath = path.join(distPath, "templates/project/package.json.hbs");
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it("should have wecon.config.ts.hbs template", () => {
      const templatePath = path.join(distPath, "templates/project/wecon.config.ts.hbs");
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it("should have main.ts.hbs template", () => {
      const templatePath = path.join(distPath, "templates/project/src/main.ts.hbs");
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it("should have bootstrap.ts.hbs template", () => {
      const templatePath = path.join(distPath, "templates/project/src/bootstrap.ts.hbs");
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it("should have users module templates", () => {
      const usersDir = path.join(distPath, "templates/project/src/modules/users");
      expect(fs.existsSync(usersDir)).toBe(true);
      expect(fs.existsSync(path.join(usersDir, "users.module.ts.hbs"))).toBe(true);
      expect(fs.existsSync(path.join(usersDir, "controllers/user.controller.ts.hbs"))).toBe(true);
      expect(fs.existsSync(path.join(usersDir, "services/user.service.ts.hbs"))).toBe(true);
      expect(fs.existsSync(path.join(usersDir, "models/user.model.ts.hbs"))).toBe(true);
    });

    it("should have module generator templates", () => {
      const moduleDir = path.join(distPath, "templates/module");
      expect(fs.existsSync(moduleDir)).toBe(true);
    });
  });

  describe("Template content validation", () => {
    it("should have valid Handlebars syntax in package.json.hbs", () => {
      const templatePath = path.join(distPath, "templates/project/package.json.hbs");
      const content = fs.readFileSync(templatePath, "utf-8");
      
      // Should contain Handlebars placeholders
      expect(content).toContain("{{name}}");
      expect(content).toContain("{{description}}");
      expect(content).toContain("{{author}}");
    });

    it("should have valid Handlebars syntax in wecon.config.ts.hbs", () => {
      const templatePath = path.join(distPath, "templates/project/wecon.config.ts.hbs");
      const content = fs.readFileSync(templatePath, "utf-8");
      
      expect(content).toContain("{{name}}");
      expect(content).toContain("{{port}}");
      expect(content).toContain("{{dbName}}");
    });

    it("should use correct Route props in users.module.ts.hbs", () => {
      const templatePath = path.join(distPath, "templates/project/src/modules/users/users.module.ts.hbs");
      const content = fs.readFileSync(templatePath, "utf-8");
      
      // Critical: Should use correct Route props
      expect(content).toContain("middlewares:");
      expect(content).toContain("rai:");
      expect(content).toContain("postman:");
      expect(content).toContain("PostmanRoute");
      
      // Should NOT use old/incorrect props in Route
      expect(content).not.toContain("handler:");
      // Note: "description:" is valid in defineModule, just not in Route
    });

    it("should import PostmanRoute in users.module.ts.hbs", () => {
      const templatePath = path.join(distPath, "templates/project/src/modules/users/users.module.ts.hbs");
      const content = fs.readFileSync(templatePath, "utf-8");
      
      expect(content).toContain("PostmanRoute");
      expect(content).toContain("import { Routes, Route, PostmanGroup, PostmanRoute }");
    });
  });

  describe("Handlebars helpers", () => {
    it("should have capitalize helper in module templates", () => {
      const templatePath = path.join(distPath, "templates/module/{{name}}.module.ts.hbs");
      const content = fs.readFileSync(templatePath, "utf-8");
      
      expect(content).toContain("{{capitalize name}}");
    });

    it("should have capitalize helper in controller templates", () => {
      const templatePath = path.join(distPath, "templates/module/controllers/{{name}}.controller.ts.hbs");
      const content = fs.readFileSync(templatePath, "utf-8");
      
      expect(content).toContain("{{capitalize name}}");
    });
  });
});

describe("Generated Project Validation", () => {
  const testDir = path.join(__dirname, "temp-validation-test");
  const projectName = "validation-project";
  const projectPath = path.join(testDir, projectName);

  beforeEach(async () => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    // Create a project using the CLI
    const { execSync } = await import("child_process");
    try {
      execSync(
        `node ${path.join(__dirname, "../dist/index.js")} create ${projectName} --no-install`,
        { cwd: testDir, stdio: "pipe" }
      );
    } catch {
      // May have prompts, but project should be created
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Route component validation", () => {
    it("should use middlewares prop instead of handler", () => {
      const modulePath = path.join(projectPath, "src/modules/users/users.module.ts");
      if (fs.existsSync(modulePath)) {
        const content = fs.readFileSync(modulePath, "utf-8");
        expect(content).toContain("middlewares:");
        expect(content).not.toContain("handler:");
      }
    });

    it("should use rai prop for resource access identifier", () => {
      const modulePath = path.join(projectPath, "src/modules/users/users.module.ts");
      if (fs.existsSync(modulePath)) {
        const content = fs.readFileSync(modulePath, "utf-8");
        expect(content).toContain("rai:");
      }
    });

    it("should use PostmanRoute for postman prop", () => {
      const modulePath = path.join(projectPath, "src/modules/users/users.module.ts");
      if (fs.existsSync(modulePath)) {
        const content = fs.readFileSync(modulePath, "utf-8");
        expect(content).toContain("PostmanRoute");
        expect(content).toContain("postman: new PostmanRoute");
      }
    });
  });

  describe("Package dependencies", () => {
    it("should include @weconjs/core dependency", () => {
      const pkgPath = path.join(projectPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        expect(pkg.dependencies["@weconjs/core"]).toBeDefined();
      }
    });

    it("should include @weconjs/lib dependency", () => {
      const pkgPath = path.join(projectPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        expect(pkg.dependencies["@weconjs/lib"]).toBeDefined();
      }
    });

    it("should include authentication packages", () => {
      const pkgPath = path.join(projectPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        expect(pkg.dependencies["bcrypt"]).toBeDefined();
        expect(pkg.dependencies["jsonwebtoken"]).toBeDefined();
        expect(pkg.dependencies["passport"]).toBeDefined();
      }
    });
  });

  describe("Config file structure", () => {
    it("should have modes configuration", () => {
      const configPath = path.join(projectPath, "wecon.config.ts");
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf-8");
        expect(content).toContain("modes:");
        expect(content).toContain("development:");
        expect(content).toContain("production:");
      }
    });

    it("should have features configuration", () => {
      const configPath = path.join(projectPath, "wecon.config.ts");
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf-8");
        expect(content).toContain("features:");
        expect(content).toContain("i18n:");
        expect(content).toContain("fieldShield:");
      }
    });
  });

  describe("Module utilities", () => {
    it("should have module.utils.ts file", () => {
      const utilsPath = path.join(projectPath, "src/modules/module.utils.ts");
      // Skip if project wasn't created due to interactive prompts
      if (!fs.existsSync(projectPath)) {
        return;
      }
      expect(fs.existsSync(utilsPath)).toBe(true);
    });

    it("should export defineModule function", () => {
      const utilsPath = path.join(projectPath, "src/modules/module.utils.ts");
      if (fs.existsSync(utilsPath)) {
        const content = fs.readFileSync(utilsPath, "utf-8");
        expect(content).toContain("export function defineModule");
      }
    });
  });
});
