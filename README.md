# `ui-react-component`

# Table of Contents
1. [Requirements](#requirements)
1. [Project Setup](#project-setup)
	1. [Libraries](#libraries)
	1. [Structure](#structure)
1. [Basic Usage](#basic-usage)
1. [Design Principles](#design-principles)
	1. [Self-Contained Components](#self-contained-components)
	1. [Tachyons-Driven Styling](#tachyons-driven-styling)
1. [Workflow](#workflow)
1. [Troubleshooting](#troubleshooting)
  1. [Multiple React Detected](#multiple-react-detected)

## Requirements
- node
- npm or yarn

## Project Setup

### Libraries

Transpile:
- Babel

Lint:
- ESLint

Bundle:
- Webpack

Automate:
- Webpack

Typecheck:
- Flow

Test:
- AVA
- Enzyme
- Sinon

Development:
- React Storybook

Application:
- React
- Mapbox GL
- D3
- Tachyons

### Structure

```
.
├── dist/                   # compiled files for distribution as an npm package
├── app/                    # compiled files as a standalone interactive module
└── src/
    ├── app/                # files and configs for `storybook`
    └── lib/                # where the components live
        ├── SomeComponent
        │   ├── index.js    # source file for components
        │   ├── story.js    # story
        │   └── test.js     # test
        └── index.js        # entry point to the components library
```

## Basic Usage

```
# install dependencies
npm install

# run watcher to monitor file changes and execute test cases automatically
npm run test

# run `storybook` for development
npm run dev

# compile source code in ./src/lib to ./dist for production-ready version for distribution
npm run build:lib

# compile source code in ./src/app and ./src/lib to ./app for standalone interactive module
npm run build:app
```

## Design Principles

### Self-Contained Components

Notice under the [Structure](#structure) section that the component directory consists of only three `js` files. That’s all we need to start on developing a components.

### Tachyons-Driven Styling

`Tachyons` proclaims itself to be an implementation of functional CSS. Well, CSS classes are composable to begin with, so what `Tachyons` brings to the table is the design decision of atomic CSS classes and also the idea of immutability within these classes. It also allows us to have a components library that is completely free of CSS dependencies. Although there is still a development dependency on `ui-tachyons-dark`, there are no CSS dependencies in production, and this we can easily theme and deploy other `Tachyons` variants and extensions.

## Workflow

1. create component directory
1. create `index.js`, `story.js` & `test.js`
1. create stories in `story.js` and run them though `React Storybook`
1. work on `index.js`
1. create more stories and repeat
1. create tests in `test.js` and repeat

## Troubleshooting

### Multiple React Detected

This happens when developing multiple components in parallel on a local machine and using `npm link` to symlink the separate libraries together. The depended library would find a copy of `react` in its own `node_modules` and reference to that copy instead.

To solve this, add the following to your `webpack` configuration:

```
const { resolve } = require('path')

module.exports = {
  ...,
  resolve: {
    alias: {
      react: resolve(__dirname, 'node_modules/react')
    },
    symlinks: false
  }
}
```
