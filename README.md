# Sprout 🌱

A modern web application built with Deno, Hono, Tailwind CSS, and Hotwire.

## Quick Start

### Development Mode

Run the development server with automatic rebuilding of CSS and JS:

```bash
deno task dev
```

This will:
- Start the web server on http://localhost:8000
- Watch and rebuild CSS files automatically
- Watch and rebuild JavaScript files automatically
- Reload the server when backend code changes

### Production Build

Build optimized assets for production:

```bash
deno task build
```

Then start the server:

```bash
deno task start
```

## Available Commands

- `deno task dev` - Start development server with watchers
- `deno task build` - Build all assets (CSS + JS)
- `deno task build:css` - Build CSS only
- `deno task build:js` - Build JavaScript only
- `deno task watch:css` - Watch and rebuild CSS
- `deno task watch:js` - Watch and rebuild JavaScript
- `deno task start` - Start production server

## Project Structure

```
sprout/
├── src/                     # Application source code
│   ├── main.ts              # Application entry point
│   └── shared/              # Shared application code
│       ├── layouts/         # Layout components
│       │   └── BaseLayout.tsx
│       └── components/      # Reusable components
├── assets/                  # Source assets
│   ├── css/                 # CSS source files
│   │   └── main.css         # Tailwind CSS v4 entry point
│   └── js/                  # Frontend JavaScript source
│       ├── controllers/     # Stimulus controllers
│       ├── lib/             # Shared utilities
│       └── main.ts          # Frontend entry point
├── scripts/                 # Build scripts
│   ├── build.ts             # Unified build script
│   ├── build-css.ts         # CSS build script (Tailwind v4)
│   ├── build-js.ts          # JavaScript build script (esbuild)
│   └── dev.ts               # Development server (uses concurrently)
├── static/                  # Built assets (gitignored)
│   ├── css/                 # Compiled CSS
│   └── js/                  # Bundled JavaScript
└── deno.json                # Deno configuration and dependencies
```

## Tech Stack

- **Runtime**: Deno
- **Web Framework**: Hono
- **CSS**: Tailwind CSS v4 (CSS-first configuration)
- **Frontend JS**: Hotwire (Turbo + Stimulus)
- **Build Tools**: esbuild, concurrently
- **Process Management**: concurrently

## Learn More

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and architecture documentation.
