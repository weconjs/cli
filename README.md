# @weconjs/cli

> Command-line interface for the Wecon framework.

[![npm version](https://img.shields.io/npm/v/@weconjs/cli.svg)](https://www.npmjs.com/package/@weconjs/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install -g @weconjs/cli
# or
npx @weconjs/cli <command>
```

## Commands

### `wecon create <name>`

Create a new Wecon project.

```bash
wecon create my-api
wecon create my-api --git       # Initialize git
wecon create my-api --no-install  # Skip npm install
```

**Creates:**
- `wecon.config.ts` - Framework configuration
- `src/modules/` - Module directory
- `src/shared/` - Shared utilities
- `package.json` - With Wecon dependencies

### `wecon dev`

Start development server with hot reload.

```bash
wecon dev                 # Default port 3000
wecon dev --port 4000     # Custom port
wecon dev --mode staging  # Use staging config
```

### `wecon start`

Start production server.

```bash
wecon start                # Uses production mode
wecon start --port 8080    # Custom port
```

### `wecon build`

Build project for production.

```bash
wecon build                # Build to dist/
wecon build --mode staging # Build with staging config
```

**Output:**
- Compiled TypeScript to `dist/`
- Copied `public/` folder
- Copied environment file

### `wecon generate module <name>`

Generate a new module.

```bash
wecon generate module users        # Basic module
wecon g module users --crud        # With CRUD controller
```

**Creates:**
- `src/modules/<name>/<name>.module.ts`
- `src/modules/<name>/controllers/`
- `src/modules/<name>/services/`
- `src/modules/<name>/routes/`
- `src/modules/<name>/models/`
- `src/modules/<name>/i18n/en.translation.json`

## Quick Start

```bash
# Create new project
wecon create my-api
cd my-api

# Generate a module
wecon generate module users --crud

# Start development
wecon dev

# Build for production
wecon build
wecon start
```

## Testing

```bash
yarn test    # Run tests
yarn build   # Build CLI
```

## License

MIT © [weconjs](https://github.com/weconjs)
