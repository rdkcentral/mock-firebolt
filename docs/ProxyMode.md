Mock Firebolt: Proxing request and response
===========================================

- [Overview](#overview)
- [Usage](#Usage)

# Overview

When given a mock override for a given method, Mock FIrebolt will return that mock override value (result or error). Without a mock override value, without proxy mode enabled, Mock Firebolt will return a default result based on examples in your OpenRPC files. Without a mock override value, when running with proxy mode enabled, Mock Firebolt will forward messages to the server endpoint you provided and return its responses back to callers.

When Mock Firebolt starts up, it will check for `--proxy` in command line argument. 
- If Present, Get token from connection parameter `?token=` or from env `process.env.MF_TOKEN`. If token present, this will be used while building websocket connection for proxy server else process the request as is.
- Without a mock override value, when running with proxy mode enabled, Mock Firebolt will forward messages to the server endpoint you provided and return its responses back to callers.
- Initialize websocket connection to proxy server and handle failure
- Send inbound messages to proxy endpoint. 
- Send outbound message from proxy endpoint to caller.

# Usage
If you need to use proxy connection for any reason:

```npm start -- --proxy 192.168.0.100:9998```

Default port will be 9998 if not passed expliclity.

To use token while building websocket connection for proxy server and its optional, run below export command before starting Mock Firebolt. 

```export MF_TOKEN=<token>```

If you want to skip validation for specific use case use ```--novalidate``` flag.

```--novalidate method --novalidate params --novalidate response --novalidate event```

*Note*: Proxy mode only work for jsonrpc format. 