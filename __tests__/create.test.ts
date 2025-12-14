/**
 * CLI Create Command Tests
 *
 * Tests for `wecon create <name>` command
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";

// Test directory
const testDir = path.join(__dirname, "temp-create-test");

describe("wecon create command", () => {
  beforeEach(() => {
    // Clean test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("project scaffolding", () => {
    it("should create project directory structure", async () => {
      const projectName = "test-project";
      const projectPath = path.join(testDir, projectName);

      // Run create command
      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} create ${projectName} --no-install`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        // Command may fail on dependencies, but structure should be created
      }

      // Check structure exists
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, "src/modules"))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, "src/main.ts"))).toBe(true);
    });

    it("should create package.json with correct name", async () => {
      const projectName = "my-api";
      const projectPath = path.join(testDir, projectName);

      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} create ${projectName} --no-install`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        // Expected
      }

      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectPath, "package.json"), "utf-8")
      );

      expect(packageJson.name).toBe(projectName);
      expect(packageJson.version).toBe("1.0.0");
      expect(packageJson.scripts.dev).toContain("tsx");
      expect(packageJson.dependencies["@weconjs/core"]).toBeDefined();
    });

    it("should create wecon.config.ts", async () => {
      const projectName = "config-test";
      const projectPath = path.join(testDir, projectName);

      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} create ${projectName} --no-install`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        // Expected
      }

      const configPath = path.join(projectPath, "wecon.config.ts");
      expect(fs.existsSync(configPath)).toBe(true);

      const configContent = fs.readFileSync(configPath, "utf-8");
      expect(configContent).toContain("export default");
      expect(configContent).toContain(projectName);
    });

    it("should create bootstrap.ts", async () => {
      const projectName = "bootstrap-test";
      const projectPath = path.join(testDir, projectName);

      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} create ${projectName} --no-install`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        // Expected
      }

      expect(fs.existsSync(path.join(projectPath, "src/bootstrap.ts"))).toBe(true);
    });

    it("should create .gitignore", async () => {
      const projectName = "gitignore-test";
      const projectPath = path.join(testDir, projectName);

      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} create ${projectName} --no-install`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        // Expected
      }

      const gitignorePath = path.join(projectPath, ".gitignore");
      expect(fs.existsSync(gitignorePath)).toBe(true);

      const content = fs.readFileSync(gitignorePath, "utf-8");
      expect(content).toContain("node_modules");
      expect(content).toContain("dist");
    });

    it("should fail if directory already exists", async () => {
      const projectName = "existing-dir";
      const projectPath = path.join(testDir, projectName);

      // Create directory first
      fs.mkdirSync(projectPath, { recursive: true });

      // Try to create project
      let errorOccurred = false;
      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} create ${projectName} --no-install`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        errorOccurred = true;
      }

      expect(errorOccurred).toBe(true);
    });
  });
});
