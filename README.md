# Simple Browser Multi

This is a modified version of VS Code's built-in [Simple Browser extension](https://github.com/microsoft/vscode/tree/main/extensions/simple-browser) that allows opening multiple browser instances simultaneously.

<p align="center">
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/7b86b4ae-9fa5-4090-882d-9bfed0491f7d" />
</p>

## Features

- Open multiple browser windows at the same time
- Each browser window operates independently
- All other features of the original Simple Browser are preserved

## Usage

Use the command "Simple Browser Multi: Show" to open a new browser window. Each time you run this command, a new browser window will open.

## Replacing simple-browser with this extension

The original Simple Browser extension is triggered by the `simpleBrowser.api.open` command — this is the same command that other extensions use to open browser windows inside VS Code. (for example, `gp preview` in Gitpod).

This extension, also listens for the `simpleBrowser.api.open` command. So, to make `gp preview` or other extensions use the Simple Browser Multi extension (this one) instead, you need to disable the built-in Simple Browser extension.

## Differences from the original Simple Browser

The original Simple Browser extension only allows one browser window to be open at a time. If you try to open a new URL, it will reuse the existing window. This modified version creates a new window each time.

## License

This extension is licensed under the MIT License, same as the original [VS Code repository](https://github.com/microsoft/vscode/tree/main/extensions/simple-browser).
