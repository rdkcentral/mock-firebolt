Conduit
=======

An app meant to be run on a STB or TV that works in concert with Mock Firebolt.

# For More Information

For more information, see [docs/Conduit.md](../docs/Conduit.md).

# Getting Started

## How to use

Run the following commands in the root directory.

```bash
npm install
npm run build
npm run start
```

This will run the Conduit app locally, but normally you'll want to run it on a device since that's its primary purpose... to act as a middle-man between Mock Firebolt and a real Firebolt implementation on a device.

When you launch the app, you'll want to include the "mf" URL parameter and set this to the full websocket address of the *Conduit socket* that Mock Firebolt owns and opens for Conduit to connect to. E.g., "ws://(yourDevBoxIp):9997".
