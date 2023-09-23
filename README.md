# bingle-editor
A epic text editor with (soon) a lot of features.\
Intended to bridge vscode and nano.
## Features
- Navigability
	- Jump to line
	- Jump to search (find)
	- Peek (temporary jump to line)
- Command system (with autocomplete and history)
- Syntax highlighting
- Terminal UI not based on any library (SPEEED)
- No normalization (good!)
	- No removing trailing whitespace
	- No tab/space normalization
	- No messing with line endings
	- This is to prevent accidental changes to files
- Extensible
- Customizable
- Open source
## Planned Features
- Editor hints
	- Jumpable "Sections"
	- Comment search
- Enhanced find and replace
	- Two modes: Replace All or One by one
	- New syntax: search "xx22xx" for "xx;0;xx" replace with "super;0;" (xx22xx -> super22, xx82xx -> super82)
	- Confirmation (shows diffs highlighted so you can verfy changes are correct)
	- Configurable pre-replace backups
- Configurable keybinds
- Build/Run/Test/Custom "actions"
	- E.g. press ctrl+b to run configured build script for that language
	- Parse from existing configurations (.vscode/package.json)
- Two sided indent-based bracket debugger
	- Identifies missing brackets easily
- Playerctl commands
- Cursor history
## Installation
No permanent installation. Just run index.js (with node or bun)
## Usage
### Commands
- `:q` - Quit
- `:help` - Help
