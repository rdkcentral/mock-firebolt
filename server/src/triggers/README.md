# Standard Triggers

This directory contains helpful "standard" triggers which you can use as-is, alter, or use as templates for your own triggers.

To activate triggers, use the `--triggers` command line argument when you run the Mock Firebolt server.

## Handy Lifecycle-Related Triggers

The triggers defined in this directory include post triggers for `lifecycle.ready` and `lifecycle.close` such that:

- Calling `lifecycle.ready` will cause `inactive` and `foreground` Lifecycle events to fire
- Calling `lifecycle.close` will cause `inactive` and `unloading` events to fire

See // See https://github.com/rdkcentral/firebolt-core-sdk/blob/main/src/template/js/sdk/Lifecycle/defaults.js for related code in the Firebolt JS SDK when it uses the mock transport layer.
