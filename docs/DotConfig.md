Mock Firebolt: mf.config.json(Supported SDK's) 
=======================
## Supported SDK's

Mock Firebolt supports these Firebolt SDKs: core, manage, discovery.
mf.config.json file contains a list of SDK's supported by Mock Firebolt, Out of which `core` is mandatory and other two `manage` and `discovery` are optional.
and it contains associated command-line flags you provide when you start the server.
# If you're only using the Firebolt Core SDK (typical for most 3rd party app developers)
Run mock firebolt server as:
```
npm run dev
```

# If you want support for the Firebolt Manage and/or Firebolt Discovery SDKs
# Include the flag(s) you require
# Note the extra double dash!
```
npm run dev -- --manage --discovery
```

Out of the box, Mock Firebolt contains a .mf.config.SAMPLE.json file. You should copy this file to .mf.config.json (in the same directory) and then make any changes to the new file.


Mock Firebolt: novalidate 
=======================

- [Overview](#overview)
- [Enabling novalidate](#enabling-novalidate)

## Overview

novalidate mode where mock firebolt does not validate uploaded method overrides.

When Mock Firebolt starts up,it will check for `validateFlag` value in mf.config.json file and novalidate flag passed via the `--novalidate` command line argument.

A validateFlag:true value in the mf.config.json file should take precedence over the --novalidate command-line argument, if given.

Normally users will not want to use this feature/flag

## Enabling novalidate Flag

To disable validation of uploaded method overrides, you must set validateFlag in mf.config.json to `false` and pass `--novalidate` command line argument when you start Mock Firebolt.

Example:
```
cd server
npm run dev -- --novalidate
```
