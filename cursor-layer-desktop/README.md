# Cursor Layer Desktop App

Cross-platform desktop application for managing approvals and viewing sessions in Cursor Layer.

## Features

- **Approval Management**: View and manage pending approvals with approve/deny actions
- **Session Viewer**: Browse session history with conversation timelines
- **Real-time Updates**: Auto-refreshes to show latest data
- **Cross-platform**: Works on Windows and macOS

## Development

### Prerequisites

- Node.js 18+
- Rust (for Tauri backend)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Install Rust dependencies (Tauri will handle this automatically):
```bash
cd src-tauri
cargo build
cd ..
```

### Running

**Production build** (recommended):
```bash
.\src-tauri\target\release\cursor-layer-desktop.exe
```

**Development mode**:
```bash
npm run tauri dev
```

This will:
- Start the Vite dev server on `http://localhost:1420`
- Launch the Tauri app window
- Enable hot-reload for frontend changes

### Building

Build for production:
```bash
npm run tauri build
```

This creates platform-specific installers:
- Windows: `.msi` installer
- macOS: `.dmg` or `.app` bundle

## First Run

On first launch, the app will:
- ✅ Automatically create database directory (`~/.cursor-layer/`)
- ✅ Automatically create database file (`db.sqlite`)
- ✅ Automatically initialize schema (tables and indexes)
- ✅ Show empty state (no approvals/sessions yet - this is normal)

**No setup required!** The app is completely standalone.

## Architecture

### Frontend (React + TypeScript)
- **Pages**: `ApprovalsPage`, `SessionsPage`
- **Components**: `ApprovalCard`, `SessionCard`, `Layout`
- **Hooks**: `useApprovals`, `useSessions`
- **Styling**: Tailwind CSS

### Backend (Rust + Tauri)
- **Database**: SQLite access via `rusqlite`
- **Commands**: Tauri commands for database operations
- **Shared Database**: Uses same SQLite database as MCP server (`~/.cursor-layer/db.sqlite`)

## Database

The desktop app shares the same SQLite database as the MCP server:
- **Location**: `~/.cursor-layer/db.sqlite`
- **Concurrency**: WAL mode allows concurrent reads
- **Schema**: See `cursor-layer/src/storage/store.ts` for schema definition

## Project Structure

```
cursor-layer-desktop/
├── src/                    # React frontend
│   ├── pages/             # Main pages
│   ├── components/        # UI components
│   └── hooks/            # React hooks
├── src-tauri/            # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs       # Entry point
│   │   ├── commands.rs   # Tauri commands
│   │   └── database.rs   # Database access
│   └── Cargo.toml
└── package.json
```

## License

Apache-2.0

