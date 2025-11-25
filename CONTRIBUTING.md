# Contributing to Cursor Layer

Thank you for your interest in contributing!

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Run tests: `npm test`

## Project Structure

```
cursor-layer/
├── .cursor/
│   └── rules/
│       ├── commands/     # Cursor command workflows
│       └── agents/       # Specialized agent definitions
├── src/
│   ├── mcp-server/      # MCP server implementation
│   ├── cli/             # CLI tool
│   ├── storage/          # SQLite storage layer
│   └── file-watcher/     # File change tracking
└── dist/                 # Compiled output
```

## Code Style

- TypeScript with strict mode
- ESLint for linting
- Prettier for formatting (when added)

## Making Changes

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Apache 2.0 - see LICENSE file

