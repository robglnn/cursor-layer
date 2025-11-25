# Build Guide

## ✅ Frontend Build Status

The frontend (React + TypeScript) builds successfully!

```bash
cd cursor-layer-desktop
npm install
npm run build
```

**Output**: `dist/` directory with compiled assets

## 🦀 Rust Backend

The Rust backend requires the Rust toolchain to be installed.

### Install Rust

**Windows:**
1. Download and run [rustup-init.exe](https://rustup.rs/)
2. Or use: `winget install Rustlang.Rustup`

**macOS:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Build Rust Backend

Once Rust is installed:

```bash
cd cursor-layer-desktop/src-tauri
cargo build
```

This will:
- Download Rust dependencies
- Compile the Rust backend
- Create the Tauri binary

### Full Tauri Build

To build the complete desktop app:

```bash
cd cursor-layer-desktop
npm run tauri build
```

This creates platform-specific installers:
- **Windows**: `.msi` installer in `src-tauri/target/release/bundle/msi/`
- **macOS**: `.dmg` or `.app` bundle in `src-tauri/target/release/bundle/`

## Development Mode

Run in development mode (requires Rust):

```bash
npm run tauri dev
```

This will:
1. Start Vite dev server on `http://localhost:1420`
2. Compile Rust backend
3. Launch the Tauri app window
4. Enable hot-reload for frontend changes

## Prerequisites Checklist

- [x] Node.js 18+ installed
- [x] npm installed
- [x] Frontend dependencies installed
- [ ] Rust toolchain installed (for backend)
- [ ] Cargo installed (comes with Rust)

## Troubleshooting

### TypeScript Errors
- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` is correct

### Rust Build Errors
- Ensure Rust is installed: `rustc --version`
- Update Rust: `rustup update`
- Check `Cargo.toml` dependencies

### Database Connection Errors
- Ensure database exists at `~/.cursor-layer/db.sqlite`
- Database schema is created by MCP server/CLI
- Check file permissions

## Next Steps

1. **Install Rust** (if not already installed)
2. **Test Rust backend**: `cd src-tauri && cargo build`
3. **Run in dev mode**: `npm run tauri dev`
4. **Build for production**: `npm run tauri build`

