# Release Notes

## 1.3.0

* TSLint support added.
* Extension won't set active linters anymore when changing VS Code configuration while `jsAutolint.enable` is set to `false`.  

## 1.2.0

* Support for the Standard linter added.
* Active linters are now displayed in the status bar. To turn it off set `jsAutolint.showStatus` to `false` .
* Automatically setting of linters can now be turned off if you don't want the linters to be set whenever you open a folder. The setting for this is `jsAutolint.enable`.
* Bugfix: The extension should now properly activate and set the correct linters if any configuration can be found in the workspace root folder.

## 1.1.0

* All possible ESLint, JSHint and JSCS configurations should work now (until now only `.eslintrc`, `.jscsrc` and `.eslintrc` were recognized).

## 1.0.0

* Initial release
