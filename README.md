# Electron + AppAuth-JS + SuperOffice

![AppAuth-JS + Electron](./assets/electron_appauth_superoffice.svg)

This is an Electron Application, which uses the [AppAuth-JS](https://github.com/openid/AppAuth-JS) library for authentication against SuperOffice online web services. This application uses the OAuth 2.0 native app authentication workflow.

Please note that this is not an official SuperOffice product.

## Development

This application has been written with [TypeScript](https://typescriptlang.org).

### Setup

- Must already have a SuperOffice Online tenant in [SuperOffice Online Development (SOD)](https://sod.superoffice.com) environment.

- Must already be registered as a [SuperOffice online partner](https://community.superoffice.com/en/developer/apps-partners/) and have a registered SuperOffice Online application.

- Your registered online application must have a redirectURL set to: "http://127.0.0.1:8000".

- Open the flow.ts file, locate and set your client id and client secret equal to your applications Application ID and Application Secret, respectively.

- Install the latest version of [Node](https://nodejs.org/en/).
  [NVM](https://github.com/creationix/nvm)
  (Node Version Manager is highly recommended).

- Use `nvm install` to install the recommended Node.js version.

- Download the latest version of Visual Studio Code from
  [here](https://code.visualstudio.com/).

- Install [Yarn](https://yarnpkg.com/en/docs/install) package manager.

### Provision Dependencies

- `yarn install` or `npm install` to provision all the package depencies (from the folder that contains `package.json`).

Thats it! You are now ready to start.

### Development Workflow

This project has a few scripts to help you with your development workflow.

- `yarn run dev` or `npm run-script dev` will run the Electron application. This will also start the Typescript compiler in `watch` mode, and will automatically recompile your application as you start to make changes. Just reload the electron application to see your changes.

- `yarn start` or `npm start` is to start the Electron application (without setting up watches that monitor for changes).
