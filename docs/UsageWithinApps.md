Mock Firebolt: Usage Within Apps <!-- omit in toc -->
================================

- [Overview](#overview)
- [Activating Mock Firebolt](#activating-mock-firebolt)
- [Webpack Techniques to Activate Mock Firebolt in Development Mode Only](#webpack-techniques-to-activate-mock-firebolt-in-development-mode-only)
- [Example App Startup Code to Conditionally Activate Mock Firebolt](#example-app-startup-code-to-conditionally-activate-mock-firebolt)

# Overview

With one exception (described below), you should add @firebolt-js/sdk as a depenedency in your package.json file and make Firebolt SDK method calls, etc. as usual (in the exact same way you would if you were either just using the static mocks in the SDK itself or if you were running in production, without Mock Firebolt).

# Activating Mock Firebolt

In order to get the Firebolt SDK to talk to Mock Firebolt, you must ultimately set the global variable

```js
window.__firebolt.endpoint
```

The value of this variable should be a websocket URL such as:

```
ws://localhost:9998
```

IMPORTANT NOTE: Ideally, your code should only set this variable's value if/when built for non-production deployments.

Each application may use its own mechanism to set this value. Example approaches (while in development):

- Simply hard-code it to `ws://localhost:9998` and assume all developers have Mock Firebolt running locally on that port
- Use one or more query string parameters to control things. Examples:
  - Use Mock Firebolt, and set this global variable to `ws://localhost:9998`:
    - `&mf=true`
  - Use Mock Firebolt, but use a specific port on localhost
    - `&mf=9993`
  - Use Mock Firebolt, and use a specific value for the Firebolt endpoint to use (note the URL encoding used)
    - `&mf=ws%3A%2F%2Flocalhost%3A9998`
  - Use Mock Firebolt, and use a specific value for the Firebolt endpoint to use (note the URL encoding used and the path for a specific user)
    - `&mf=ws%3A%2F%2Flocalhost%3A9998%2F123`
  - Use Mock Firebolt, and use a specific value for the Firebolt endpoint to use (note the URL encoding used and the path for a specific user (123) within a specific group (A))
    - `&mf=ws%3A%2F%2Flocalhost%3A9998%2F123~A`

## Users and User Groups

Mock Firebolt is normally used in "single user mode."
It can also be used to support multiple developers in "multi user mode."
Detailed documentation for multi-user support can be found in [MultiUser.md](./MultiUser.md).

Although this is not normally needed, Mock Firebolt can be used to support a single user running multiple apps which should share the same Mock Firebolt state, using a feature called "user groups."
Detailed documentation for user groups can be found in [UserGroups](./UserGroups.md).

# Webpack Techniques to Activate Mock Firebolt in Development Mode Only

Ideally, you should not set `window.__firebolt.endpoint` in production. If you are using webpack, there are a number of plugins / techniques you can use, including:

- ifdef-loader -- See https://github.com/nippur72/ifdef-loader for more information.
- DefinePlugin -- See https://webpack.js.org/plugins/define-plugin for more information.
- NormalModuleReplacementPlugin -- See https://webpack.js.org/plugins/normal-module-replacement-plugin/ for more information. Note that you may experience a TS2307 error if you're using TypeScript


# Example App Startup Code to Conditionally Activate Mock Firebolt

```js
type FireboltObj = {
  endpoint: string;
};
declare global {
  interface Window {
    __firebolt?: FireboltObj;
  }
}

if ( process.env.MF ) {
  const queryParams = new window.URLSearchParams(document.location.search);
  let mf = queryParams.get('mf');
  if ( mf ) {
    mf = decodeURIComponent(mf);
    let endpoint = undefined;
    if ( [ 'T', 'TRUE', 'YES', 'Y', '1', 'ON', 'MF', 'MOCK' ].includes(mf.toUpperCase()) ) {
       endpoint = `ws://localhost:9998`;
    } else {
      // Regular expression to check if number is a valid port number
      const regexExp = /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/gi;
      const match = mf.match(regexExp);
      if ( match && match.length >= 1 ) {
        endpoint = `ws://localhost:${match[0]}`;
      } else if ( mf.startsWith('ws') ) {
        endpoint = mf;
      }
    }
    if ( endpoint ) {
      if ( ! window.__firebolt ) {  window.__firebolt = <FireboltObj>{}; }
      window.__firebolt.endpoint = endpoint;
      console.info(`Using Mock Firebolt listening at ${endpoint}`);
    }
  }
}
```
