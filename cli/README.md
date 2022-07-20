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

## Sequence of Events

To process json file containing sequence of events :
run `node cli.mjs --sequence "path of sequence.json"`
example : node cli.mjs --sequence ../examples/device-onDeviceNameChanged.sequence.json

# Developer Notes

If/as you add support for new commands or alter how existing commands work, be sure to update the array of command data in `src/usage.mjs`, which is the basis for this usage/help output.
