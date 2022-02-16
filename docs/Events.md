Mock Firebolt: Events: Misc Notes
=================================

Example event request, event ack, and event

### Event Request

```
{"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":true},"id":1}
```

### Event Acknowledgement

```
{"jsonrpc":"2.0","result":{"listening":true, "event":"lifecycle.onInactive"},"id":1}
```

### Event

```
{"jsonrpc":"2.0","result":{"state":"inactive","previous":"foreground"}, "id":1}
```
