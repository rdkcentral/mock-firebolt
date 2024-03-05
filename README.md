Mock Firebolt
=============

Mock Firebolt allows an app developer creating a Firebolt-compliant app to "artificially" cause calls to the Firebolt SDK(s) to return different responses than those returned by a real Firebolt running on whatever device(s) they may have.

This might be used, for example:

- by a developer who only has a STB to get Firebolt to answer as if it is a TV (or vice versa)
- to test variations of accessibility settings, advertising settings, etc.
- to test how the app responds to errors from the Firebolt SDK
- to test slow responses from the Firebolt SDK, etc.

FUTURE: Can act as a reverse proxy to a real Firebolt running on a real device.


# Goals:
- Enable app developers to be productive without needing a real device for as long as possible
- Enable app developers to force various responses from Firebolt to test an app "on" multiple devices, test edge cases, and simulate errors

(NOTE: The standard SDK has static mocks built in but it is *not* controllable or extensible.)

Note, too, that since the SDK does not validate parameters on method calls, app developers can also use Mock Firebolt as a way to validate that their invocations of Firebolt methods are correct.

# Features
- Controllable Mock Firebolt server (NodeJS websocket + HTTP server)
- Control mock method responses via control plane RESTful API, CLI, web admin UI (soon), browser extension (soon)
- 100% OpenRPC-driven; no SDK-specific details within the implementation
- Supports Firebolt SDKs: **core** &  **manage**
- Complete documentation
- Docker support
- Validation (based on OpenRPC specifications) of all parameters sent on method calls
- Validation (based on OpenRPC specifications) of all mock method override values
- Set multiple method overrides at once
- Command-line interface; especially helpful for loading all method overrides in a JSON or YAML file all at once ("import")
- CLI support for both JSON and YAML files
- Specify a method's response as either a non-error result or as an error
- Specify a method's response as a JavaScript function, which receives parameters passed to method call
- Share state between functions used to specify method responses
- Specify a sequence of responses (fail once, succeed once, etc.)
- Send events to the Firebolt SDK via the control plane (RESTful API, CLI, etc.)
- Send an event to multiple apps via the control plane (RESTful API, CLI, etc.)
- Send a timed sequence of events to the Firebolt SDK via the control plane (soon)
- Import/export for loading/saving mock response values 
- Magic date/time variable support (e.g., {{+1h|x}}, {{20:00|YYYY-MM-DD HH:mm:ssZ}})
- Set response latency per-method or globally
- Multi-user support (using paths on websocket URLs)
- Web admin UI to set mock responses (soon)
- Browser extension to send Firebolt lifecycle events
- Browser extension to set mock responses (some day)

# Architecture:

![Architecture Diagram](./docs/images/MockFireboltArchitecture.png)


# Repo Contents

This repo contains these elements:

- **docs/**
  - [Documentation](./docs/Documentation.md)
- **server/**
  - A NodeJS server that acts as a mock Firebolt server
    - Responds to Firebolt SDK requests and sends events to the Firebolt SDK via the socket transport layer
    - Presents a RESTful interface for control tools (CLI, browser extensions, web admin app) to use
    - Presents an Express-based web administrative app, which can be used to affect the behavior of the mock Firebolt server
      - NOTE: **THE WEB ADMIN APP IS NOT FINISHED YET**.
- **cli/**
  - A command-line interface which can be used to affect the behavior of the mock Firebolt server
- **browser-extensions/**
  - Browser extensions which can be used to affect the behavior of the mock Firebolt server


# Documentation

See [Documentation](./docs/Documentation.md).


# SDK Support and the server/src/.mf.config.json File

Mock Firebolt is a very generic mocking service for almost *any* OpenRPC-based service. The list of particular SDKs the server supports when you run it is controlled by the contents of the `server/src/.mf.config.json` file and any associated command-line flags you provide when you start the server.

The repo contains a `server/src/.mf.config.SAMPLE.json` file and you'll need to copy this file to `server/src/.mf.config.json` in order for the server to start. Once you've done this, you're free to edit your `server/src/.mf.config.json` file and add other SDKs if you'd like. If the OpenRPC JSON file for your API is somewhere in the cloud or otherwise available via HTTP, you should use the `url` property for the SDK in this file rather than the `fileName` property (which is only used for SDKs for which there is a "hard dependency" in the `server/package.json` file).

The next two sections presume you are using the out-of-the-box `.mf.config.json` file.


# Firebolt SDK Support

Mock Firebolt supports these Firebolt SDKs: **core** & **manage**.

# $badger Support

Mock Firebolt also supports the $badger SDK for application developers migrating from $badger to Firebolt.

Developers wishing to activate this functionality must pass the `--moneybadger` command-line flag when starting Mock Firebolt. As well, you must use the `activateMockFireboltForBadger.js` script within your app and have it execute *before* your app bundle (which includes $badger) executes.

# Usage (Local)

Note: Requires NodeJS 16+. If you're using `nvm`, do `nvm use 16` or similar.

To install and run:

```
cd <the place you put your code repos>
git clone https://github.com/rdkcentral/mock-firebolt.git            /* THIS REPO */
cd mock-firebolt

# To start the mock Firebolt server (if running locally)
cd server

# One-time stuff

cp src/.mf.config.SAMPLE.json src/.mf.config.json

# To install dependencies, clean/create build/ subdirectory, build and upgrade SDK, build source code within this project
npm install

# If you want support for Firebolt Core/Manage SDK
# Run in a separate terminal window/tab, or use '&' to background
npm start

# If you need to use non-standard ports for any reason:
npm start -- --httpPort 3456 --socketPort 9876 --wsSessionServerPort 1234

#If you wish to enable conduit functionality*
npm start -- --conduit

*Note*: Requires Conduit to be running. See the Conduit documentation (./conduit/README.md) for more information.

# If you need to use proxy connection for any reason:
npm start -- --proxy <ip>:<port>
Refer more about proxy mode in ./docs/ProxyMode.md

# To use the control CLI (assuming you're in the top-level directory for this repo)
cd cli
npm install
cd src
node cli.mjs --help

# FUTURE: To use the Chrome browser plugin
Visit chrome://extensions in Chrome
Ensure "Developer mode" is turned on (slider to the right in the top right corner of your browser window)
Click the "Load Unpacked" button (top left corner of browser window)
Navigate to the directory under browser-extensions which contains a manifest.json file and click "Select"
```

Now you can access core/manage OpenRPC from HTTP by adding `"url": "https://rdkcentral.github.io/firebolt/requirements/latest/specifications/firebolt-open-rpc.json"` in `mf.config.SAMPLE.json` and copying to `mf.config.json`. 

# Usage (via Docker, if you prefer)

NOTE: These instructions currently involve creating a docker image locally rather than downloading one from an image repository.

```
export MF_DOCKER_USER=<yourDockerUsername>

cd <top of repo>

# Create a docker image: Use the appropriate command (most 3rd party app devs should use the first command)
docker build -f Dockerfile.coreSdk . -t $MF_DOCKER_USER/mock-firebolt
docker build -f Dockerfile.allSdks . -t $MF_DOCKER_USER/mock-firebolt

# Confirm your image was created
docker images | grep mock-firebolt

# Run the image, enabling the core/manage OpenRPC (typical)
# Change '$(pwd)' to whatever else you might want to use; this is where your MF .json files live
# NOTE: -p <outside/host port>:<inside/container port>
docker run -d \
  --name mf \
  --mount type=bind,source="$(pwd)",target=/usr/src/firebolt/host-files \
  -p 3333:3333 \
  -p 9998:9998 \
  $MF_DOCKER_USER/mock-firebolt

# Get container ID
docker ps | grep mf

# See logs
docker logs mf

# Enter the container (if necessary/desired)
docker exec -it mf /bin/bash

# Run CLI commands from inside the container (if necessary/desired)
container> cd /usr/src/firebolt/mock-firebolt/cli/src
container> node cli.mjs --help

# Run CLI
# Note the container path for the volume used when running the image is used here to refer to MF .json files
docker exec -it mf mf.sh --help
docker exec -it mf mf.sh --upload /usr/src/firebolt/host-files/<file relative current directory>
# E.g., docker exec -it mf mf.sh --upload /usr/src/firebolt/host-files/cli/examples/account-1.json

# Cleanup when done
docker stop mf
docker rm mf
docker image rm $MF_DOCKER_USER/mock-firebolt     (If you want to remove the image, too)
```


# Known Issues

See [Known Issues](./docs/KnownIssues.md).


# Contributing
If you would like to contribute code to this project you can do so through GitHub by forking the repository and sending a pull request.

Before RDK accepts your code into the project you must sign the RDK Contributor License Agreement (CLA).
