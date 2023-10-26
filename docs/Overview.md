Mock Firebolt: Project Overview / Demo Script <!-- omit in toc -->
=============================================
- [Intro](#intro)
  - [Goals](#goals)
  - [Architecture Diagram](#architecture-diagram)
- [Mock Firebolt](#mock-firebolt)
  - [NodeJS server](#nodejs-server)
    - [Get started](#get-started)
  - [App Side of Things](#app-side-of-things)
  - [Use cURL to control aspects of Mock Firebolt](#use-curl-to-control-aspects-of-mock-firebolt)
    - [General settings](#general-settings)
    - [Method overrides](#method-overrides)
    - [Multiple state changes at once](#multiple-state-changes-at-once)
    - [Cleanup](#cleanup)
  - [Use CLI to set some things (from examples directory)](#use-cli-to-set-some-things-from-examples-directory)
    - [General settings](#general-settings-1)
    - [Method overrides](#method-overrides-1)
    - [Multiple state changes at once](#multiple-state-changes-at-once-1)
    - [Data validation](#data-validation)
    - [Specified as function](#specified-as-function)
    - [Use of scratch k-v pairs](#use-of-scratch-k-v-pairs)
    - [Specified as YAML + result or error dynamically](#specified-as-yaml--result-or-error-dynamically)
    - [Result sequences](#result-sequences)
    - [Events](#events)
    - [Pre and Post Triggers](#pre-and-post-triggers)
  - [Web Admin UI](#web-admin-ui)
  - [Browser Extensions](#browser-extensions)

## Intro

### Goals
1. Enable app developers to be productive without needing a real device for as long as possible
2. Enable app developers to force various responses from Firebolt to test error and edge cases
    - **NOTE:** The standard SDK has static mocks built in but it is *not* controllable or extensible.
 
### Architecture Diagram

See: [Architecture Diagram](./images/MockFireboltArchitecture.png)
    
## Mock Firebolt

### NodeJS server

- Creates a socket and listens on it
- RESTful endpoints as a control plane
- Presents HTML-based web-based administration tool

#### Get started

- Git clone this repo and `npm i`, etc.
- Start server
- **NOTE**: All of the code is metadata-driven (based on [the OpenRPC specification](https://github.com/rdkcentral/firebolt-core-sdk/tree/main/src/modules))

### App Side of Things
- Client code imports Firebolt SDK in `package.json`, using npm as usual and makes Firebolt SDK calls
- URL when launching the app must contain one of the following:
    - `?mf=true`
    - `?mf=9998`
    - `?mf=ws%3A%2F%2Flocalhost%3A9998`

### Use cURL to control aspects of Mock Firebolt

#### General settings
```sh
POST http://localhost:3333/api/v1/global/latency
POST http://localhost:3333/api/v1/global/mode
```

#### Method overrides

Results:
```sh
POST http://localhost:3333/api/v1/method/account.id/result
POST http://localhost:3333/api/v1/method/accessibility.voiceGuidance/result
```
Errors:
```sh
POST http://localhost:3333/api/v1/method/discovery.watched/error
```


#### Multiple state changes at once
```
PUT  http://localhost:3333/api/v1/state (multiple things at once)
GET  http://localhost:3333/api/v1/state (debug)
```

#### Cleanup
```
POST http://localhost:3333/api/v1/state/revert`
```

### Use CLI to set some things (from [examples directory](../cli/examples))

#### General settings
```sh
node cli.mjs --latency 0
node cli.mjs --latency 2000 --latency 2200
# Latency for a specific method
node cli.mjs --method device.type --latency 3000
node cli.mjs --mode box
```

#### Method overrides

Results:
```sh
node cli.mjs --method account.id --result "'111'"
node cli.mjs --method accessibility.voiceGuidance --result '{"enabled":true, "speed":10}'
```
Errors:
```sh
node cli.mjs --method discovery.watched --errCode -32888 --errMsg "You lose"
```
#### Multiple state changes at once
```sh
# slow
node cli.mjs --upload ../examples/fast.json
# -slow | -off
node cli.mjs --upload ../examples/accessibility-voiceGuidance-fast.json
# -2
node cli.mjs --upload ../examples/account-1.json
```
#### Data validation
```sh
# -2
node cli.mjs --upload ../examples/accessibility-voiceGuidance-invalid1.json
```

#### Specified as function
```
node cli.mjs --upload ../examples/discovery-watched-1.json
```

#### Use of scratch k-v pairs
```
node cli.mjs --upload ../examples/account-random.json (scratch)
```
#### Specified as YAML + result or error dynamically
```
node cli.mjs --upload ../examples/metrics-mediaLoadStart-1.yaml
```

#### Result sequences
```sh
# revert to static default
node cli.mjs --upload ../examples/device-screenResolution-sequence1.json
# repeat last response
node cli.mjs --upload ../examples/device-screenResolution-sequence2.json
# fail once
node cli.mjs --upload ../examples/device-screenResolution-sequence3.json
```

#### Events

Single events

```sh
POST /api/v1/event
node cli.mjs --event ../examples/device-onDeviceNameChanged2.event.json
```

Event squences

```sh
node cli.mjs --sequence ../examples/device-onDeviceNameChanged.sequence.json
```

#### Pre and Post Triggers

See `server/src/triggers/lifecycle.ready/post.mjs`, etc.

Run Mock Firebolt like: `npm start -- --triggers ./src/triggers`

#### novalidate Flag

By default, Mock Firebolt will validate incoming method names and parameters and outgoing events. If you want to prevent some or all of these validation checks, you must either set the value of validate in mf.config.json to a subset of the default values (["method", "params", "response", "event"]) or pass one or more --novalidate command line arguments when you start Mock Firebolt.

Run Mock Firebolt like: `npm start -- --novalidate response --novalidate params`

### Web Admin UI
```
http://localhost:3333
```
 
### Browser Extensions

Demo Governor browser extension to send lifecycle events.

Demo Injector browser extension to inject Mock Firebolt connectivity to an app that doesn't directly include the activateMockFirebolt.js script.
