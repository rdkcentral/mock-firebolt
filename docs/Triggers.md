Mock Firebolt: Triggers <!-- omit in toc -->
=======================

- [Overview](#overview)
- [Enabling Triggers](#enabling-triggers)
- [File Organization](#file-organization)
- [Trigger Definitions: JavaScript Function Definitions](#trigger-definitions-javascript-function-definitions)
  - [The Context Object](#the-context-object)
  - [Example Usage](#example-usage)
  - [Params](#params)
  - [Altering or Replacing The Response from Mock Firebolt](#altering-or-replacing-the-response-from-mock-firebolt)
- [Examples](#examples)



## Overview

When Mock Firebolt starts up, it will load any/all triggers defined in any of the directories passed via the `--trigger` command line argument(s). These triggers fire before or after Mock Firebolt is asked to return a mock resposne for an incoming method call ("method triggers") or before or after Mock Firebolt sends an event to an app / client ("event triggers").



## Two Kinds of Triggers

### Pre- and Post-Method Triggers

You may define pre- and/or post- triggers that fire before and after Firebolt method calls are responded to by Mock Firebolt. These are "hooks" for you to add your own logic and/or actually alter or replace the response that would otherwise be returned by Mock Firebolt.

Then, when an app makes a Firebolt call and this call is sent to Mock Firebolt, Mock Firebolt looks to see if there is a pre- and/or post- trigger defined for that method call. If so, it invokes your JavaScript code right before and/or after it calculates the response it should return for that method call. Your post- trigger may alter or replace the response Mock Firebolt would otherwise return.

### Pre- and Post-Event Triggers

You may define pre- and/or post- triggers that fire before and after Mock Firebolt sends an event to an app / client, whether due to (a) a POST to the `/api/v1/event` endpoint, (b) the use of the `--event` flag when using the CLI (which performs a POST to that endpoint internally), or (c) a trigger using the `ctx.sendEvent` utility function (see below).



## Enabling Triggers

By default, Mock Firebolt does not load/perform any triggers.

To enable triggers, you must provide one or more directories which contain trigger definitions (JavaScript files) via one or more `--triggers` command line arguments when you start Mock Firebolt.

Example:
```
cd server
npm start -- --triggers ./src/triggers --triggers /some/other/dir/with/triggers
```

As shown in the example above, you may load triggers from multiple directories. This allows you to organize your triggers as you see fit, and load subsets of them when you start Mock Firebolt.



## File Organization

Within each directory you pass via `--triggers` command line arguments, you must create subdirectories named methodTriggers and eventTriggers which will contain Firebolt method/event directories (e.g., `lifecycle.ready`, `device.id`, etc.) and within these directories you must create JavaScript files named `pre.mjs` and/or `post.mjs` depending on which trigger(s) you are defining.

Your file system might look something like:

```
<trigger directory>
  methodTriggers
    device.id
      pre.mjs
      post.mjs
    accessibility.closedCaptionsSettings
      pre.mjs
      post.mjs
	...
  eventTriggers
    device.onDeviceNameChanged
      pre.mjs
      post.mjs
    ...
```



## Trigger Definitions: JavaScript Function Definitions

Within any `pre.mjs` file, you define a function named `pre`. Within any `post.mjs` file, you define a function named `post`. 

These functions each take two parameters: a context object (see below) and a params array, which corresponds to the parameters passed by the app to the corresponding Firebolt method call.


### The Context Object

When Mock Firebolt invokes your triggers, it passes your function a context object, `ctx` as the first parameter that includes functions you can use (call) within your triggers. The `ctx` object contains these methods:

logger
: A simple logging object with the methods `debug`, `info`, `important`, `warn`, `warning`, `err`, and `error`, all of which take a single string parameter. Note that `warn` and `warning` are effectively synonyms, as are `err` and `error`.

setTimeout
: The standard setTimeout function; included for your convenience

setInterval
: The standard setInterval function; included for your convenience

set(key, val)
: Store a value in Mock Firebolt's "scratch pad" "in-memory database." Along with get(), this is useful for letting triggers and mock override functions share state. The key should be a string (think "variable name" or "Redis key name"). The value can be any JS object.

get(key)
: Retrieve a value from Mock Firebolt's "scratch pad" "in-memory database."

sendEvent(onMethodName, result, msg)
: Sends an event with the given result that will trigger the given method. The msg given is used when logging. Note that the `onMethodName` value should be something like `lifecycle.onInactive`.

As well as these functions, the ctx object for post- triggers (only), also contains either a `result` property or an `error` property, depending on whether the core mock override response has been set to a non-error result or to an error. Generally speaking, your code should inspect which of these keys is truty to determine which one has been provided.

NOTE: These same functions are also available in the ctx object passed to a dynamic result or dynamic response provided for a method. See the "Dynamic Result" and "Dynamic Response (Result or Error)" sections on [Mock Responses](./MockResponses.md).


#### Example Usage

```
function post(ctx, params) {
  ctx.setTimeout(function() {
    const result = { state: 'inactive' };
    const msg = 'Post trigger for lifecycle.ready sent inactive lifecycle event';
    ctx.sendEvent('lifecycle.onInactive', result, msg);
  }, 500);
  ...
}
```

### Params

As explained above, the second parameter passed to your triggers will be a params array that corresponds to the parameters passed to the Firebolt method.

For example, if your app called `xxx.yyy(17, true, "hello")` and this method defined its parameters as ii, flag, and greeting, then the params object passed to a pre- or post- trigger would be `{ii: 17, flag: true, greeting: "hello" }`.

You can use these parameter values to affect the logic in your triggers, to conditionally do or not do something based on a parameter value.



## Altering or Replacing The Response from Mock Firebolt

The return value of pre-triggers is ignored.

Any exception raised by a pre-trigger is also ignored. That is, Mock Firebolt will continue its calculation of a response, invoke any post-trigger, etc. for the Firebolt method call.

Post-triggers, however, may return a response (result or error) and if a post-trigger does return a value or throw an exception, this result or error is used as-is as the result Mock Firebolt will return to the app which made the Firebolt method call. Note that your post-trigger code can either alter/adjust the "standard" response the method would otherwise return or can return its own "hand-crafted" response.

If a post-trigger does not return anything (or returns `undefined` or `null`), Mock Firebolt will return the "standard" response it would otherwise return.


### Method Triggers vs. "Standard" Mock Responses

By default, when handling incoming method calls, Mock Firebolt returns a static mock response (based on the first example in the OpenRPC specification for the method.

(Note that this is the same behavior as the stand-alone Firebolt SDKs.)

However, if you've either (a) done a POST to /api/v1/state or (b) used the --upload flag when using the CLI, Mock Firebolt will return whatever mock override value you've specified.

Using this core feature is the standard, best way to specify a specific mock response.

While you can also cause Mock Firebolt to return a specific mock response by writing a post- method trigger for the method in question, returning the value from your custom post function, this is not considered a best practice. The post- method trigger is really intended for use when you've connected Mock Firebolt either to the Conduit app on a STB or TV or paired Mock Firebolt as a Developer Tool with a STB or TV and are otherwise asking Mock Firebolt to act as a reverse proxy to real Firebolt running on a STB or TV.



## Examples

See
  - `server/src/triggers/methodTriggers/lifecycle.ready/post.mjs`
  - `server/src/triggers/eventTriggers/lifecycle.close/post.mjs`.