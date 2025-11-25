# Running the Desktop App

## Single-Line Commands

### Run the Built App (Release)
```powershell
cd C:\Users\mithr\Documents\GitHub\project7\cursor-layer-desktop; & ".\src-tauri\target\release\cursor-layer-desktop.exe"
```

### Run in Development Mode
```powershell
cd C:\Users\mithr\Documents\GitHub\project7\cursor-layer-desktop; npm run tauri dev
```

## Alternative: Use Full Path

If the relative path doesn't work, use the full absolute path:

```powershell
& "C:\Users\mithr\Documents\GitHub\project7\cursor-layer-desktop\src-tauri\target\release\cursor-layer-desktop.exe"
```

## Troubleshooting

If the executable doesn't exist, build it first:
```powershell
cd C:\Users\mithr\Documents\GitHub\project7\cursor-layer-desktop; npm run tauri build
```

