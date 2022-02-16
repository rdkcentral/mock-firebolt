Mock Firebolt: Multi-User Mode Developer Notes
==============================================

# Overview of How Multi-User Support is Implemented

## Server State

Moved from state being a singleton map to a map of maps.
Keys are userIds. Values are maps (single-user state objects).

## REST API

All route handlers look to find the Mock Firebolt User ID (via the x-mockfirebolt-userid header) and use this when accessing the state map.

## CLI

The CLI reads a .mf.config.json file (in the same directory as cli.mjs) which can contain the key "userId", which would hold the userId to be used for all CLI commands that do not override this value.

The CLI supports a `--user` command-line argument. If present, this value takes precedence over anything found in the config file above.

When the CLI makes calls to the REST API, it passes this value in the requests (via the x-mockfirebolt-userid header).

## Web Admin

@TODO

## Browser Extension

@TODO

## Firebolt SDK Sockets

### Client apiEndpoint Values

Clients must pass apiEndpoint values that look something like this:

```
&_apiTarget=ws%3A%2F%2F127.0.0.1%3A9998%2F123
```

The above is a URL encoded version of this:

```
&_apiTarget=ws://127.0.0.1:9998/123
```

where `123` is an example userId value. Normally this would be a UUID.

### Internal logic

In `index.mjs`, the main entry point for the server, there is code that looks like this:

```
// Make the correct ws connection available to routes
app.use(function(req, res, next) {
  const userId = getUserIdFromReq(req);
  res.locals.ws = userManagement.getWsForUser(userId);
  next();
});
```

This code ensures that the right websocket is available in res.locals for use by a route handler.



# Adding Users

Visit /users/add in the web admin UI. This will generate a UUID for a userId value, create a new web socket server tied to this UUID, and ensure that code handling incoming websocket requests can determine the corresponding userId (which is used to access that user's state).

@TODO: MORE HERE


# Misc Notes (@TODO: Fold in / merge / edit / etc.)

```
- User visits /users/add
  - A UUID is generated for userId
  - A new web socket server (wss) created, ***???*** with path = /<userId> ***???***
  - Associates userId->wss in user2wss map
  - The wss.on('connection', function connection(ws) {} handler function:
    - Associates userId->ws in user2ws map
    - Set on('message') handler to standard messageHandler.handleMessage() function

- User visits their app, which is launched with &_apiTarget=ws://127.0.0.1:9998/123 (note the path!)
  - HTTP server is configured so that upon socket upgrade:
    - Choose the right wss based on path (/<userId>) (Uses user2wss map)
    - wss<n>.emit('connection')
      - Causes connection message above

- User visits (or CLI uses or web admin uses) REST endpoint with x-mockfirebolt-userid: <userId>
  - Access ws connection for given userId (Uses user2ws map)
