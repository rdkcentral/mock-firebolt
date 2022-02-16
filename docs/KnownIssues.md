Mock Firebolt: Known Issues
===========================

Known issues:

- Requires client apps use Firebolt SDK v0.6.0-alpha.1 or higher (requires socket transport protocol and `window.__firebolt.endpoint` support)
- The web admin app is under construction and does not currently work
- No development has been done on a web browser extension
- The server does not persist state; if it dies, any state updates must be performed again
- Tests are very limited
- Specifying error values by function is not yet supported
