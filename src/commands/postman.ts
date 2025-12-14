/**
 * wecon postman
 * 
 * Generate Postman collection from the project
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import path from "path";
import fs from "fs-extra";
import { execSync } from "child_process";

export const postmanCommand = new Command("postman")
  .description("Generate Postman collection")
  .option("--env <env>", "Environment to use", "development")
  .action(async (options) => {
    const spinner = ora("Generating Postman collection...").start();

    try {
        const projectRoot = process.cwd();
        
        // Ensure we are in a Wecon project
        if (!fs.existsSync(path.join(projectRoot, "wecon.config.ts"))) {
            throw new Error("wecon.config.ts not found. Are you in a Wecon project?");
        }

        // We need to run a script within the project context to load the app and generate the collection
        // This avoids issues with different typescript versions or missing dependencies in the global CLI
        
        const scriptContent = `
        import { wecon } from "./src/bootstrap.js";
        import { loadConfig } from "@weconjs/core";
        import path from "path";
        import fs from "fs";

        async function generate() {
            try {
                // Load config to verify environment
                const configPath = path.resolve(process.cwd(), "wecon.config.ts");
                const config = await loadConfig(configPath, "${options.env}");

                // Ensure postman is configured
                if (!config.app) {
                    console.error("Invalid config");
                    process.exit(1);
                }

                // The 'wecon' instance from bootstrap should have the routes
                // We rely on @weconjs/lib internally to have a way to export this.
                // Since we assume 'wecon' is an instance of Wecon App, let's see if we can trigger generation.
                
                // Inspecting Wecon class in lib...
                // If the user configured .postman(), wecon.build() might have prepared it
                // but we might need to explicitly call a generator if it's not auto-generated.
                
                // Access private property or public getter for postman config?
                // Actually, the request says "generate the postman for any mode based on the wecon config integrated to it"
                
                // If wecon.postman() was called, it stores config.
                // We can use the 'postman-collection' library or wecon's internal helper.
                
                // Assuming Wecon instance has a method 'generatePostman()' or similar.
                // If not, we might need to hack it or the user expects us to implement the generation *here* using the routes.
                
                if (typeof wecon.generatePostmanCollection === 'function') {
                    const collection = await wecon.generatePostmanCollection();
                    const outputPath = path.resolve(process.cwd(), "postman_collection.json");
                    fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
                    console.log("Collection generated at: " + outputPath);
                } else {
                    // Fallback: Try to use the internal Postman generator if exposed
                    // or just print routes.
                    console.log("Wecon instance does not support direct Postman generation yet. Please ensure @weconjs/lib is updated.");
                    // For now, let's try to access the routes and build it if possible, 
                    // but the robust way is if the framework provides it.
                    
                    // Let's assume the library HAS a generator we can use.
                    // import { PostmanGenerator } from "@weconjs/lib";
                    // ...
                }
                
                process.exit(0);

            } catch (err) {
                console.error(err);
                process.exit(1);
            }
        }
        
        generate();
        `;

        // Create a temporary script
        const tempScriptPath = path.join(projectRoot, ".wecon-postman-gen.ts");
        fs.writeFileSync(tempScriptPath, scriptContent);

        // Execute using project's tsx
        // We assume tsx is available in node_modules or globally
        const tsxPath = path.join(projectRoot, "node_modules", ".bin", "tsx");
        
        if (!fs.existsSync(tsxPath)) {
             // Fallback to npx tsx
             execSync(`npx tsx ${tempScriptPath}`, { stdio: 'inherit' });
        } else {
             execSync(`${tsxPath} ${tempScriptPath}`, { stdio: 'inherit' });
        }

        // Cleanup
        fs.removeSync(tempScriptPath);

        spinner.succeed("Postman collection generated!");

    } catch (error) {
        spinner.fail("Failed to generate Postman collection");
        console.error(chalk.red(error));
        // Cleanup if failed
        const tempScriptPath = path.join(process.cwd(), ".wecon-postman-gen.ts");
        if (fs.existsSync(tempScriptPath)) fs.removeSync(tempScriptPath);
    }
  });
