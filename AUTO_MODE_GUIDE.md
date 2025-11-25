# Cursor Auto Mode Configuration

## Current Status

Your commands are **compatible with Auto mode**, but there's a small configuration consideration.

### Model Directive

Some commands currently have `model: opus` in their frontmatter:
- `research-codebase.mdc`
- `create-plan.mdc`
- `iterate-plan.mdc`

This directive tells Cursor to use Claude Opus specifically. However, **Cursor's Auto mode** can work with different models and provides unlimited tokens.

## Options

### Option 1: Keep `model: opus` (Current)
- **Pros**: Ensures consistent high-quality model (Opus)
- **Cons**: Might not leverage Auto mode's flexibility
- **Best for**: When you want guaranteed Opus quality

### Option 2: Remove `model:` directive (Recommended for Auto Mode)
- **Pros**: Lets Auto mode choose the best model, unlimited tokens
- **Cons**: Model selection is automatic
- **Best for**: Maximum flexibility and unlimited token usage

### Option 3: Use `model: auto` (If Cursor supports it)
- **Pros**: Explicitly enables Auto mode
- **Cons**: May not be a valid option in Cursor
- **Best for**: Explicit Auto mode usage

## Recommendation for Auto Mode

**Remove the `model: opus` directive** from commands you want to use with Auto mode. This allows:
- ✅ Unlimited token usage
- ✅ Automatic model selection
- ✅ Full Auto mode capabilities
- ✅ Commands still work perfectly

## How Commands Work with Auto Mode

Your commands are **already designed** to work with Auto mode:

1. **Research Codebase** - Perfect for Auto mode's unlimited context
2. **Create Plan** - Can iterate deeply with unlimited tokens
3. **Iterate Plan** - Can make comprehensive updates
4. **Implement Plan** - Can implement entire phases autonomously

The commands use:
- ✅ TodoWrite for tracking (works with Auto mode)
- ✅ Parallel agent spawning (works with Auto mode)
- ✅ File reading/writing (works with Auto mode)
- ✅ No token limits in instructions

## Quick Fix

If you want to enable Auto mode fully, I can remove the `model: opus` directives from your commands. This will let Cursor's Auto mode:
- Choose the optimal model
- Use unlimited tokens
- Work autonomously through entire workflows

Would you like me to update the commands to be Auto-mode optimized?

