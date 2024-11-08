# Change Log

All notable changes to this project will be documented in this file.
## [1.0.4] - 2024-02-13

### Added

* Added ability to check if an active userid is connected or not to mock-firebolt from yaml file

### Changed

* Updated definition of ctx in files to include new function `getWebSocketConnectionForUser` that will internally return `getWsForUser` to check if an active userid is connected or not to mock-firebolt 

## [1.0.3] - 2023-11-30

### Added

* New unit test to validate updated error handling function and functional test update to capture updated error message

### Changed

* Refined `logErr()` and `fErr()` functions which handles event error messages to appropriately throw both event validation and event registration errors. 

### Fixed

* Fixed bug related to event error message handling wherein all event errors were previously thrown as an improper generic error which was misleading to users. Implemented a mechanism to correctly distinguish different types of event errors and throw them appropriately

## [1.0.2] - 2023-11-10

### Added

* New unit tests to ensure the reliability of schema dereferencing functions in `fireboltOpenRpcDereferencing.mjs`.

### Changed

* Refined `selfReferenceSchemaCheck()` to return a boolean consistently, enhancing readability and predictability of self-referencing detection logic.

* Overhauled `replaceRefs()` for improved efficiency:
    
    * Implemented a set to track replaced $refs, thereby preventing infinite recursion during ref replacement.

    * Expanded the function to handle nested objects and arrays more effectively.

* Modernized various parts of `fireboltOpenRpcDereferencing.mjs` with arrow functions for a more modern code syntax.

### Fixed

* Addressed potential issues with recursive calls and infinite loops in `replaceRefs()` by marking self-referenced schemas as replaced and removing redundant $ref keys.

## [1.0.1] - 2023-10-18

### Added

* Introduced official versioning for the application.

### Changed

* The application now starts using the command `npm start` as opposed to the previously used `npm run dev`.
* Refactored script commands in `server/package.json` for better clarity and organization.
* Eliminated `firebolt-discovery-openrpc` as an optional dependency. It will no longer be utilized in the application.
* Deleted `package-lock.json` from the root directory.
* Updated documentation for greater clarity and accuracy.

### Fixed

## [0.1.1] - 2022-02-16

### Added

* Initial creation of the application.

### Changed

### Fixed