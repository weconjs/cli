/**
 * CLI Generate Command Tests
 *
 * Tests for `wecon generate module <name>` command
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";

// Test directory - simulates a Wecon project
const testDir = path.join(__dirname, "temp-generate-test");
const modulesDir = path.join(testDir, "src/modules");

describe("wecon generate module command", () => {
  beforeEach(() => {
    // Clean and create test directory with project structure
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(modulesDir, { recursive: true });

    // Create minimal wecon.config.ts
    fs.writeFileSync(
      path.join(testDir, "wecon.config.ts"),
      'export default { app: { name: "test" } };'
    );

    // Create module.utils.ts
    fs.writeFileSync(
      path.join(modulesDir, "module.utils.ts"),
      'export function defineModule(config: any) { return config; }'
    );
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("module generation", () => {
    it("should create module directory structure", async () => {
      const moduleName = "users";

      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} generate module ${moduleName}`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        // May have stderr output
      }

      const modulePath = path.join(modulesDir, moduleName);
      expect(fs.existsSync(modulePath)).toBe(true);
      expect(fs.existsSync(path.join(modulePath, "controllers"))).toBe(true);
      expect(fs.existsSync(path.join(modulePath, "services"))).toBe(true);
      expect(fs.existsSync(path.join(modulePath, "routes"))).toBe(true);
      expect(fs.existsSync(path.join(modulePath, "models"))).toBe(true);
      expect(fs.existsSync(path.join(modulePath, "i18n"))).toBe(true);
    });

    it("should create module definition file", async () => {
      const moduleName = "products";

      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} generate module ${moduleName}`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        // Expected
      }

      const moduleFile = path.join(modulesDir, moduleName, `${moduleName}.module.ts`);
      expect(fs.existsSync(moduleFile)).toBe(true);

      const content = fs.readFileSync(moduleFile, "utf-8");
      expect(content).toContain("defineModule");
      expect(content).toContain(`name: "${moduleName}"`);
    });

    it("should create translation file", async () => {
      const moduleName = "orders";

      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} generate module ${moduleName}`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        // Expected
      }

      const i18nFile = path.join(modulesDir, moduleName, "i18n/en.translation.json");
      expect(fs.existsSync(i18nFile)).toBe(true);

      const content = JSON.parse(fs.readFileSync(i18nFile, "utf-8"));
      expect(content.welcome).toContain(moduleName);
    });

    it("should create CRUD controller with --crud flag", async () => {
      const moduleName = "items";

      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} generate module ${moduleName} --crud`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        // Expected
      }

      const controllerFile = path.join(
        modulesDir,
        moduleName,
        `controllers/${moduleName}.controller.ts`
      );
      expect(fs.existsSync(controllerFile)).toBe(true);

      const content = fs.readFileSync(controllerFile, "utf-8");
      expect(content).toContain("findAll");
      expect(content).toContain("findOne");
      expect(content).toContain("create");
      expect(content).toContain("update");
      expect(content).toContain("delete");
    });

    it("should fail if module already exists", async () => {
      const moduleName = "existing";
      const modulePath = path.join(modulesDir, moduleName);

      // Create module first
      fs.mkdirSync(modulePath, { recursive: true });

      let errorOccurred = false;
      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} generate module ${moduleName}`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        errorOccurred = true;
      }

      expect(errorOccurred).toBe(true);
    });

    it("should use alias 'g' for generate", async () => {
      const moduleName = "alias-test";

      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} g module ${moduleName}`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        // Expected
      }

      const modulePath = path.join(modulesDir, moduleName);
      expect(fs.existsSync(modulePath)).toBe(true);
    });
  });
});
