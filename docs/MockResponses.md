Mock Firebolt: Specifying Mock Responses <!-- omit in toc -->
========================================

- [Specifying Results, Errors, or Either](#specifying-results-errors-or-either)
  - [Static Result](#static-result)
  - [Static Error](#static-error)
  - [Dynamic Result](#dynamic-result)
  - [Dynamic Response (Result or Error)](#dynamic-response-result-or-error)
  - [Sequence of Responses (each a Result or Error)](#sequence-of-responses-each-a-result-or-error)
- [Magic Date/Time Strings](#magic-datetime-strings)
  - [Examples](#examples)
  - [Notes](#notes)

## Specifying Results, Errors, or Either

These are the valid ways to specify the response that Mock Firebolt should return for a given method:

### Static Result

```json
{
  "result": xxx
}
```

### Static Error

```json
{
  "error": {
    "code": -32xxx,
    "message": "xxx"
  }
}
```

### Dynamic Result

```json
{
  "result": "function f(ctx, params) { ... }"
}
```

See the "The Context Object" and "Params" sections of [Triggers](./Triggers.md) for information about the ctx and params parameters passed to your function.

In addition to the methods listed there, the ctx object here also includes a `FireboltError` property, which your function can/should use (throw) if/when it wants to return an exception to the client/app. (See the `metrics-mediaLoadStart-1.yaml` example.)

### Dynamic Response (Result or Error)

```json
{
  "response": "function f(ctx, params) { ... }"
}
```

See the "The Context Object" and "Params" sections of [Triggers](./Triggers.md) for information about the ctx and params parameters passed to your function.

In addition to the methods listed there, the ctx object here also includes a `FireboltError` property, which your function can/should use (throw) if/when it wants to return an exception to the client/app. (See the `metrics-mediaLoadStart-1.yaml` example.)

See [Functions](./Functions.md).

### Sequence of Responses (each a Result or Error)

```json
{
  "policy": "REPEAT-LAST-RESPONSE" (default) | "REVERT-TO-STATIC-RESPONSE",
  "responses": [
    {
      "error": {
        "code": -32xxx,
        "message": "xxx"
      }
    },
    {
      "result": xxx
    }
  ]
}
```

This is useful for, say, returning an error one time, or returning a specific result one time and then another result from then on, etc.



## Magic Date/Time Strings

Anywhere within your mock responses (via result, error, response, or responses), you may use
"magic date/time" strings.

### Examples

| Example                         | Description                                                             |
| ------------------------------- | ----------------------------------------------------------------------- |
| `{{+15s\|X}}`                     | 15 seconds from "now" as a Unix timestamp in seconds (capital X)        |
| `{{+10m\|x}}`                     | 10 minutes from "now" as a Unix timestamp in milliseconds (lowercase x) |
| `{{-2h\|YYYY-MM-DD HH:mm:ssZ}}`   | 2 hours "ago" as a string like 2015-06-15T14:22:35Z                     |
| `{{20:00\|x}}`                    | 8PM today as a Unix timestamp in milliseconds                           |
| `{{19:00+1d\|x}}`                | 7PM tomorrow as a Unix timestamp in milliseconds                        |

### Notes

-  The syntax of a magic date/time variable looks like one of these:
   - `{{<relativeDateTime>|<moment-style formatting string>}}`
   - `{{timeSpecificRelativeDateTime|<moment-style formatting string>}}`
- where:
   - `<relativeDateTime>` is of the form `{+|-}{n}{<moment-style date add key or shorthand key>}`
   - `<timeSpecificRelativeDateTime>` is of the form `HH:MM[:SS][{+|-}{n}{moment-style date add key or shorthand key>}]`
