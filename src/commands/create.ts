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

export const createCommand = new Command("create")
  .description("Create a new Wecon project")
  .argument("<name>", "Project name")
  .option("--git", "Initialize git repository", true)
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
        "src/modules/users/controllers",
        "src/modules/users/services",
        "src/modules/users/routes",
        "src/modules/users/models",
        "src/modules/users/i18n",
        "src/shared/middleware",
        "src/shared/utils",
        "src/shared/types",
        "public",
        "logs",
      ];

      for (const dir of dirs) {
        fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
      }

      spinner.text = "Creating configuration files...";

      // ========== package.json ==========
      const packageJson = {
        name,
        version: "1.0.0",
        description: "A Wecon-powered API",
        type: "module",
        scripts: {
          dev: "tsx --watch src/main.ts",
          start: "node dist/main.js",
          build: "tsc && cp -r public dist/ 2>/dev/null || true",
          "generate:module": "wecon generate module",
        },
        dependencies: {
          "@weconjs/core": "^0.2.0",
          "@weconjs/lib": "^1.0.0",
          express: "^5.0.1",
          mongoose: "^8.0.0",
          cors: "^2.8.5",
          helmet: "^7.1.0",
          winston: "^3.18.0",
        },
        devDependencies: {
          typescript: "^5.3.0",
          "@types/node": "^20.10.0",
          "@types/express": "^5.0.0",
          "@types/cors": "^2.8.17",
          tsx: "^4.7.0",
        },
      };
      fs.writeFileSync(
        path.join(projectPath, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      // ========== wecon.config.ts ==========
      const weconConfig = `/**
 * Wecon Framework Configuration
 */

import { defineConfig } from "@weconjs/core";

export default defineConfig({
  // App metadata
  app: {
    name: "${name}",
    version: "1.0.0",
  },

  // Runtime modes
  modes: {
    development: {
      port: 3000,
      database: {
        mongoose: {
          protocol: "mongodb",
          host: "localhost",
          port: 27017,
          database: "${name}",
        },
      },
      logging: {
        level: "debug",
      },
    },

    production: {
      port: 8080,
      database: {
        mongoose: {
          protocol: "mongodb+srv",
          host: process.env.DB_HOST || "localhost",
          database: "${name}",
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        },
      },
      logging: {
        level: "info",
        enableFile: true,
      },
    },
  },

  // Module registration
  modules: [
    "./src/modules/users",
  ],

  // Feature toggles
  features: {
    i18n: {
      enabled: true,
      defaultLocale: "en",
      supported: ["en"],
    },
  },
});
`;
      fs.writeFileSync(path.join(projectPath, "wecon.config.ts"), weconConfig);

      // ========== tsconfig.json ==========
      const tsConfig = {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          outDir: "./dist",
          rootDir: "./src",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          declaration: true,
        },
        include: ["src/**/*", "wecon.config.ts"],
        exclude: ["node_modules", "dist"],
      };
      fs.writeFileSync(
        path.join(projectPath, "tsconfig.json"),
        JSON.stringify(tsConfig, null, 2)
      );

      // ========== src/main.ts ==========
      const mainTs = `/**
 * Wecon Application Entry Point
 *
 * Simplified entry using @weconjs/core
 */

import path from "path";
import {
  createWecon,
  loadConfig,
  buildUriFromConfig,
  type WeconContext,
} from "@weconjs/core";

async function main() {
  // Load configuration
  const config = await loadConfig(
    path.resolve(process.cwd(), "wecon.config.ts"),
    process.env.NODE_ENV
  );

  console.log(\`\\n🚀 Starting \${config.app.name} v\${config.app.version}\`);
  console.log(\`📦 Mode: \${config.mode}\\n\`);

  // Import modules after config is loaded
  const { wecon, modules } = await import("./bootstrap.js");

  // Create and start the application
  const app = await createWecon({
    config,
    modules: [...modules],
    wecon,
    middleware: [],
    database: {
      enabled: true,
      uri: buildUriFromConfig(config.database),
    },
    i18n: {
      enabled: config.features?.i18n?.enabled ?? false,
      modulesDir: "./src/modules",
    },
    logger: {
      useWinston: true,
      enableFile: config.logging?.enableFile ?? false,
    },
    hooks: {
      onBoot: async (ctx: WeconContext) => {
        ctx.logger.info("Application ready to receive requests");
      },
      onShutdown: async (ctx: WeconContext) => {
        ctx.logger.info("Application shutting down...");
      },
    },
  });

  await app.start();
}

main().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
`;
      fs.writeFileSync(path.join(projectPath, "src/main.ts"), mainTs);

      // ========== src/bootstrap.ts ==========
      const bootstrap = `/**
 * Application Bootstrap
 */

import Wecon, { Routes } from "@weconjs/lib";
import { modules } from "./modules/index.js";

// Build API routes from modules
const apiRoutes = new Routes({
  prefix: "",
  routes: modules.map((m) => m.routes),
});

// Create Wecon application
const wecon = new Wecon()
  .routes(apiRoutes)
  .roles(["admin", "user", "guest"])
  .guestRole("guest")
  .build();

export { wecon, modules };
`;
      fs.writeFileSync(path.join(projectPath, "src/bootstrap.ts"), bootstrap);

      // ========== src/modules/index.ts ==========
      const modulesIndex = `/**
 * Module Registry
 * 
 * Import and register all modules here.
 */

import usersModule from "./users/users.module.js";

export const modules = [
  usersModule,
] as const;
`;
      fs.writeFileSync(path.join(projectPath, "src/modules/index.ts"), modulesIndex);

      // ========== src/modules/users/users.module.ts ==========
      const usersModule = `/**
 * Users Module
 */

import { defineModule } from "@weconjs/core";
import { Routes, Route, PostmanGroup } from "@weconjs/lib";
import { userController } from "./controllers/user.controller.js";

const usersRoutes = new Routes({
  prefix: "/users",
  postman: new PostmanGroup({ folderName: "Users" }),
  routes: [
    new Route({
      method: "get",
      path: "/",
      handler: userController.findAll,
      description: "Get all users",
    }),
    new Route({
      method: "get",
      path: "/:id",
      handler: userController.findOne,
      description: "Get user by ID",
    }),
    new Route({
      method: "post",
      path: "/",
      handler: userController.create,
      description: "Create a new user",
    }),
    new Route({
      method: "put",
      path: "/:id",
      handler: userController.update,
      description: "Update user",
    }),
    new Route({
      method: "delete",
      path: "/:id",
      handler: userController.delete,
      description: "Delete user",
    }),
  ],
});

export default defineModule({
  name: "users",
  description: "User management module",
  routes: usersRoutes,
});
`;
      fs.writeFileSync(path.join(projectPath, "src/modules/users/users.module.ts"), usersModule);

      // ========== src/modules/users/controllers/user.controller.ts ==========
      const userController = `/**
 * User Controller
 */

import type { Request, Response } from "express";
import { userService } from "../services/user.service.js";

class UserController {
  async findAll(req: Request, res: Response) {
    try {
      const users = await userService.findAll();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const user = await userService.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = await userService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = await userService.update(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const deleted = await userService.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}

export const userController = new UserController();
`;
      fs.writeFileSync(
        path.join(projectPath, "src/modules/users/controllers/user.controller.ts"),
        userController
      );

      // ========== src/modules/users/services/user.service.ts ==========
      const userService = `/**
 * User Service
 */

import { User, IUser } from "../models/user.model.js";

class UserService {
  async findAll(): Promise<IUser[]> {
    return User.find().select("-password");
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select("-password");
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    await user.save();
    const userObj = user.toObject();
    delete (userObj as any).password;
    return userObj;
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true }).select("-password");
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }
}

export const userService = new UserService();
`;
      fs.writeFileSync(
        path.join(projectPath, "src/modules/users/services/user.service.ts"),
        userService
      );

      // ========== src/modules/users/models/user.model.ts ==========
      const userModel = `/**
 * User Model
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);
`;
      fs.writeFileSync(
        path.join(projectPath, "src/modules/users/models/user.model.ts"),
        userModel
      );

      // ========== src/modules/users/i18n/en.translation.json ==========
      const usersI18n = JSON.stringify(
        {
          user_created: "User created successfully",
          user_updated: "User updated successfully",
          user_deleted: "User deleted successfully",
          user_not_found: "User not found",
        },
        null,
        2
      );
      fs.writeFileSync(
        path.join(projectPath, "src/modules/users/i18n/en.translation.json"),
        usersI18n
      );

      // ========== .env.development ==========
      const envDev = `# Development Environment
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/${name}

# JWT (optional)
JWT_SECRET=your-development-secret-key
JWT_EXPIRES_IN=7d
`;
      fs.writeFileSync(path.join(projectPath, ".env.development"), envDev);

      // ========== .env.production.example ==========
      const envProdExample = `# Production Environment
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb://your-production-database-url

# JWT
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d
`;
      fs.writeFileSync(path.join(projectPath, ".env.production.example"), envProdExample);

      // ========== .gitignore ==========
      const gitignore = `# Dependencies
node_modules/

# Build output
dist/

# Logs
logs/
*.log

# Environment files
.env
.env.production
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Coverage
coverage/
`;
      fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignore);

      // ========== README.md ==========
      const readme = `# ${name}

A Wecon-powered API.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## API Endpoints

- \`GET /health\` - Health check
- \`GET /api/v1/users\` - Get all users
- \`GET /api/v1/users/:id\` - Get user by ID
- \`POST /api/v1/users\` - Create user
- \`PUT /api/v1/users/:id\` - Update user
- \`DELETE /api/v1/users/:id\` - Delete user

## Generate New Module

\`\`\`bash
wecon generate module <module-name>
\`\`\`

## Project Structure

\`\`\`
src/
├── modules/           # Feature modules
│   └── users/
│       ├── users.module.ts
│       ├── controllers/
│       ├── services/
│       └── models/
├── shared/            # Shared utilities
│   ├── middleware/
│   ├── utils/
│   └── server/
└── bootstrap.ts       # Application entry
\`\`\`
`;
      fs.writeFileSync(path.join(projectPath, "README.md"), readme);

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
      console.log(chalk.gray("  npm run dev\n"));
      console.log(chalk.cyan("Happy coding! 🎉\n"));

    } catch (error) {
      spinner.fail("Failed to create project");
      console.error(chalk.red(error));
      process.exit(1);
    }
  });
