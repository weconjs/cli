# @weconjs/cli

> Command-line interface for the Wecon framework.

[![npm version](https://img.shields.io/npm/v/@weconjs/cli.svg)](https://www.npmjs.com/package/@weconjs/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Installation](#installation)
- [Commands](#commands)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Testing](#testing)

## Installation

```bash
npm install -g @weconjs/cli
# or use via npx
npx @weconjs/cli <command>
```

## Commands

### `wecon create <name>`

Scaffold a new Wecon project with `@weconjs/core` integration.

```bash
wecon create my-api
wecon create my-api --no-install  # Skip dependency installation
wecon create my-api --no-git      # Skip git initialization
```

**Options:**

| Flag | Description |
|------|-------------|
| `--git` | Initialize git repository (default: true) |
| `--no-install` | Skip running npm install |

---

### `wecon dev`

Start the development server with hot reload.

```bash
wecon dev                 # Default configuration
wecon dev --port 4000     # Custom port
wecon dev --mode staging  # Use staging mode configuration
```

**Options:**

| Flag | Description |
|------|-------------|
| `--port <number>` | Override the configured port |
| `--mode <string>` | Configuration mode (development, staging, production) |

---

### `wecon start`

Start the production server.

```bash
wecon start                # Uses production mode
wecon start --port 8080    # Custom port override
```

---

### `wecon build`

Compile TypeScript and prepare for production deployment.

```bash
wecon build                # Build to dist/
wecon build --mode staging # Build with staging configuration
```

**Output:**
- Compiled JavaScript in `dist/`
- Copied `public/` assets
- Environment file copied

---

### `wecon generate module <name>`

Generate a new module with standard structure.

```bash
wecon generate module products        # Basic module
wecon g module products --crud        # Include CRUD controller
```

**Options:**

| Flag | Description |
|------|-------------|
| `--crud` | Generate CRUD controller, service, and model |

---

## Project Structure

Running `wecon create my-api` generates the following structure:

```
my-api/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── bootstrap.ts               # Wecon instance and route configuration
│   └── modules/
│       ├── index.ts               # Module registry
│       └── users/                 # Example module
│           ├── users.module.ts    # Module definition (uses defineModule)
│           ├── controllers/
│           │   └── user.controller.ts
│           ├── services/
│           │   └── user.service.ts
│           ├── models/
│           │   └── user.model.ts
│           └── i18n/
│               └── en.translation.json
├── wecon.config.ts                # Framework configuration (uses defineConfig)
├── tsconfig.json                  # TypeScript configuration (NodeNext)
├── package.json                   # Dependencies and scripts
├── .env.development               # Development environment variables
├── .env.production.example        # Production environment template
├── .gitignore
└── README.md
```

### Key Files

| File | Purpose |
|------|---------|
| `wecon.config.ts` | Framework configuration using `defineConfig()` with mode-based settings |
| `src/main.ts` | Entry point using `createWecon()` for application bootstrap |
| `src/bootstrap.ts` | Wecon instance, routes, and RBAC configuration |
| `src/modules/index.ts` | Module registry for auto-loading |

### Generated Dependencies

| Package | Purpose |
|---------|---------|
| `@weconjs/core` | Framework utilities (config, modules, server factory) |
| `@weconjs/lib` | Routing with RBAC, Postman generation |
| `express` | Web framework (v5.x) |
| `mongoose` | MongoDB ODM |
| `winston` | Production logging |
| `tsx` | TypeScript execution (dev) |

---

## Quick Start

### Create and Run a New Project

```bash
# Create project
wecon create my-api
cd my-api

# Install dependencies (if skipped during creation)
npm install

# Start development server
npm run dev
```

### Generate Additional Modules

```bash
# Generate a products module with CRUD operations
wecon generate module products --crud

# Register in src/modules/index.ts
import productsModule from "./products/products.module.js";

export const modules = [
  usersModule,
  productsModule,
] as const;
```

### Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

---

## Configuration Example

The generated `wecon.config.ts`:

```typescript
import { defineConfig } from "@weconjs/core";

export default defineConfig({
  app: {
    name: "my-api",
    version: "1.0.0",
  },
  modes: {
    development: {
      port: 3000,
      database: {
        mongoose: {
          protocol: "mongodb",
          host: "localhost",
          port: 27017,
          database: "my-api",
        },
      },
      logging: { level: "debug" },
    },
    production: {
      port: 8080,
      database: {
        mongoose: {
          protocol: "mongodb+srv",
          host: process.env.DB_HOST,
          database: "my-api",
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        },
      },
      logging: { level: "info", enableFile: true },
    },
  },
  modules: ["./src/modules/users"],
  features: {
    i18n: { enabled: true, defaultLocale: "en" },
  },
});
```

---

## Testing

```bash
yarn test    # Run CLI tests
yarn build   # Build CLI package
```

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## License

MIT © [weconjs](https://github.com/weconjs)
