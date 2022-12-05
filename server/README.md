Mock Firebolt: Server
=====================

The actual Mock Firebolt server, which runs as a NodeJS Express server that:
- Opens a socket and uses this socket to communicate with the Firebolt SDK within an app via the socket transport layer of the SDK.
- Presents a RESTful control plane API which can be used to control the responses and behavior of the server. This API can be used via cURL, Postman, the CLI, the web admin app (also served by this same server), or any/all browser extensions which also use this API.

# RESTful Control Plane API

## Health check endpoint

### cURL Command:

```
curl --location --request GET 'http://localhost:3333/api/v1/healthcheck'
```

### 200 Response:

```
{
    "status": "OK",
    "versionInfo": {
        "mockFirebolt": "<mockFireboltServerVersionNumber>",
        "sdk"
            "core": "<coreSdkVersionNumber>",
            "manage": "<manageSdkVersionNumber>",
            "discovery": "<discoverySdkVersionNumber>",
        }
    }
}
```

NOTE: You'll see one key under `sdk` for each SDK enabled either via the .mf.config.json file or a command-line flag.



## Get all OpenRPC metadata (handy for debugging)

### cURL Command:

```
curl --location --request GET 'http://localhost:3333/api/v1/meta'
```

### 200 Response:

```
{
    "status": "OK",
    "meta": {
        "core": {
            "openrpc": "1.2.4",
            "info": {
                "title": "Firebolt",
                "version": "0.1.1"
            },
            "methods": [
                { }, ...
            ],
            "components": [
                { }, ...
            ]
        },
        "manage": {                         // Included if --manage was provided when Mock Firebolt server was started
            <same structure as above>
        },
        "discovery": {
            <same structure as above>       // Included if --discovery was provided when Mock Firebolt server was started
        }
```



## Get all OpenRPC metadata with all $refs replaced in-line (handy for debugging)

### cURL Command:

```
curl --location --request GET 'http://localhost:3333/api/v1/meta?dereferenced=true'
```

### 200 Response:

```
{
    "status": "OK",
    "meta": {
        "openrpc": "1.2.4",
        "info": {
            "title": "Firebolt",
            "version": "0.1.1"
        },
        "methods": [
            { }, ...        /* Will not contain $refs */
        ]
    }
```



## Set global latency min and max

### cURL Command:

```
curl --location --request POST 'http://localhost:3333/api/v1/state/global/latency' \
--header 'Content-type: application/json' \
--data-raw '{
    "latency": {
        "min": 10,
        "max": 50
    }
}'
```

### 200 Response:

```
{
    "status": "OK"
}
```



## Set per-method latency min and max

### Example cURL Command:

```
curl --location --request POST 'http://localhost:3333/api/v1/state/global/latency' \
--header 'Content-type: application/json' \
--data-raw '{
    "latency": {
        "device.type": {
            "min": 2500,
            "max": 3500
        }
    }
}'
```

### 200 Response:

```
{
    "status": "OK"
}
```



## Set mode

### cURL Commands:

```
# Use overrides, if present, else use static defaults (from first examples in OpenRPC)
curl --location --request POST 'http://localhost:3333/api/v1/state/global/mode' \
--header 'content-type: application/json' \
--data-raw '{
    "mode": "DEFAULT"
}'
```

```
# Only use static defaults (from first examples in OpenRPC)
curl --location --request POST 'http://localhost:3333/api/v1/state/global/mode' \
--header 'content-type: application/json' \
--data-raw '{
    "mode": "box"
}'
```

### 200 Response:

```
{
    "status": "OK"
}
```



## Set success/normal response for method (result)

### Example cURL Commands:

```
curl --location --request POST 'http://localhost:3333/api/v1/state/method/account.id/result' \
--header 'content-type: application/json' \
--data-raw '{
    "result": "ACCOUNT-ONE"
}'
```

```
curl --location --request POST 'http://localhost:3333/api/v1/state/method/accessibility.voiceGuidance/result' \
--header 'content-type: application/json' \
--data-raw '{
    "result": {
        "enabled": true,
        "speed": 10
    }
}'
```

### 200 Response:

```
{
    "status": "OK"
}
```

### Example 400 Response:

```
{
    "status": "ERROR",
    "errorCode": "INVALID-STATE-DATA",
    "message": "Invalid state data provided",
    "error": {
        "name": "DataValidationError",
        "errors": [
            {
                "keyword": "required",
                "dataPath": "",
                "schemaPath": "#/required",
                "params": {
                    "missingProperty": "speed"
                },
                "message": "should have required property 'speed'"
            }
        ]
    }
}
```



## Set error response for method (error with code and message)

### Example cURL Command:

```
curl --location --request POST 'http://localhost:3333/api/v1/state/method/discovery.watched/error' \
--header 'content-type: application/json' \
--data-raw '{
    "error": {
        "code": -32999,
        "message": "This won'\''t work"
    }
}'
```

### 200 Response:

```
{
    "status": "OK"
}
```



## Set multiple state properties at once

### Example cURL Command:

```
curl --location --request PUT 'http://localhost:3333/api/v1/state' \
--header 'content-type: application/json' \
--data-raw '{
    "state": {
        "global": {
            "mode": "DEFAULT"
        },
        "methods": {
            "account.id": {
                "result": "A111"
            },
            "account.uid": {
                "result": "A111-222"
            },
            "discovery.watched": {
                "error": {
                    "code": -32999,
                    "message": "This won'\''t work"
                }
            }
        }
    }
}'
```

### 200 Response:

```
{
    "status": "OK"
}
```

### Example 400 Response:

```
{
    "status": "ERROR",
    "errorCode": "INVALID-STATE-DATA-1",
    "message": "Invalid state data provided",
    "error": {
        "name": "DataValidationError",
        "errors": [
            "ERROR: Value type number is not a valid value for account.id: String expected"
        ]
    }
}
```



## Get current server state (global settings, scratch key-value pairs, and per-method overrides)

### cURL Command:

```
curl --location --request GET 'http://localhost:3333/api/v1/state'
```

### 200 Response:

```
{
    "status": "OK",
    "state": {
        "global": {
            "mode": "DEFAULT",
            "latency": {
                "min": 0,
                "max": 0
            }
        },
        "scratch": {},
        "methods": {
            "account.id": {
                "result": "A-111"
            },
            "account.uid": {
                "result": "A-111-222"
            }
        }
    }
}
```



## Revert to the way things were when server started up

### cURL Command:

```
curl --location --request POST 'localhost:3333/api/v1/state/revert'
```

### 200 Response:

```
{
    "status": "OK"
}
```



## Send an event

### Example cURL Command:

```
curl --location --request POST 'http://localhost:3333/api/v1/event' \
--header 'Content-Type: application/json' \
--data-raw '{
    "method": "device.onDeviceNameChanged",
    "result": "NEW-DEVICE-NAME-1"
}'
```

### 200 Response:

```
{
    "status": "OK"
}
```

## Send an event to all apps with user ID values in the same user group

### Example cURL Command:

```
curl --location --request POST 'http://localhost:3333/api/v1/broadcastEvent' \
--header 'Content-Type: application/json' \
--data-raw '{
    "method": "device.onDeviceNameChanged",
    "result": "NEW-DEVICE-NAME-1"
}'
```

### 200 Response:

```
{
    "status": "OK"
}
```

## Send an event sequence

### Example cURL Command:

```
curl --location --request POST 'http://localhost:3333/api/v1/sequence' \
--header 'Content-Type: application/json' \
--data-raw '[{
    "at": 5000,
    "event": {
      "method": "device.onDeviceNameChanged",
      "result": "NEW-DEVICE-NAME-1"
    }
  },
  {
    "delay": 100,
    "event": {
      "method": "device.onDeviceNameChanged",
      "result": "NEW-DEVICE-NAME-2"
    }
  },
  {
    "at": 7000,
    "event": {
      "method": "device.onDeviceNameChanged",
      "result": "NEW-DEVICE-NAME-3"
    }
  }]'
```

### 200 Response:

```
{
    "status": "OK"
}
```



## Create a user (generates a UUID v4 and registers a user with this User ID)

### Example cURL Command:

```
curl --location --request POST 'http://localhost:3333/api/v1/user'
```

### 200 Response:

```
{
    "status": "OK",
    "userId": "<uuid>"
}
```
## Get list of users (returns a list of all the registered users)

### Example cURL Command:

```
curl --location --request GET 'http://localhost:3333/api/v1/user'
```

### 200 Response:

```
{
    "status": "SUCCESS",
    "users": [
        "<uuid1>",
        "<uuid2>",
        "<uuid3>",
        "<uuid4>"
    ]
}
```
