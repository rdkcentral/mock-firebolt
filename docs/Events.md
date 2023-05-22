# Mock Firebolt: Events: Misc Notes

This document covers the flow of event registration, acknowledgement, and actual event messages in the Mock Firebolt framework. It also explains the configuration used to manage event messages and walks you through a typical flow using default configurations.

## Flow of Events

### Event Request

An event request is a message from a client to register for an event. Below is an example of an event request message:

```
{"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":true},"id":1}
```

### Event Acknowledgement

Once the server has successfully registered the client for the specified event, it optionally sends back an acknowledgement message. Here is an example:

```
{"jsonrpc":"2.0","result":{"listening":true, "event":"lifecycle.onInactive"},"id":1}
```

### Event

When the registered event occurs, the server sends an event message to the client. Here is an example of an event message:

```
{"jsonrpc":"2.0","result":{"state":"inactive","previous":"foreground"}, "id":1}
```

## Configuration

The configuration used to manage events is found in the `.mf.config.json` file under the `eventConfig` key. Here is an explanation of each field:

- registrationMessage: This defines the search pattern to identify registration messages and the method to be used. The search pattern is a regular expression. The method key is a json path.

- unRegistrationMessage: Similar to registrationMessage, this defines the search pattern to identify unregistration messages and the method to be used.

- registrationAck (Optional): This is the template for the acknowledgement message sent when a client successfully registers for an event. It is a Handlebars template string where metadata placeholders get replaced with actual values.

- unRegistrationAck (Optional): This is the template for the acknowledgement message sent when a client successfully unregisters from an event. It is similar to registrationAck.

- event (Optional): This is the template for the actual event message sent when the registered event occurs. It is a Handlebars template where placeholders get replaced with actual values.

## Example Flow using Default Config

The `.mf.config.SAMPLE.json` file contains default configuration for managing events. Here's how a typical flow works with these configurations.

1. A client sends a registration request with the method `device.onNameChanged`.

```
{"jsonrpc":"2.0","method":"device.onNameChanged","params":{"listen":true},"id":7}
```

2. The Mock Firebolt server receives the request and identifies it as a registration request based on the registrationMessage regex in the config. Mock Firebolt also determines the event method through its json path that is either provided optionally in `registrationMessage.method` or by using the default value of `$.method`.

```
"registrationMessage": {
  "searchRegex": "(?=.*\\\"method\\\".*)(?=.*\\\"listen\\\":true.*).*\\.on\\S*",
  "method": "$.method"
}
```

3. If registrationAck is present in the config, the server generates an acknowledgement message using the registrationAck template. It replaces placeholders like {{registration.id}} and {{method}} with actual values from the request.

```
// Handlebars config
{\"jsonrpc\":\"2.0\",\"id\":{{registration.id}},\"result\":{\"listening\":true,\"event\":\"{{method}}\"}}

// Actual result
{"jsonrpc":"2.0","id":7,"result":{"listening":true,"event":"device.onNameChanged"}}

```

4. Send a mock `device.onNameChanged` event using the API.

```
curl --location --request POST 'http://localhost:3333/api/v1/broadcastEvent' \
--header 'Content-Type: application/json' \
--data-raw '{
    "method": "device.onDeviceNameChanged",
    "result": "NEW-DEVICE-NAME-1"
}'
```

5. Mock Firebolt receives the mock event and generates an event message based off of the Handlebars template provided in `eventConfig.event`.

When the event `device.onNameChanged` occurs, the server generates an event message using the event template if present. It replaces placeholders with actual event data. For instance, {{resultAsJson}} would be replaced with the actual event data, serialized as a JSON string.

```
// Handlebars config
{\"result\":{{{resultAsJson}}},\"id\":{{registration.id}},\"jsonrpc\":\"2.0\"}

// Actual result
{"result": "NEW-DEVICE-NAME-1","id":7,"jsonrpc":"2.0"}
```

In the Handlebars templates, you can access data from the event registration, unregistration, and the event itself, which we collectively refer to as metadata. You can use dot notation to access specific pieces of data. For instance, you can use {{registration.id}} to access the id from the registration object in the metadata. Similarly, you can access information from unregistration and event metadata objects.

This example flow should give you an understanding of how to customize the event configurations to suit your needs. Remember, the placeholders in the Handlebars templates correspond to the data in the event metadata, and you can use dot notation to access nested properties.
