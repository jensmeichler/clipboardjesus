# Clip#board [![clipboard](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/c1e5r5/develop&style=for-the-badge)](https://dashboard.cypress.io/projects/c1e5r5/runs)

Clip#board is a tool to manage and organize your clipboard.
You can add notes on click everywhere, or import files you
saved previously.

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

Clip#board is tested with automated UI tests using Cypress.

Run `npm run e2e` to start the test runner ui.
Remember that the [dev server](#development-server) must be running in order to run the tests.

To see the current test status visit the [Cypress Dashboard](https://dashboard.cypress.io/projects/c1e5r5/runs)

## Documentation

The source code documentation is generated using compodoc.

Run `npm run docs` to generate and open the documentation webpage.
This command will generate the source code for the documentation webpage and open in at [localhost:8080](http://localhost:8080/).

## Deployment

Clip#board offers continuous delivery. That means that every push will deploy the app.

### Production environment

#### Web app

Each push to the main branch triggers the deployment action for production environment.
The production version of Clip#board is hostet on Azure (as a static website).
You can reach it at [www.clipboardjesus.com](https://www.clipboardjesus.com)
or at [clipboardjesus.de](https://clipboardjesus.de)

#### Desktop app

Each push to the main branch triggers the release action.
This will create bundles for MacOS, Linux and Windows.
They will be available [here](https://github.com/jensmeichler/clipboardjesus/releases).

### Testing environment

Each push to the develop branch triggers the deployment action for the beta environment.
The beta version of Clip#board is hostet on GitHub pages.
You can reach it at [jensmeichler.github.io/clipboardjesus](https://jensmeichler.github.io/clipboardjesus)
(Sometimes you have to load it twice, cause of a bug in GitHub pages)
