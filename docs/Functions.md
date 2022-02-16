Mock Firebolt: Specifying Method Responses as Functions
=======================================================

The response for a method can either be a "result" or an "error". A result is returned to the Firebolt SDK client as a regular function return value. An error is thrown by the Firebolt SDK client as a regular JS Error.

When specifying overrides for method responses, clients may specify:

- A constant "result" value, which will be returned as a normal JS return value from the Firebolt JS SDK method call.
- A constant "error" value (an object with code and message properties), which will cause the Firebolt JS SDK to throw an Error.
- A "result" value specified as a function, which will return the SDK's return value dynamically.
- A "response" value specified as a function, which will either return the SDK's return value dynamically or cause the SDK function to throw an Error.

In the last two cases, the "result" or "response" value should be a function **named f** with the following signature:
```
function f(ctx, params)
```
and which either returns a result or throws a ctx.FireboltError(code, message).

The params parameter is a JS object containing any/all parameters passed to the SDK function (which are contained in the params property within the JSON RPC call that Mock Firebolt receives).

The ctx object contains "helper" functions and Error classes you can use within the body of your function. These include:

- ctx.set(key, val) - Used to save state in a "scratch" area set aside for data sharing between methods

- ctx.get(key) - Used to get state from the "scratch" area

- ctx.FireboltError - A subclass of `Error`, which is only available, and is to be used, when specifying overrides via "response", which can either return a result or throw an error

To cause the SDK to return an overridden return value ('result'), simply return a value from your function that matches the appropriate schema/constraints for the method you're overriding.

To cause the SDK to throw an error ('error'), your function should throw ctx.FireboltError.

See the `examples/` directory of the CLI project for examples.
