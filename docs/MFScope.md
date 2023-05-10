Mock Firebolt: MF Scope Implementation
=======================
This feature allows user to share state belonging to same group.

## User

A userId can contain a user, a group, appId or all. A full "userId" will now contain:
- A user (required)
- group (optional)
- An appid (optional)

The following format will be used to determine these fields from within a userId:

| Full "userId"   | User | Group | AppId   |
| --------------- | ---- | ----- | ------- |
| 123             | 123  | N/A   | N/A     |
| 123~A           | 123  | ~A    | N/A     |
| 123~A#appId1    | 123  | ~A    | appId1  |
| 123#appId1      | 123  | N/A   | appId1  |

There will also be a "global" user. This is a reserved userId representing the global state across all users and groups.

All users and appIds are unique:
- Two users with same user part cannot exist (if "123~A" exists, "123~B" cannot exist).
- Two users with same appId cannot exist (if "123#appId1" exists, "456#appId1" cannot exist).

Example:

| Incoming UserId | Existing UserId | 	Result 	  |
|-----------------| --------------- |   ------ 	  | 
| 123			  | 123				| Not accepted|
| 123			  | 123~A			| Not accepted|
| 123			  | 123~A#appId		| Not accepted|
| 123			  | 123#appId		| Not accepted|
|				  |                 |             |
| 456			  | 123				| Accepted    |
| 456~A		      | 123~A			| Accepted    |
|                                                 |
| 456~A#appId	  | 123~A#appId		| Not Accepted|
| 456~B#appId	  | 123~A#appId		| Not Accepted|
| 456~A#appId1	  | 123~A#appId		| Accepted    |
|                 |                 |             |
| 456~A#appId	  | 123#appId		| Not Accepted|
| 456~A#appId	  | 123#appId1		| Accepted    |
| 456#appId		  | 123#appId1		| Accepted    |


# User State

MFOS will return userState as a combination of userState, groupState and globalState maintaining hierarchy (From lowest priority to highest) global->group->user. In case of conflicts, the one with higher priority will be considered.
For example :
- Every userId will have the global state.
- If state for group **"~bar"** exists, every userId ("abc~bar", "xyz~bar#appId",  etc.) belonging to this group will have this state.


# Response functions

Response functions have access to certain parts of a user's state known as the scratch. The scratch is merely a space of key/value pair objects that can be either set() or get() from. This allows current calls to MF to impact future calls to MF by processing and setting variables in this space. 

This scratch space can be accessed via the context object (ctx) can be altered using **scope** variable.
- **set()**
    - The set() function accepts "scope" parameter.
    - If "scope" is empty it will set the key/value to the current user's scratch space
    - If "scope" contains a user and/or group, it will set the key/value to that user's scratch space
        - Ex: set(key, value, "foo~bar") will set the key/value to the scratch space of userId "foo~bar"
		- Ex: set(key, value, "foo~bar#xyz") will set the key/value to the scratch space of userId "foo~bar#xyz"
        - Ex: set(key, value, "~bar") will set the key/value to the scratch space of group "bar"
        - Ex: set(key, value", "global") will set the key/value to the special userId "global"
		- EX: set(key, value, "#xyz") will set the key/value to the scratch space of userId associated to that appId (if found).
		- EX: set(key, value, "foo") will set the key/value to the scratch space of userId containing given user (if found).

- **get()**
    - get() support the new hierarchy as defined above. This will return a consolidated state object (having state of user, group and global).
    - In case of conflicts, the one with higher priority will be considered.

- **delete()**
    - This will remove no-longer-needed variables from a user/group/global scratch  space.
    - It takes two parameter:
        - key: The key to delete
        - scope: The scope of the deletion
    - Similarly to "set()" this will default to the current user's scratch space unless another scratch space is defined in "scope"

# Example 

- **To set state for "global" via HTTP, use below curl command:**
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

- **To set state for "~A" group via HTTP, use below curl command :**

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

- **To set state for "123~A#appId1" user via HTTP, use below curl command :**

```
curl --location --request PUT 'http://localhost:3333/api/v1/state' \
	--header 'content-type: application/json'  \
	--header 'x-mockfirebolt-userid: 123~A#appId1'  \
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
- **To change scratch space via yaml file :** 

	- Use the below code for closed-captions-settings-reset.json
	```
	{
		"scratch": {
			"closedCaptionsSettings": {
				"enabled": true,
				"styles": {
					"fontFamily": "Monospace sans-serif",
					"fontSize": 1,
					"fontColor": "#ffffff",
					"fontEdge": "none",
					"fontEdgeColor": "#7F7F7F",
					"fontOpacity": 100,
					"backgroundColor": "#000000",
					"backgroundOpacity": 100,
					"textAlign": "center",
					"textAlignVertical": "middle"
				}
			}
		}
	}
	```
	- Upload closed-captions-settings-reset.json for user "~A".
    ```
    node cli.mjs --user  ‘~A‘ --upload ../examples/closed-captions-settings-reset.json 
    ```

	- Use below code for closed-captions-settings.yaml

	```
	---
	methods:
	closedcaptions.enabled:
		response: |
		function f(ctx, params) {
			const ccs = ctx.get('closedCaptionsSettings');
			console.log("### value of ctx inside closedcaptions.enabled of yaml",ctx)
			console.log("*** value of ccs.enabled in yaml----",ccs.enabled)
			return ccs.enabled;
		}
	closedcaptions.setEnabled:
		response: |
		function f(ctx, params) {
			const ccs = ctx.get('closedCaptionsSettings');
			ccs.enabled=params.value
			ctx.set('closedCaptionsSettings',ccs, '~A')
			//ctx.delete('closedCaptionsSettings', '~A')
			console.log("### value of ctx inside closedcaptions.setEnabled of yaml",ctx)

			const result = ctx.get('closedCaptionsSettings');
			const msg = 'Post trigger for closedCaptions.setEnabled';
			console.log("value of result inside yaml ",result)
			console.log("value of msg inside in yaml",msg)
			ctx.sendBroadcastEvent('accessibility.onClosedCaptionsSettingsChanged', result, msg);
			//ctx.sendEvent('closedcaptions.onEnabledChanged', result.enabled, msg);


			return null;
		}
	accessibility.closedCaptionsSettings:
		response: |
		function f(ctx, params) {
			// Getter called... Return our stashed value, per last setter call
			const ccs = ctx.get('closedCaptionsSettings');
			return ccs;
		}

	```
	- Here **ctx.set('closedCaptionsSettings',ccs, '~A')** is used to set the scope for "~A". "~A" represents group A (ex: "~B" represents group B). This will set/update the scratch space for the provided group and all the users belonging to that group ( for ex. "123~A", "456~A") can access them. 

	- To update state for a user , change the scope parameter to that user.
	example : **ctx.set('closedCaptionsSettings',ccs, '123~A')**. This will update the state of user "123~A".

	- To delete key from scratch space: **ctx.delete('closedCaptionsSettings', '~A')**. 
	Here group "~A" is scope and "closedCaptionsSettings" is the key. This will remove the key from scratch space of group A. 
	Similarly to delete key from user, change the scope to that user.
	**ctx.delete('closedCaptionsSettings', '123~A')**.This will remove the key from scratch space of user ( "123~A").

    - Upload closed-captions-settings.yaml with scope  "~A"

    ```
    node cli.mjs --user ‘~A’ --upload ../examples/closed-captions-settings.yaml
    ```
