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

To change the output directory of the session recording use 
`--sessionOutputPath ./output/examples`
with start, stop, or call in between starting and stopping.
This will save the recording to the directory specified. Default for log|raw is server/output/sessions and for mock-overrides is server/output/mocks

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
example: node cli.mjs --addUser "123~A#netflix"

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
