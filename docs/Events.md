# Mock Firebolt: Events: Misc Notes

This document covers the flow of event registration, acknowledgement, and actual event messages in the Mock Firebolt framework. It also explains the configuration used to manage event messages.

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

* registrationMessage: This defines the search pattern to identify registration messages and the method to be used. The search pattern is a regular expression. The method key is a json path.

* unRegistrationMessage: Similar to registrationMessage, this defines the search pattern to identify unregistration messages and the method to be used.

* registrationAck (Optional): This is the template for the acknowledgement message sent when a client successfully registers for an event. It is a Handlebars template string where metadata placeholders get replaced with actual values.

* unRegistrationAck (Optional): This is the template for the acknowledgement message sent when a client successfully unregisters from an event. It is similar to registrationAck.

* event (Optional): This is the template for the actual event message sent when the registered event occurs. It is a Handlebars template where placeholders get replaced with actual values.