# Vendor Bundler

This is a packaging tool for third-party modules, built based on Vite, with the aim of facilitating faster integration with third-party CDNs.

## Usage

1. `pnpm i`
2. `pnpm run dev`
3. `pnpm run build`

## Features

- You can install the packages you need. After the installation is successful, configure the packaging settings of the packages in the vendor.config.json file.
- The packaged files are located in the "dist" folder.
- Support the use of Sass.
- Some third-party packages do not have default exports. Support for configuring default exports is available.
- The packaged files will be automatically named with a custom name under Windows, for example, window.x