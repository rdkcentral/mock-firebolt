Mock Firebolt: mf.config.json(Supported SDK's) 
=======================
## Supported SDK's

Mock Firebolt supports these Firebolt SDKs: **core** & **manage**.

The `mf.config.json` file contains a list of OpenRPC/SDK's supported by Mock Firebolt, out of which core/manage OpenRPC is supported by default.

# Starting Mock Firebolt
Run Mock Firebolt server as:

```
npm start
```

Out of the box, Mock Firebolt contains a .mf.config.SAMPLE.json file. You should copy this file to .mf.config.json (in the same directory) and then make any changes to the new file.


Mock Firebolt: novalidate 
=======================

- [Overview](#overview)
- [Enabling novalidate](#enabling-novalidate)

## Overview

novalidate mode where Mock Firebolt skips certain validation steps, based on options you provide.

When Mock Firebolt starts up,it will check for `validate` value in mf.config.json file and novalidate flag passed via the `--novalidate` command line argument.

`validate` array string in the mf.config.json file will take precedence over the --novalidate command-line argument, if given.

Normally users will not want to use this feature/flag

## Enabling novalidate Flag

By default, Mock Firebolt will validate incoming method names and parameters and outgoing events. If you want to prevent some or all of these validation checks, you must either set the value of validate in mf.config.json to a subset of the default values (["method", "params", "response", "event"]) or pass one or more --novalidate command line arguments when you start Mock Firebolt.

Example:
```
cd server
npm start -- --novalidate method --novalidate response
```
