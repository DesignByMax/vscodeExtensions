# Shell for VS Code

[![VS Code Marketplace](https://img.shields.io/badge/vscode-bbenoist.shell-blue.svg)][marketplace] [![GitHub tag](https://img.shields.io/github/tag/bbenoist/vscode-shell.svg)][gh-repo] [![GitHub issues](https://img.shields.io/github/issues/bbenoist/vscode-shell.svg)][issues] [![Gitter](https://badges.gitter.im/bbenoist/vscode-shell.svg)][gitter]

## Description

Shell is a [VS Code][vscode] extension which lets you execute shell commands directly from the editor.

![Example](https://github.com/bbenoist/vscode-shell/raw/master/images/example.gif)

It helps you getting more productive by not having to leave the editor for running shell commands.

## Usage
### Run Command
Press `F1` and select the command with title: `Shell: Run Command`.

This will open a new input box where you will just have to type youd shell command and press `Enter`.

### Run Command at the Location of the Active File
Press `F1` and select the command with title: `Shell: Run Command at Active File Location`.

This will open a new input box where you will just have to type youd shell command and press `Enter`.

### Show Command History
Press `F1` and select the command with title: `Shell: Show Command History`.

This will open a list of previous commands which can be re-executed when pressing `Enter`.

### Terminate Running Command
Press `F1` and select the command with title: `Shell: Terminate Running command`.

The extension will then try to properly kill the running command with a `SIGTERM`.

### Show Command Log
If you want to see the output of the command, press `F1` and select the command with title: `Shell: Show Command Log`.

This will open the regular output panel on the correct stream.

## Installation
Hit `Ctrl+P` and enter the `ext install shell` command. **Warning:** be sure to select the extension authored from **bbenoist**.

## Issues / Feature requests
You can submit your issues and feature requests on the GitHub [issues page][issues].

## Contributing

See [`CONTRIBUTING.md`][contributing-md] for guidelines.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)][license] [![Dependency Status](https://david-dm.org/bbenoist/vscode-shell.svg)][npm-dependencies] [![devDependency Status](https://david-dm.org/bbenoist/vscode-shell/dev-status.svg)][npm-devdependencies]

## More information
* [Shell on the Visual Studio Marketplace][marketplace]
* [GitHub repository][gh-repo]
* [Gitter chatroom][gitter]

## Other extensions you might like
* [Vagrant][vagrant]
* [Toggle Header / Source][togglehs]
* [QuickTips][quicktips]
* [Doxygen Language Support][doxygen]
* [QML Language Support][qml]
* [Nix Language Support][nix]

## Credits
Icon made by Freepik from www.flaticon.com.

[marketplace]: https://marketplace.visualstudio.com/items/bbenoist.Shell
[gh-repo]: https://github.com/bbenoist/vscode-shell
[issues]: https://github.com/bbenoist/vscode-shell/issues/
[gitter]: https://gitter.im/bbenoist/vscode-shell
[npm-dependencies]: https://david-dm.org/bbenoist/vscode-shell
[npm-devdependencies]: https://david-dm.org/bbenoist/vscode-shell#info=devDependencies
[contributing-md]: https://github.com/bbenoist/vscode-shell/tree/master/CONTRIBUTING.md
[license]: https://raw.githubusercontent.com/bbenoist/vscode-shell/master/LICENSE
[vscode]: https://code.visualstudio.com/
[vagrant]: https://marketplace.visualstudio.com/items?itemName=bbenoist.Vagrant
[togglehs]: https://marketplace.visualstudio.com/items/bbenoist.togglehs
[quicktips]: https://marketplace.visualstudio.com/items?itemName=bbenoist.QuickTips
[doxygen]: https://marketplace.visualstudio.com/items?itemName=bbenoist.Doxygen
[qml]: https://marketplace.visualstudio.com/items?itemName=bbenoist.QML
[nix]: https://marketplace.visualstudio.com/items?itemName=bbenoist.Nix
