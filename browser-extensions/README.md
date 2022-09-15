Mock Firebolt: Control Plane Browser Extensions
===============================================

This folder contains these browser extensions:

- **governor/**
	 - A simple way to send Firebolt lifecycle events to an app via Mock Firebolt.
- **injector/**
	 - Injects the "activateMockFirebolt.js" script onto any web page with a URL that includes "mf=". Provides a way to connect any application, including apps which don't include this script in their source code (including production apps) to Mock Firebolt.


NOTE: The plugins use the RESTful API of the Mock Firebolt server in the same way that the CLI and web admin app (served by the same NodeJS Express server that serves the Mock Firebolt control plane API).
