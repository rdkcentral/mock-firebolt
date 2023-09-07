Mock Firebolt: Control Plane CLI
================================

A command-line interface (CLI) for controlling the behavior of the Mock Firebolt server.

This CLI uses the RESTful API of the Mock Firebolt server in the same way that the web admin app (served by the same NodeJS Express server that serves the Mock Firebolt control plane API) and any/all browser extensions will.

# The .mf.config.json file

If you want to "isolate" your Mock Firebolt mock override values from other developers, be sure to make a copy of `.mf-SAMPLE.config.json`
named `.mf.config.json` and change the userId value in this file to a valid userId. Out of the box, Mock Firebolt supports three "well-known"
userIds: "123", "456", and "789".

# Usage

Run `node cli.mjs --help` to see a list of example commands.

# State Export/Import

## Export

To export state (method response overrides, global settings, and scratch values):

```
node cli.mjs --quiet --state > mystate.json
```

Note the `--quiet` (or `-q`) flag to suppress a message which is otherwise logged, and which would prevent the output from being legal JSON.

## Import

To import state previously exported:

```
node cli.mjs --upload mystate.json
```

## Session Start/Stop

To start/stop recording of firebolt calls being passed through Mock Firebolt:
run `node cli.mjs --session start` or `node cli.mjs --session stop`

## Session Output Options

To change the output format of the session recording use option
`--sessionOutput log` 
with start, stop, or call in between starting and stopping.
Valid output options are:

- log (default): method call request and response objects ordered by the timestamp of the objects.
- raw: list of method call objects containing both request and response in one object.
- mock-overrides: a directory of method calls extrapolated from the raw format. This option converts the raw formats into json files or yaml files. A json file would be the response from a method call that took place when mock-firebolt processed it. Yaml files contain a function that returns a json response depending on input params. Yaml files are only generated if there were multiple of the same method call with different params.
- live: This format operates similarly to the 'raw' format with an added real-time feature. As each message is received, it gets immediately written to the specified output file. In addition to accepting regular file paths, the 'live' option also supports WebSocket (WS/WSS) URLs. If a WS/WSS URL is designated as the outputPath, a WebSocket connection is established with the specified URL, and the new messages are dispatched to that connection. Please note that specifying an outputPath is essential for the 'live' option. This path is necessary whether you're sending the live log to a WebSocket URL or saving a live copy of the log file to a local directory.
- server: Similar to 'live', but messages are sent to connected WebSocket clients from the MF Session WS Server. Clients can connect using `ws://localhost:<port>` to receive messages for all user sessions, or `ws://localhost:<port>/<userId>` to receive messages for a specific user session.

To change the output directory of the session recording, use the --sessionOutputPath option with start, stop, or call. This can be done at any time between starting and stopping the recording. For example, --sessionOutputPath ./output/examples will save the recording to the directory specified. The default paths for log and raw formats are ./output/sessions, and for mock-overrides is ./output/mocks.

Please be aware that while utilizing the "live" option, the system doesn't create a singular encompassing JSON array or object. Instead, it produces individual legal JSON objects for each method call or method response that's observed. Owing to the real-time nature of this process, each message is directly written as it arrives.

For file storage, a newline character is appended after every message to facilitate sequential additions. When it comes to WebSocket, the system simply employs the write() function for every incoming message.

A point to consider is that responses might be written to a file before the corresponding messages are received. Consequently, the file will not correlate the responses with their initiating requests. The responsibility lies with the user to associate request IDs with the relevant response IDs when analyzing the output.

## Sequence of Events

To process json file containing sequence of events :
run `node cli.mjs --sequence "path of sequence.json"`
example : node cli.mjs --sequence ../examples/device-onDeviceNameChanged.sequence.json

## Status of ws connection

To get the status of web-socket connection of user :
run `node cli.mjs --getStatus`

## Adding user

To add user :
run `node cli.mjs --addUser <userId>`
example: node cli.mjs --addUser "123~A#appId1"

## Downloading JSON/YAML overrides from a git repository

To download/clone external github repository and save repository contents in MF, below options can be used :

`--downloadOverrides` - specify the url of a github repository to clone

`--overrideLocation` - specify the location relative to current working directory, in which to save the repository's contents. By default, location is set to `mock-firebolt/cli/externalOverrides`

run `node cli.mjs --downloadOverrides <URL of git repository> --overrideLocation <location to save contents>`

examples: 
node cli.mjs --downloadOverrides https://github.com/myOrg/myRepo.git

node cli.mjs --downloadOverrides https://github.com/myOrg/myRepo.git --overrideLocation ../sampleDirectory

# Developer Notes

If/as you add support for new commands or alter how existing commands work, be sure to update the array of command data in `src/usage.mjs`, which is the basis for this usage/help output.
