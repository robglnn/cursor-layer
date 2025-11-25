# Setup Checklist

## ✅ Pre-Flight Check

Before using cursor-layer, verify:

- [ ] Commands are in `.cursor/rules/commands/`
- [ ] Agents are in `.cursor/rules/agents/`
- [ ] Cursor-layer is built (if using MCP server)
- [ ] MCP server configured (if using approvals)
- [ ] Auto mode enabled in Cursor (recommended)

## 📦 What's Already Built

✅ **Commands** - Ready to use (just copy to project)
✅ **Agents** - Ready to use (just copy to project)
✅ **cursor-layer** - Built (TypeScript compiled)
✅ **Desktop App** - Built (if you want it)

## 🚀 Quick Setup (No Rebuild Needed)

**Minimum setup** (just commands):
```bash
# Copy commands to your project
cp -r cursor-layer/.cursor/rules .cursor/
```

**That's it!** Commands work immediately.

## 🔧 Optional Setup

**With MCP server** (for approvals/sessions):
1. Ensure cursor-layer is built: `cd cursor-layer && npm run build`
2. Configure MCP in Cursor settings
3. Restart Cursor

**With Desktop App**:
1. Ensure desktop app is built: `cd cursor-layer-desktop && npm run tauri build`
2. Run the executable

## ✨ Ready to Go!

No rebuild needed for basic usage - just copy the `.cursor/rules` directory!

