# Versioning Guidelines for Mock Firebolt

This document outlines the guidelines we follow for versioning Mock Firebolt. Our aim is to ensure clarity, consistency, and predictability in our releases, making it easier for both developers and users to understand the state and stability of the software.

## Versioning

We use [semantic versioning](https://semver.org/) which uses the `MAJOR.MINOR.PATCH` format:

* **MAJOR** version for incompatible changes that require user intervention.

* **MINOR** version for backward-compatible new features and enhancements.

* **PATCH** version for backward-compatible bug fixes.

## When to Cut a New Version

1. **Major Releases:**

    * Breaking changes have been introduced.

    * Major rewrites or architectural changes have been completed.

    * When significant features that might affect the application's overall behavior are added.

2. **Minor Releases:**

    * New, backward-compatible functionality has been added.

    * Deprecated functions or features are marked (to be removed in the next major version).

    * Performance enhancements or sizable improvements that don't disrupt existing functionality.

3. **Patch Releases:**

    * Backward-compatible bug fixes.

    * Minor updates that resolve issues affecting the stability of the application.

4. **Documentation Changes:**
    * Minor documentation changes do no necessitate a new version.

    * Significant documentation overhauls, especially those reflecting changes in the software's behavior or features, should accompany a minor or major release.

## Changelog Maintenance

With every new version, a corresponding update should be made to [CHANGELOG.md](../CHANGELOG.md). 

* Clearly specify the version number.

* Enumerate all changes, categorized by "Added", "Changed", and "Fixed".

* Provide a brief description of each change.

Use the following template to update the Change Log:

```
## [Unreleased] - yyyy-mm-dd

### Added

### Changed

### Fixed

```


## Steps to Create a New Version

1. Update the `package.json` files with the new version number you intend to release. This ensures that the project's metadata accurately reflects the current version.

2. Update [CHANGELOG.md](../CHANGELOG.md) with the details of the release.

3. Navigate to the [tags section](https://github.com/rdkcentral/mock-firebolt/tags) of the `mock-firebolt` repository on GitHub.

4. Click on the "Create a new release" button.

5. In the "Choose a tag" dropdown, the default action is set to "Create a new tag on publish". If you leave the dropdown as-is, it will automatically create a new tag using the release name.

6. Keep the release target to be the `main` branch.

7. For "Release title", you can use the same version number of the release.

8. In the description box, provide a brief summary of the changes or simply reference your updated `CHANGELOG.md`.

9. If you have any binaries, assets, or additional files to distribute with this release, attach them in the "Attach binaries by dropping them here or selecting them" section.

10. Once everything looks good, click on the "Publish release" button.

11. Notify the team and users (if applicable) of the new release.
