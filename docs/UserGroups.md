Mock Firebolt: User Groups
==========================

Mock Firebolt is designed to be run in a mode where one developer uses it to control the behavior of one application being developed and tested. However, there are times when you may want to share Mock Firebolt state across two or more apps. In this latter case, any events sent by Mock Firebolt will go to _all_ client apps registered to listen for those events.


# User IDs

Normally, in the single-user use case, you don't need to worry about Mock Firebolt User IDs at all.

- If you launch your app and use `mf=true`, `mf=9998`, or `mf=ws%3A%2F%2Flocalhost%3A9998`, you'll automatically be using the default UserID.
- If you use the REST API without an `x-mockfirebolt-userid` header, you'll automatically be using the default UserID.
- If you use the CLI without a `--user` (or `-u`) flag and without a top-level `userId` property in the `.mf.config.json` file, you'll automatically be using the default UserID.

The default UserID is  '12345'.

In a multi-user situation, the default User ID won't work; a single User ID isn't enough to distinguish one developer's Mock Firebolt state from another's. Here, each developer must use a unique User ID.

- When launching an app, you must include a path within the websocket address you pass. E.g., `mf=ws%3A%2F%2Flocalhost%3A9998%2F123`. (Note that that's the URL encoding of "ws://localhost:9998/123".)
- When using the REST API, you must specify your user id value in an `x-mockfirebolt-userid` header. To match the example above, you'd set this header to `123`.
- When using the CLI, you must either use the `--user` (or `-u`) flag (e.g., `--user 123`) and/or set the `userId` value in your `.mf.config.json` file to your UserID. In this example, you'd set this to "123".

See [MultiUser.md](./MultiUser.md) for more details.

Normally, a User ID represents just the "user"/developer. You can think of it as "tenant" if you're familiar with multi-tenant systems. However, you may also include a User Group Name within your User ID values that you use as a way to differentiate two or more applications that should share Mock Firebolt state.

# User Groups

If a User ID value is of the form "<userId>\~<groupName>" (with a tilde separating two parts of the value), the first part is treated as the developer's User ID ("tenant") and the second part is treated as the group name.

Any/all apps which connect to Mock Firebolt using the same group name (and which register for the appropriate event listeners) will each receive a copy of any/all events sent by Mock Firebolt. The apps are "in a group" and receive the same events from Mock Firebolt.

Note that when using a user group, you must still use separate `<userId>` portions of your User ID values (one per app) so that Mock Firebolt can send replies to method calls _only_ to the right app/client.

To use user groups:

- When launching an app, you must include a path within the websocket address you pass and ensure that the path (user id) contains both a User ID and a user group name separated by a tilde ("~"). E.g., `mf=ws%3A%2F%2Flocalhost%3A9998%2F123~A`. (Note that that's the URL encoding of "ws://localhost:9998/123~A".)
- When using the REST API, you must specify your user id value in an `x-mockfirebolt-userid` header. To match the example above, you'd set this header to `123~A`.
- When using the CLI, you must either use the `--user` (or `-u`) flag (e.g., `--user 123`) and/or set the `userId` value in your `.mf.config.json` file to your UserID. In this example, you'd set this to "123\~A".

#AppID

If a User ID value is of the form "<userId>\~<groupName>\#<appId>" or "<userId>\#<appId>, the part after "#" is treated as the appId associated with the user. For example, in "123~A#appId1" appId1 is the appId.

Only one user can be associated with an appId (for example, if 123#appId1 exist, 456#appId1 cannot exist).