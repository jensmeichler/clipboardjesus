# Contributing to Clip#board

Contributing to Clip#board is always welcome.
Just ensure that the following requirements are met.
- All actions are running successfully
  - Application build
    - Web app
    - Desktop app
  - Source code linting
  - Cypress e2e tests
- Code style matches the rest of the app
  - imports aren't a mess, etc.
  - New code is well documented with jsdoc

---

## Preconditions

The following preconditions must be met in order to develop Clip#board.

- You need Node.js to be installed with the version specified in the [.nvmrc](.nvmrc) file.
- Run `npm install` to install all the dependencies onto your system.

## Development server

### Web app

Run `npm start` for a dev server.
Navigate to `http://localhost:4201/`.
The app will automatically reload if you change
any of the source files.

### Desktop app

Run `npm run tauri dev` to start the desktop app with a dev server.

## Build

### Web app

Run `npm run build` to build the project.
The build artifacts will be stored in the `dist/clipboard/` directory.

### Desktop app

Run `npm run tauri build` to build the installer for the OS you are currently on.

You need to have at least Rust installed onto your system ([See documentation](https://tauri.studio/v1/guides/getting-started/prerequisites)).

## Testing

Run `npm run e2e` to start the cypress test runner ui.
Remember that the [dev server](#development-server) must be running in order to run the tests.

## Documentation

Run `npm run docs` to generate and open the documentation webpage.
This command will generate the source code for the documentation webpage and open in at [localhost:8080](http://localhost:8080/).
