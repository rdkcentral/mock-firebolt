Governor
========

# Overview

Governor is a Chrome extension that lets you conveniently send Firebolt lifecycle events to a local Firebolt app running on your development machine.

It requires that you also run [Mock Firebolt](https://github.com/rdkcentral/mock-firebolt) on your machine.


## One time setup

The first time you use the extension, it will prompt you for the port on which your
Mock Firebolt's RESTful control plane API listens. This defaults to port 3333.
You can always change this setting via the settings gear icon.


## Ongoing use

Just click on the extension icon and choose which Firebolt lifecycle event you wish to send. If your app has the appropriate Firebolt lifecycle event handlers, you should see it react accordingly.


# FAQ

Q. Where can I learn more about Mock Firebolt?
A. See [Mock Firebolt](https://github.com/rdkcentral/mock-firebolt).

Q. Where can I learn more about Firebolt lifecycle management?
A. See [Firebolt Lifecycle Management](https://developer.comcast.com/firebolt/core/sdk/latest/docs/lifecycle-management/).
