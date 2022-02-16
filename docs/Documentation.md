Mock Firebolt: Documentation
============================

# The Basic Idea

The basic idea is simple:

- Run the Mock Firebolt server locally on your machine while you develop your app.
  - It's just a simple NodeJS/Express server... you just run it and let it run "forever" while you're developing.
- When you want it to react in a particular way, you use its "control plane" RESTful API
  - http://localhost:3333/api/v1/...
  - Via any programming language, CURL, the command-line interface, the web admin interface, a browser extension, etc.
- In your app, use the Firebolt SDK like normal, with these important points:
  - **(SHORT TERM ONLY:)** Use a Firebolt SDK which supports the Socket Transport Layer
  - Follow the instructions here: [UsageWithinApps.md](./UsageWithinApps.md)


# Overview

For an overview of the core features of Mock Firebolt, see [Overview.md](./Overview.md).


# Usage Within Apps

See [UsageWithinApps.md](./UsageWithinApps.md). This document explains how to set a specific global variable used by the Firebolt SDK to talk to a local socket over the socket transport layer. This is something apps should only do during development and QA, not production.


# RESTful Control Plane API

See [server/README.md](../server/README.md) for information about the server's RESTful control plane API.


# Command-Line Interface

See [cli/README.md](../cli/README.md) for information about the command-line interface (which acts as a client of the server's RESTful control plane API).


# Browser Extensions

Not yet implemented.


# Mock Responses

See [MockResponses.md](./MockResponses.md). This document describes how to specify (non-error) results and errors from within REST requests.

To learn about specifying dynamic responses (controlled by a JavaScript function rather than a static value), see [Functions.md](./Functions.md).


# Events

For notes about how Firebolt events work, see [Events.md](./Events.md).


# Multi-User Support

Mock Firebolt is intented to (primarily) be used as a single-user tool: each developer will have Mock Firebolt running on his or her development machine. However, Mock Firebolt does support multiple users in the sense that the mock overrides specified for one user are independent from and don't affect those of others.

For information about how to use Mock Firebolt in multi-user mode, see [MultiUser.md](./MultiUser.md).

If you're interested in how this multi-user support works within the Mock Firebolt source code, see [MultiUser-DeveloperNotes.md](./MultiUser-DeveloperNotes.md).


# System Configurations

For information about various ideas for how Mock Firebolt might be configured / used, see [SystemConfigurations.md](./SystemConfigurations.md).
