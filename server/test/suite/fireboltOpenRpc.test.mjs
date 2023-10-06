/*
 * Copyright 2021 Comcast Cable Communications Management, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// fireboltOpenRpc: Tests

"use strict";

import { jest } from "@jest/globals";
import { logger } from "../../src/logger.mjs";
import * as fireboltOpenRpc from "../../src/fireboltOpenRpc.mjs";
import { config } from "../../src/config.mjs";

test(`fireboltOpenRpc.getRawMeta works properly`, () => {
  const expectedResult = {
    core: {
      openrpc: "1.2.4",
      info: {
        title: "Firebolt",
        version: "0.6.1",
      },
      methods: [
        {
          name: "rpc.discover",
          summary: "Firebolt OpenRPC schema",
          params: [],
          result: {
            name: "OpenRPC Schema",
            schema: {
              type: "object",
            },
          },
        },
      ],
      components: {
        schemas: {
          SemanticVersion: {
            title: "SemanticVersion",
            type: "object",
            properties: {
              major: {
                type: "integer",
                minimum: 0,
              },
              minor: {
                type: "integer",
                minimum: 0,
              },
              patch: {
                type: "integer",
                minimum: 0,
              },
              readable: {
                type: "string",
              },
            },
            required: ["major", "minor", "patch", "readable"],
            additionalProperties: false,
          },
        },
      },
    },
  };
  fireboltOpenRpc.testExports.rawMeta["core"] = {
    openrpc: "1.2.4",
    info: {
      title: "Firebolt",
      version: "0.6.1",
    },
    methods: [
      {
        name: "rpc.discover",
        summary: "Firebolt OpenRPC schema",
        params: [],
        result: {
          name: "OpenRPC Schema",
          schema: {
            type: "object",
          },
        },
      },
    ],
    components: {
      schemas: {
        SemanticVersion: {
          title: "SemanticVersion",
          type: "object",
          properties: {
            major: {
              type: "integer",
              minimum: 0,
            },
            minor: {
              type: "integer",
              minimum: 0,
            },
            patch: {
              type: "integer",
              minimum: 0,
            },
            readable: {
              type: "string",
            },
          },
          required: ["major", "minor", "patch", "readable"],
          additionalProperties: false,
        },
      },
    },
  };
  const result = fireboltOpenRpc.getRawMeta();
  expect(result).toEqual(expectedResult);
});

test(`fireboltOpenRpc.getMeta works properly`, () => {
  const expectedResult = {
    core: {
      openrpc: "1.2.4",
      info: {
        title: "Firebolt",
        version: "0.6.1",
      },
      methods: [
        {
          name: "rpc.discover",
          summary: "Firebolt OpenRPC schema",
          params: [],
          result: {
            name: "OpenRPC Schema",
            schema: {
              type: "object",
            },
          },
        },
      ],
    },
  };
  fireboltOpenRpc.testExports.meta["core"] = {
    openrpc: "1.2.4",
    info: {
      title: "Firebolt",
      version: "0.6.1",
    },
    methods: [
      {
        name: "rpc.discover",
        summary: "Firebolt OpenRPC schema",
        params: [],
        result: {
          name: "OpenRPC Schema",
          schema: {
            type: "object",
          },
        },
      },
    ],
  };
  const result = fireboltOpenRpc.getMeta();
  expect(result).toEqual(expectedResult);
});

test(`fireboltOpenRpc.getMethod works properly`, () => {
  fireboltOpenRpc.testExports.methodMaps["core"] = {
    "rpc.discover": {
      name: "rpc.discover",
      summary: "Firebolt OpenRPC schema",
      params: [],
      result: {
        name: "OpenRPC Schema",
        schema: {
          type: "object",
        },
      },
    },
    "accessibility.voiceGuidanceSettings": {
      name: "accessibility.voiceGuidanceSettings",
      summary: "Get the user's preferred voice guidance settings",
      params: [],
      tags: [
        {
          name: "property:readonly",
        },
      ],
      result: {
        name: "settings",
        summary: "the voice guidance settings",
        schema: {
          $ref: "#/components/schemas/VoiceGuidanceSettings",
        },
      },
      examples: [
        {
          name: "Getting the voice guidance settings",
          params: [],
          result: {
            name: "Default Result",
            value: {
              enabled: true,
              speed: 5,
            },
          },
        },
      ],
    },
  };
  const expectedInput = [
    "rpc.discover",
    "accessibility.voiceGuidanceSettings",
    "invalidMethod",
  ];
  const out = fireboltOpenRpc.testExports.methodMaps.core;
  const expectedOutput = [
    out["rpc.discover"],
    out["accessibility.voiceGuidanceSettings"],
    undefined,
  ];
  const configArray = [false, false, true];
  expectedInput.forEach((methodName, index) => {
    config.app.allowMixedCase = configArray[index];
    const result = fireboltOpenRpc.getMethod(methodName);
    if (configArray[index]) {
      expect(result).toBeUndefined();
    } else expect(result).toEqual(expectedOutput[index]);
  });
  config.app.allowMixedCase = false;
});

test(`fireboltOpenRpc.isMethodKnown works properly`, () => {
  fireboltOpenRpc.testExports.methodMaps["core"] = {
    "rpc.discover": {
      name: "rpc.discover",
      summary: "Firebolt OpenRPC schema",
      params: [],
      result: {
        name: "OpenRPC Schema",
        schema: {
          type: "object",
        },
      },
    },
    "accessibility.voiceGuidanceSettings": {
      name: "accessibility.voiceGuidanceSettings",
      summary: "Get the user's preferred voice guidance settings",
      params: [],
      tags: [
        {
          name: "property:readonly",
        },
      ],
      result: {
        name: "settings",
        summary: "the voice guidance settings",
        schema: {
          $ref: "#/components/schemas/VoiceGuidanceSettings",
        },
      },
      examples: [
        {
          name: "Getting the voice guidance settings",
          params: [],
          result: {
            name: "Default Result",
            value: {
              enabled: true,
              speed: 5,
            },
          },
        },
      ],
    },
  };
  const expectedInput = [
    "rpc.discover",
    "accessibility.voiceGuidanceSettings",
    "invalidMethod",
  ];
  const expectedOutput = [true, true, false];
  expectedInput.forEach((methodName, index) => {
    const result = fireboltOpenRpc.isMethodKnown(methodName);
    expect(result).toBe(expectedOutput[index]);
  });
});

test("fireboltOpenRpc.getSchema", () => {
  fireboltOpenRpc.testExports.meta["core"] = {
    openrpc: "1.2.4",
    info: {
      title: "Firebolt",
      version: "0.6.1",
    },
    methods: [
      {
        name: "rpc.discover",
        summary: "Firebolt OpenRPC schema",
        params: [],
        result: {
          name: "OpenRPC Schema",
          schema: {
            type: "object",
          },
        },
      },
    ],
    components: {
      schemas: {
        SemanticVersion: {
          title: "SemanticVersion",
          type: "object",
          properties: {
            major: {
              type: "integer",
              minimum: 0,
            },
            minor: {
              type: "integer",
              minimum: 0,
            },
            patch: {
              type: "integer",
              minimum: 0,
            },
            readable: {
              type: "string",
            },
          },
          required: ["major", "minor", "patch", "readable"],
          additionalProperties: false,
        },
      },
    },
  };
  const expectedInput = ["SemanticVersion"];
  const out = fireboltOpenRpc.testExports.meta.core.components.schemas;
  const expectedOutput = [out["SemanticVersion"], undefined];
  expectedInput.forEach((schemaName, index) => {
    const result = fireboltOpenRpc.getSchema(schemaName);
    expect(result).toEqual(expectedOutput[index]);
  });
});

test(`fireboltOpenRpc. getFirstExampleValueForMethod works properly`, () => {
  fireboltOpenRpc.testExports.methodMaps["core"] = {
    "rpc.discover": {
      name: "rpc.discover",
      summary: "Firebolt OpenRPC schema",
      params: [],
      result: {
        name: "OpenRPC Schema",
        schema: {
          type: "object",
        },
      },
    },
    "accessibility.voiceGuidanceSettings": {
      name: "accessibility.voiceGuidanceSettings",
      summary: "Get the user's preferred voice guidance settings",
      params: [],
      tags: [
        {
          name: "property:readonly",
        },
      ],
      result: {
        name: "settings",
        summary: "the voice guidance settings",
        schema: {
          $ref: "#/components/schemas/VoiceGuidanceSettings",
        },
      },
      examples: [
        {
          name: "Getting the voice guidance settings",
          params: [],
          result: {
            name: "Default Result",
            value: {
              enabled: true,
              speed: 5,
            },
          },
        },
      ],
    },
    "account.id": {
      name: "account.id",
      summary: "Get the platform back-office account identifier",
      params: [],
      tags: [
        {
          name: "property:immutable",
        },
      ],
      result: {
        name: "id",
        summary: "the id",
        schema: {
          type: "string",
        },
      },
      examples: [
        {
          name: "Default Example",
          params: [],
        },
      ],
    },
    invalidMethod: {
      name: "invalidMethod",
      summary: "Get the platform back-office account identifier",
      params: [],
      tags: [{}],
      result: {
        name: "id",
      },
      examples: [],
    },
  };
  const expectedInput = [
    "rpc.discover",
    "accessibility.voiceGuidanceSettings",
    "account.id",
    "invalidMethod",
    "invalidMethod1",
  ];
  const expectedOutput = [
    undefined,
    {
      enabled: true,
      speed: 5,
    },
    undefined,
    undefined,
  ];
  expectedInput.forEach((methodName, index) => {
    const result = fireboltOpenRpc.getFirstExampleValueForMethod(methodName);
    expect(result).toEqual(expectedOutput[index]);
  });
});

test(`fireboltOpenRpc.getDeveloperNotesForMethod works properly`, () => {
  fireboltOpenRpc.testExports.methodMaps["core"] = {
    "rpc.discover": {
      name: "rpc.discover",
      summary: "Firebolt OpenRPC schema",
      params: [],
      result: {
        name: "OpenRPC Schema",
        schema: {
          type: "object",
        },
      },
    },
    "accessibility.voiceGuidanceSettings": {
      name: "accessibility.voiceGuidanceSettings",
      summary: "Get the user's preferred voice guidance settings",
      params: [],
      tags: [
        {
          name: "property:readonly",
        },
      ],
      result: {},
    },
    "account.id": {
      name: "account.id",
      summary: "Get the platform back-office account identifier",
      params: [],
      tags: [],
      result: {},
    },
    validMethodName: {
      name: "validMethodName",
      summary: "Get the platform back-office account identifier",
      params: [],
      tags: [
        {
          name: "developerNotes",
        },
      ],
      result: {
        name: "id",
      },
    },
  };
  const expectedInput = [
    "rpc.discover",
    "accessibility.voiceGuidanceSettings",
    "account.id",
    "validMethodName",
  ];
  const expectedOutput = [
    undefined,
    undefined,
    undefined,
    { docUrl: undefined, notes: undefined },
  ];
  expectedInput.forEach((methodName, index) => {
    const result = fireboltOpenRpc.getDeveloperNotesForMethod(methodName);
    expect(result).toEqual(expectedOutput[index]);
  });
});

test(`fireboltOpenRpc.validateMethodCall works properly`, () => {
  fireboltOpenRpc.testExports.methodMaps["core"] = {
    "rpc.discover": {
      name: "rpc.discover",
      summary: "Firebolt OpenRPC schema",
      params: [],
      result: {
        name: "OpenRPC Schema",
        schema: {
          type: "object",
        },
      },
    },
    "accessibility.onClosedCaptionsSettingsChanged": {
      name: "accessibility.onClosedCaptionsSettingsChanged",
      summary: "Get the user's preferred closed-captions settings",
      params: [
        {
          name: "listen",
          required: true,
          schema: {
            type: "boolean",
          },
        },
      ],
      tags: [
        {
          name: "event",
          "x-alternative": "closedCaptionsSettings",
        },
      ],
      result: {
        name: "closedCaptionsSettings",
        summary: "the closed captions settings",
        schema: {
          oneOf: [
            {
              $ref: "#/components/schemas/ListenResponse",
            },
            {
              $ref: "#/components/schemas/ClosedCaptionsSettings",
            },
          ],
        },
      },
      examples: [
        {
          name: "Getting the closed captions settings",
          params: [
            {
              name: "listen",
              value: true,
            },
          ],
          result: {
            name: "settings",
            value: {
              enabled: true,
              styles: {
                fontFamily: "Monospace sans-serif",
                fontSize: 1,
                fontColor: "#ffffff",
                fontEdge: "none",
                fontEdgeColor: "#7F7F7F",
                fontOpacity: 100,
                backgroundColor: "#000000",
                backgroundOpacity: 100,
                textAlign: "center",
                textAlignVertical: "middle",
              },
            },
          },
        },
      ],
    },
    invalidMethod: {
      name: "invalidMethod",
      summary: "checking for invalid method",
      result: {
        name: "invalidTestCase",
        summary: "the closed captions settings",
        schema: {
          oneOf: [
            {
              $ref: "#/components/schemas/ListenResponse",
            },
          ],
        },
      },
    },
  };
  const dummyParams = {
    "accessibility.onClosedCaptionsSettingsChanged": {},
  };

  const expectedInput = [
    "rpc.discover",
    "accessibility.onClosedCaptionsSettingsChanged",
  ];
  const expectedOutput = [
    [],
    [
      {
        dataPath: "",
        keyword: "type",
        message: "should be boolean",
        params: { type: "boolean" },
        schemaPath: "#/type",
      },
    ],
  ];
  expectedInput.forEach((methodName, index) => {
    const result = fireboltOpenRpc.validateMethodCall(methodName, dummyParams);
    expect(result).toEqual(expect.arrayContaining(expectedOutput[index]));
  });

  // catch block testing
  const inputObj = fireboltOpenRpc.testExports.methodMaps.invalidMethod;
  const spy = jest.spyOn(logger, "error");
  fireboltOpenRpc.validateMethodCall(inputObj, dummyParams);
  expect(spy).toHaveBeenCalled();
});

test(`fireboltOpenRpc.validateMethodResult works properly`, () => {
  fireboltOpenRpc.testExports.methodMaps["core"] = {
    "rpc.discover": {
      name: "rpc.discover",
      summary: "Firebolt OpenRPC schema",
      params: [],
      result: {
        name: "OpenRPC Schema",
        schema: {
          type: "object",
        },
      },
    },
    "accessibility.voiceGuidanceSettings": {
      name: "accessibility.voiceGuidanceSettings",
      summary: "Get the user's preferred voice guidance settings",
      params: [],
      tags: [
        {
          name: "property:readonly",
        },
      ],
      result: {
        name: "settings",
        summary: "the voice guidance settings",
        schema: {
          $ref: "#/components/schemas/VoiceGuidanceSettings",
        },
      },
      examples: [
        {
          name: "Getting the voice guidance settings",
          params: [],
          result: {
            name: "Default Result",
            value: {
              enabled: true,
              speed: 5,
            },
          },
        },
      ],
    },
  };
  const dummyVal = {
    code: -32601,
    message: "Not supported",
  };

  const expectedInput = [
    "rpc.discover",
    "accessibility.voiceGuidanceSettings",
    "function() {}",
  ];
  const expectedOutput = [
    ["ERROR: Could not validate value rpc.discover for method [object Object]"],
    [
      "ERROR: Could not validate value accessibility.voiceGuidanceSettings for method [object Object]",
    ],
    [],
  ];
  expectedInput.forEach((methodName, index) => {
    const result = fireboltOpenRpc.validateMethodResult(methodName, dummyVal);
    if (index !== 2) {
      expect(result[0]).toBe(expectedOutput[index][0]);
    } else {
      expect(result).toEqual([]);
    }
  });

  const dummyVal1 = "function(){12334}";
  const result1 = fireboltOpenRpc.validateMethodResult(
    expectedInput[1],
    dummyVal1
  );
  expect(result1).toEqual(expect.arrayContaining([]));

  // catch block testing
  const inputObj = fireboltOpenRpc.testExports.methodMaps.invalidMethod;
  const spy = jest.spyOn(logger, "error");
  fireboltOpenRpc.validateMethodResult(inputObj, dummyVal);
  expect(spy).toHaveBeenCalled();
});

test(`fireboltOpenRpc.validateMethodError works properly`, () => {
  const expectedInput = [
    { val: "function(){12334}", result: 0 },
    { val: { message: "Not supported" }, result: 1 },
    { val: { code: -32601 }, result: 1 },
    { val: 12345, result: 1 },
    { val: { code: -32601, message: "Not supported" }, result: 0 },
  ];
  expectedInput.forEach((item) => {
    const result = fireboltOpenRpc.validateMethodError(item.val);
    expect(result.length).toBe(item.result);
  });
});

test(`fireboltOpenRpc.buildMethodMapsForAllEnabledSdks works properly`, () => {
  const expectedOutput = {
    core: {
      "rpc.discover": {
        name: "rpc.discover",
        params: [],
        result: { name: "OpenRPC Schema", schema: { type: "object" } },
        summary: "Firebolt OpenRPC schema",
      },
    },
  };
  fireboltOpenRpc.testExports.buildMethodMapsForAllEnabledSdks();
  expect(fireboltOpenRpc.testExports.methodMaps).toEqual(expectedOutput);
});

test(`fireboltOpenRpc.buildMethodMap works properly`, () => {
  const inputs = [{}, { test: "test" }];
  const outputs = ["undefined", "undefined", "object"];
  config.app.allowMixedCase = true;
  outputs.forEach((output, index) => {
    let result;
    if (index === 2) {
      result = fireboltOpenRpc.testExports.buildMethodMap();
    } else {
      result = fireboltOpenRpc.testExports.buildMethodMap(inputs[index]);
    }
    expect(typeof result).toBe(output);
  });
  config.app.allowMixedCase = false;
});

test(`fireboltOpenRpc.downloadOpenRpcJsonFile works properly`, () => {
  fireboltOpenRpc.testExports
    .downloadOpenRpcJsonFile("test_url")
    .catch((err) => {
      expect(err.message).toEqual("Invalid URL");
    });
});
