Mock Firebolt: Project Overview / Demo Script
=============================================

- Intro
  - Goals:
    - Enable app developers to be productive without needing a real device for as long as possible
    - Enable app developers to force various responses from Firebolt to test error and edge cases
    - (NOTE: The standard SDK has static mocks built in but it is *not* controllable or extensible.)
 
  - Architecture Diagram
    See: [Architecture Diagram](./images/MockFireboltArchitecture.png)
    
  - Mock Firebolt
    - NodeJS server
      - Creates a socket and listens on it
      - RESTful endpoints as a control plane
      - Presents HTML-based web-based administration tool
    - Git clone the repo and npm i, etc.
    - Start server
    - NOTE: All of the code is metadata-driven (based on the OpenRPC specification)

  - App Side of Things
    - Client code imports Firebolt SDK in package.json, as usual and makes Firebolt SDK calls
    - URL when launching the app must contain:
      ?mf=true   -OR-   ?mf=9998   -OR-   ?mf=ws://127.0.0.1:9998]

- Use cURL to set some things
  - General settings
    - POST http://localhost:3333/api/v1/global/latency
    - POST http://localhost:3333/api/v1/global/mode
  - Method overrides
    - Results:
      - POST http://localhost:3333/api/v1/method/account.id/result
      - POST http://localhost:3333/api/v1/method/accessibility.voiceGuidance/result
    - Errors:
      - POST http://localhost:3333/api/v1/method/discovery.watched/error
  - Multiple state changes at once
    - PUT  http://localhost:3333/api/v1/state (multiple things at once)
    - GET  http://localhost:3333/api/v1/state (debug)
  - Cleanup
    - POST http://localhost:3333/api/v1/state/revert

- Use CLI to set some things (from examples directory)
  - General settings
    - node cli.mjs --latency 0
    - node cli.mjs --latency 2000 --latency 2200
    - node cli.mjs --method device.type --latency 3000  (Latency for a specific method)
    - node cli.mjs --mode box
  - Method overrides
    - Results:
      - node cli.mjs --method account.id --result "'111'"
      - node cli.mjs --method accessibility.voiceGuidance --result '{"enabled":true, "speed":10}'
    - Errors:
      - node cli.mjs --method discovery.watched --errCode -32888 --errMsg "You lose"
  - Multiple state changes at once
    - node cli.mjs --upload ../examples/fast.json    ( slow )
    - node cli.mjs --upload ../examples/accessibility-voiceGuidance-fast.json   ( -slow | -off )
    - node cli.mjs --upload ../examples/account-1.json   ( -2 )
    - Data validation
      - node cli.mjs --upload ../examples/accessibility-voiceGuidance-invalid1.json    ( 2 )
    - Specified as function
      - node cli.mjs --upload ../examples/discovery-watched-1.json
    - Use of scratch k-v pairs
      - node cli.mjs --upload ../examples/account-random.json (scratch)
    - Specified as YAML + result or error dynamically
      - node cli.mjs --upload ../examples/metrics-mediaLoadStart-1.yaml
  - Result sequences
      - node cli.mjs --upload ../examples/device-screenResolution-sequence1.json    ( revert to static default )
      - node cli.mjs --upload ../examples/device-screenResolution-sequence2.json    ( repeat last response )
      - node cli.mjs --upload ../examples/device-screenResolution-sequence3.json    ( fail once )

- Events
  - Single events
    - POST /api/v1/event
    - node cli.mjs --event ../examples/device-onDeviceNameChanged2.event.json
  - Event squences
    - node cli.mjs --sequence ../examples/device-onDeviceNameChanged.sequence.json

- Pre and Post Triggers
  - See server/src/triggers/lifecycle.ready/post.mjs, etc.
  - Run Mock Firebolt like: npm run dev -- --triggers ./src/triggers

- Web Admin UI
  - http://localhost:3333
 
- Browser Extensions
  - Demo Governor browser extension to send lifecycle events
