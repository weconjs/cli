/**
 * CLI Command Tests
 *
 * Tests for dev, start, build commands and CLI entry
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { execSync, spawn } from "child_process";

// Test directory
const testDir = path.join(__dirname, "temp-commands-test");

describe("CLI Commands", () => {
  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("CLI entry", () => {
    it("should display help when no command is provided", () => {
      const output = execSync(
        `node ${path.join(__dirname, "../dist/index.js")} --help`,
        { encoding: "utf-8" }
      );

      expect(output).toContain("Wecon Framework CLI");
      expect(output).toContain("create");
      expect(output).toContain("dev");
      expect(output).toContain("start");
      expect(output).toContain("build");
      expect(output).toContain("generate");
    });

    it("should display version", () => {
      const output = execSync(
        `node ${path.join(__dirname, "../dist/index.js")} --version`,
        { encoding: "utf-8" }
      );

      // Should match semver format (e.g., "1.2.2")
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should display logo in help", () => {
      const output = execSync(
        `node ${path.join(__dirname, "../dist/index.js")} --help`,
        { encoding: "utf-8" }
      );

      expect(output).toContain("██");  // ASCII art contains block characters
    });
  });

  describe("wecon dev command", () => {
    it("should show help for dev command", () => {
      const output = execSync(
        `node ${path.join(__dirname, "../dist/index.js")} dev --help`,
        { encoding: "utf-8" }
      );

      expect(output).toContain("Start development server");
      expect(output).toContain("--port");
      expect(output).toContain("--mode");
    });

    it("should fail without wecon.config.ts", () => {
      let errorOccurred = false;
      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} dev`,
          { cwd: testDir, stdio: "pipe", timeout: 5000 }
        );
      } catch (error) {
        errorOccurred = true;
      }

      expect(errorOccurred).toBe(true);
    });
  });

  describe("wecon start command", () => {
    it("should show help for start command", () => {
      const output = execSync(
        `node ${path.join(__dirname, "../dist/index.js")} start --help`,
        { encoding: "utf-8" }
      );

      expect(output).toContain("Start production server");
      expect(output).toContain("--port");
      expect(output).toContain("--mode");
    });
  });

  describe("wecon build command", () => {
    it("should show help for build command", () => {
      const output = execSync(
        `node ${path.join(__dirname, "../dist/index.js")} build --help`,
        { encoding: "utf-8" }
      );

      expect(output).toContain("Build for production");
      expect(output).toContain("--mode");
    });

    it("should fail without wecon.config.ts", () => {
      let errorOccurred = false;
      try {
        execSync(
          `node ${path.join(__dirname, "../dist/index.js")} build`,
          { cwd: testDir, stdio: "pipe" }
        );
      } catch (error) {
        errorOccurred = true;
      }

      expect(errorOccurred).toBe(true);
    });
  });

  describe("wecon generate command", () => {
    it("should show help for generate command", () => {
      const output = execSync(
        `node ${path.join(__dirname, "../dist/index.js")} generate --help`,
        { encoding: "utf-8" }
      );

      expect(output).toContain("Generate new resources");
      expect(output).toContain("module");
    });
  });
});
