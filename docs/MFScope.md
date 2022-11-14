Mock Firebolt: MF Scope Implementation
=======================
This feature allows user to share state belonging to same group.

## User

A userId can contain a user, a group, or both. 
The following format will be used to determine these fields from within a userId:

- A user without a group will contain simply the user: "foo"
- A user with a group will contain both a user and group separated by "~". Ex: "foo~bar" represents user "foo" who is a part of group "bar"
- A group without a user will contain "~" before the group ID. Ex: "~bar".
    - This example represents group "bar" only.
    - A userId containing just "bar" will be interpreted as the user "bar" that is not a part of a group.

There will also be a "global" user. This is a reserved userId representing the global state across all users and groups.

# User State

MFOS will return userState as a combination of userState, groupState and globalState maintaining hierarchy (From lowest priority to highest) global->group->user. In case of conflicts, the one with higher priority will be considered.
For example :
- Every userId will have the global state.
- If state for group **"~bar"** exists, every userId ("abc~bar", "xyz~bar", etc.) belonging to this group will have this state.


# Response functions

Response functions have access to certain parts of a user's state known as the scratch. The scratch is merely a space of key/value pair objects that can be either set() or get() from. This allows current calls to MF to impact future calls to MF by processing and setting variables in this space. 

This scratch space can be accessed via the context object (ctx) can be altered using **scope** variable.
- **set()**
    - The set() function accepts "scope" parameter.
    - If "scope" is empty it will set the key/value to the current user's scratch space
    - If "scope" contains a user and/or group, it will set the key/value to that user's scratch space
        - Ex: set(key, value, "foo~bar") will set the key/value to the scratch space of userId "foo~bar"
        - Ex: set(key, value, "~bar") will set the key/value to the scratch space of group "bar"
        - Ex: set(key, value", "global") will set the key/value to the special userId "global"

- **get()**
    - get() support the new hierarchy as defined above. This will return a consolidated state object (having state of user, group and global).
    - In case of conflicts, the one with higher priority will be considered.

- **delete()**
    - This will remove no-longer-needed variables from a user/group/global scratch  space.
    - It takes two parameter:
        - key: The key to delete
        - scope: The scope of the deletion
    - Similarly to "set()" this will default to the current user's scratch space unless another scratch space is defined in "scope

# Example 

- To set state for "global" via HTTP, use below curl command.
```
curl --location --request PUT 'http://localhost:3333/api/v1/state' \
--header 'content-type: application/json'  \
--header 'x-mockfirebolt-userid: global  \  
	--data-raw '{
	    "state": {
	        "global": {
	            "mode": "default"
	        },
	        "methods": {
	            "account.id": {
	                "result": "A120"
	            }
	        }
	    }
	}'
```

- To set state for "~A" group via HTTP, use below curl command

```
curl --location --request PUT 'http://localhost:3333/api/v1/state' \
	--header 'content-type: application/json'  \
--header 'x-mockfirebolt-userid: ~A'  \ 
	--data-raw '{
	    "state": {
	        " ~A ": {
	            "mode": "default"
	        },
	        "methods": {
	            "account.id": {
	                "result": "A120"
	            }
	        }
	    }
	}'
```
- To change scratch space via yaml file 
    - upload closed-captions-settings-reset.json for user "~A".
    ```
    node cli.mjs --user  ‘~A‘ --upload ../examples/closed-captions-settings-reset.json 
    ```

    - upload closed-captions-settings.yaml with scope  "~A"
    ```
    node cli.mjs --user ‘~A’ --upload ../examples/closed-captions-settings.yaml
    ```
