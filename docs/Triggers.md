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

You may define pre- and/or post- triggers that fire before and after Firebolt method calls are responded to by Mock Firebolt. These are "hooks" for you to add your own logic and/or actually alter or replace the response that would otherwise be returned by Mock Firebolt.

When Mock Firebolt starts up, it will load any/all pre- and post- triggers defined in any of the directories passed via the `--trigger` command line argument(s). Then, when an app makes a Firebolt call and this call is sent to Mock Firebolt, Mock Firebolt looks to see if there is a pre- and/or post- trigger defined for that method call. If so, it invokes your JavaScript code right before and/or after it calculates the response it should return for that method call. 


## Enabling Triggers

By default, Mock Firebolt does not load/perform any triggers.

To enable triggers, you must provide one or more directories which contain trigger definitions (JavaScript files) via one or more `--triggers` command line arguments when you start Mock Firebolt.

Example:
```
cd server
npm run dev -- --triggers ./src/triggers --triggers /some/other/dir/with/triggers
```


## File Organization

Within each directory you pass via `--triggers` command line arguments, you must create subdirectories named methodTriggers and event Triggers which will contain Firebolt method/event names (e.g., `lifecycle.ready`, `device.id`, etc.) and within these method/event directories you must create JavaScript files named `pre.mjs` and/or `post.mjs` depending on which trigger(s) you are defining.

Your file system might look something like:

```
	method-triggers    <====
      device.id
        pre.mjs        Fire when Device.id called
        post.mjs
      accessibility.closedCaptionsSettings
        pre.mjs
        post.mjs
      accessibility.onClosedCaptionsSettingsChanged
        pre.mjs        Fire when Accessibility.onClosedCaptionsSettingsChanged called
        post.mjs
    event-triggers     <====
      <eventName>
        pre.mjs        Fire when MF sends an Accessibility.onClosedCaptionsSettingsChanged event
        post.mjs

```

## Trigger Definitions: JavaScript Function Definitions

Within any `pre.mjs` file, you define a function named `pre`. Within any `post.mjs` file, you define a function named `post`. 

These functions each take two parameters: a context object (see below) and a params array, which corresponds to the parameters passed by the app to the corresponding Firebolt method call.


### The Context Object

When Mock Firebolt invokes your triggers, it passes your function a context object as the first parameter that includes functions you can use (call) within your triggers.


setTimeout
: The standard setTimeout function; included for your convenience

setInterval
: The standard setInterval function; included for your convenience

sendEvent(onMethodName, result, msg)
: Sends an event with the given result that will trigger the given method. The msg given is used when logging. Note that the `onMethodName` value should be something like `lifecycle.onInactive`.


### Example Usage

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

For example, if your app called `xxx.yyy(17, true, "hello")`, then the params object passed to a pre- or post- trigger would be `[ 17, true, "hello" ]`.

You can use these parameter values to affect the logic in your triggers, to conditionally do or not do something based on a parameter value.


### Altering or Replacing The Response from Mock Firebolt

The return value of pre-triggers is ignored.

Any exception raised by a pre-trigger is also ignored. That is, Mock Firebolt will continue its calculation of a response, invoke any post-trigger, etc. for the Firebolt method call.

Post-triggers, however, may return a response (result or error) and if a post-trigger does return a value or throw an exception, this result or error is used as-is as the result Mock Firebolt will return to the app which made the Firebolt method call. Note that your post-trigger code can either alter/adjust the "standard" response the method would otherwise return or can return its own "hand-crafted" response.

If a post-trigger does not return anything (or returns `undefined` or `null`), Mock Firebolt will return the "standard" response it would otherwise return.


## Examples

See
  - `server/src/triggers/methodTriggers/lifecycle.ready/post.mjs`
  - `server/src/triggers/eventTriggers/lifecycle.close/post.mjs`.