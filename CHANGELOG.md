# Changelog

## [0.1.0] - 2025-11-24

### Added
- ✅ Core commands: research-codebase, create-plan, iterate-plan, implement-plan
- ✅ Specialized agents: codebase-locator, analyzer, pattern-finder
- ✅ MCP server for approval workflows and session tracking
- ✅ SQLite storage layer with automatic schema initialization
- ✅ File watcher with gitignore support
- ✅ Cross-platform desktop app (Windows + macOS)
- ✅ Comprehensive documentation and quickstart guides

### Fixed
- ✅ Desktop app database initialization (PRAGMA journal_mode fix)
- ✅ Database schema initialization with proper error handling
- ✅ React error boundaries to prevent crashes
- ✅ Comprehensive logging for debugging ([DB] and [CMD] prefixes)
- ✅ Error recovery (returns empty arrays instead of crashing)

### Changed
- ✅ Removed `model: opus` directives for Auto mode compatibility
- ✅ Improved error handling throughout
- ✅ Lazy database initialization pattern

### Documentation
- ✅ Added QUICKSTART.md
- ✅ Added SETUP.md
- ✅ Added AUTO_MODE_GUIDE.md
- ✅ Added FEATURES_COMPARISON.md
- ✅ Added COMMANDS_SUMMARY.md
- ✅ Updated README.md with GitHub repo URL

## Repository

**GitHub**: https://github.com/robglnn/cursor-layer

