# Clip#board [![Angular](https://badges.aleen42.com/src/angular.svg)](https://angular.io/)  [![Test runs](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/c1e5r5&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/c1e5r5/runs)

Clip#board is a tool to manage and organize your clipboard.
You can add notes on click everywhere, or import files you
saved previously.

---

# Release versions

## Web app [![🚀 Azure deployment](https://github.com/jensmeichler/clipboardjesus/actions/workflows/deployment.yml/badge.svg)](https://github.com/jensmeichler/clipboardjesus/actions/workflows/deployment.yml) [![🔥 Github pages deployment](https://github.com/jensmeichler/clipboardjesus/actions/workflows/dev-deployment.yml/badge.svg)](https://github.com/jensmeichler/clipboardjesus/actions/workflows/dev-deployment.yml)

You can visit the app at [clipboardjesus.com](https://www.clipboardjesus.com) or [clipboardjesus.de](https://www.clipboardjesus.de).
For getting the latest features visit the beta version of the Clip#board at [jensmeichler.github.io/clipboardjesus](https://jensmeichler.github.io/clipboardjesus).

Remember that you have to give the browser access to your clipboard.

### Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](https://www.microsoft.com/en-us/edge)<br/>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://www.mozilla.org/de/firefox/new)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://chromeenterprise.google/intl/de_de/browser/download)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" /><br/>](https://www.apple.com/de/safari/)Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](https://www.opera.com)<br/>Opera |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Fully supported                                                                                                                                                                                | Not supported                                                                                                                                                                                           | Fully supported                                                                                                                                                                                                          | Not recommended                                                                                                                                                                               | Fully supported                                                                                                                                                                |


## Desktop app [![🏗 Build application](https://github.com/jensmeichler/clipboardjesus/actions/workflows/build.yml/badge.svg?branch=develop)](https://github.com/jensmeichler/clipboardjesus/actions/workflows/build.yml) [![🔖 Publish tauri app](https://github.com/jensmeichler/clipboardjesus/actions/workflows/release.yml/badge.svg)](https://github.com/jensmeichler/clipboardjesus/actions/workflows/release.yml)

Clip#board also exists as a desktop app for Windows, MacOS and Linux.
The desktop app works like the web app with one extra feature (Writing files into your file system).
You can view the latest releases [here](https://github.com/jensmeichler/clipboardjesus/releases).

# Automations

## Testing [![🧪 Running e2e tests](https://github.com/jensmeichler/clipboardjesus/actions/workflows/e2e.yml/badge.svg)](https://github.com/jensmeichler/clipboardjesus/actions/workflows/e2e.yml)

Clip#board is tested with automated UI tests using Cypress.
To see the current test status visit the [Cypress Dashboard](https://dashboard.cypress.io/projects/c1e5r5/runs).

## Linting [![👕 Lint source files](https://github.com/jensmeichler/clipboardjesus/actions/workflows/linting.yml/badge.svg)](https://github.com/jensmeichler/clipboardjesus/actions/workflows/linting.yml)

The source code is linted by the angular linter.
Each push will trigger a GitHub action which lints the source files.

## Documentation

The source code documentation is generated using compodoc.
The documentation is currently not published and can just be visited by generating it from the source code.

## Deployment

Clip#board offers continuous delivery. That means that every push will deploy the app.

### Production environment

#### Web app [![🚀 Azure deployment](https://github.com/jensmeichler/clipboardjesus/actions/workflows/deployment.yml/badge.svg)](https://github.com/jensmeichler/clipboardjesus/actions/workflows/deployment.yml)

Each push to the main branch triggers the deployment action for production environment.
The production version of Clip#board is hostet on Azure (as a static website).
You can reach it at [clipboardjesus.com](https://www.clipboardjesus.com)
or at [clipboardjesus.de](https://www.clipboardjesus.de)

#### Desktop app [![🔖 Publish tauri app](https://github.com/jensmeichler/clipboardjesus/actions/workflows/release.yml/badge.svg)](https://github.com/jensmeichler/clipboardjesus/actions/workflows/release.yml)

Each push to the main branch triggers the release action.
This will create bundles for MacOS, Linux and Windows.
They will be available [here](https://github.com/jensmeichler/clipboardjesus/releases).

### Testing environment [![🔥 Github pages deployment](https://github.com/jensmeichler/clipboardjesus/actions/workflows/dev-deployment.yml/badge.svg)](https://github.com/jensmeichler/clipboardjesus/actions/workflows/dev-deployment.yml)

Each push to the develop branch triggers the deployment action for the beta environment.
The beta version of Clip#board is hostet on GitHub pages.
You can reach it at [jensmeichler.github.io/clipboardjesus](https://jensmeichler.github.io/clipboardjesus)
(Sometimes you have to load it twice, cause of a bug in GitHub pages)

# Contributing

You want to contribute code to Clip#board?

See the [CONTRIBUTING](CONTRIBUTING.md) guidelines.
