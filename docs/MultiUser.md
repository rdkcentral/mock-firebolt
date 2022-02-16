Mock Firebolt: Multi-User Mode
==============================

Mock Firebolt is designed to be run locally (on a developer's machine) but can be run as a shared service somewhere on a local network. In this latter case, it is important that the state updates made by each user of the shared service are kept separate. This document explains how this is done.

Note: "State" here means overrides for method responses, global settings (like latency), and any scratch k-v data shared by method result or response overrides given as functions. It's all the "stuff" (state) that affects how Mock Firebolt works differently, based on how you've asked it to work differently than its default behavior.


# State

State is stored on a per-user basis


# REST API

The Mock Firebolt control plane REST API endpoints take an optional userId header, which can be used to indicate the specific Mock Firebolt user setting his/her/their mock override data.

If this header is not present, the default Mock Firebolt user ID is used.


```
x-mockfirebolt-userid: <userId>
```


# CLI

The Mock Firebolt control plane CLI takes an optional userId value, either specified on the command-line interface via the `--user <userId>` option or via the `.mf.config.json` file.

If no `--user` parameter is provided and no `.mf.config.json` file exists, the default Mock Firebolt user ID is used.

You may want to do:
```
cd cli/src
cp .mf-SAMPLE.config.json .mf.config.json
<Edit .mf.config.json file>
```

# Web Admin

@TODO


# Browser Extension

@TODO
