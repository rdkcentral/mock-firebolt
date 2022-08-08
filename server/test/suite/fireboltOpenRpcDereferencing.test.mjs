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

//fireboltOpenRpcDereferencing: Tests

"use strict";

import * as fireboltOpenRpcDereferencing from "../../src/fireboltOpenRpcDereferencing.mjs";

test(`fireboltOpenRpcDereferencing works properly`, () => {
  const meta = {
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
      components: {},
    },
    manage: {
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
        {
          name: "accessory.pair",
          summary: "Pair an accessory with the device.",
          params: [
            {
              name: "type",
              schema: {
                $ref: "#/components/schemas/AccessoryType",
              },
            },
            {
              name: "protocol",
              schema: {
                $ref: "#/components/schemas/AccessoryProtocol",
              },
            },
            {
              name: "timeout",
              schema: {
                $ref: "#/components/schemas/AccessoryPairingTimeout",
              },
            },
          ],
          result: {
            name: "pairedAccessory",
            summary: "The state of last paired accessory",
            schema: {
              $ref: "#/components/schemas/AccessoryInfo",
            },
          },
          examples: [
            {
              name: "Pair a Bluetooth Remote",
              params: [
                {
                  name: "type",
                  value: "Remote",
                },
                {
                  name: "protocol",
                  value: "BluetoothLE",
                },
                {
                  name: "timeout",
                  value: 180,
                },
              ],
              result: {
                name: "Bluetooth Remote successful pairing example",
                value: {
                  type: "Remote",
                  make: "UEI",
                  model: "PR1",
                  protocol: "BluetoothLE",
                },
              },
            },
            {
              name: "Pair a Bluetooth Speaker",
              params: [
                {
                  name: "type",
                  value: "Speaker",
                },
                {
                  name: "protocol",
                  value: "BluetoothLE",
                },
                {
                  name: "timeout",
                  value: 180,
                },
              ],
              result: {
                name: "Bluetooth Speaker successful pairing example",
                value: {
                  type: "Speaker",
                  make: "Sonos",
                  model: "V120",
                  protocol: "BluetoothLE",
                },
              },
            },
            {
              name: "Pair a RF Remote",
              params: [
                {
                  name: "type",
                  value: "Remote",
                },
                {
                  name: "protocol",
                  value: "RF4CE",
                },
                {
                  name: "timeout",
                  value: 180,
                },
              ],
              result: {
                name: "RF Remote successful pairing example",
                value: {
                  type: "Remote",
                  make: "UEI",
                  model: "15",
                  protocol: "RF4CE",
                },
              },
            },
          ],
        },
      ],
      components: {
        schemas: {
          0: {
            enabled: true,
            speed: 2,
          },
          AccessoryList: {
            title: "AccessoryList",
            type: "object",
            description: "Contains a list of Accessories paired to the device.",
            properties: {
              list: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/AccessoryInfo",
                },
              },
            },
          },
          AccessoryPairingTimeout: {
            title: "AccessoryPairingTimeout",
            description:
              "Defines the timeout in seconds. If the threshold for timeout is passed without a result it will throw an error.",
            type: "integer",
            default: 0,
            minimum: 0,
            maximum: 9999,
          },
          AccessoryType: {
            title: "AccessoryType",
            description: "Type of the device Remote,Speaker or Other",
            type: "string",
            enum: ["Remote", "Speaker", "Other"],
          },
          AccessoryTypeListParam: {
            title: "AccessoryTypeListParam",
            description: "Type of the device Remote,Speaker or Other",
            type: "string",
            enum: ["Remote", "Speaker", "All"],
          },
          AccessoryProtocol: {
            title: "AccessoryProtocol",
            description: "Mechanism to connect the accessory to the device",
            type: "string",
            enum: ["BluetoothLE", "RF4CE"],
          },
          AccessoryProtocolListParam: {
            title: "AccessoryProtocolListParam",
            description: "Mechanism to connect the accessory to the device",
            type: "string",
            enum: ["BluetoothLE", "RF4CE", "All"],
          },
          AccessoryInfo: {
            title: "AccessoryInfo",
            description: "Properties of a paired accessory.",
            type: "object",
            properties: {
              type: {
                $ref: "#/components/schemas/AccessoryType",
              },
              make: {
                type: "string",
                description: "Name of the manufacturer of the accessory",
              },
              model: {
                type: "string",
                description: "Model name of the accessory",
              },
              protocol: {
                $ref: "#/components/schemas/AccessoryProtocol",
              },
            },
          },
          ChallengeRequestor: {
            title: "ChallengeRequestor",
            type: "object",
            required: ["id", "name"],
            properties: {
              id: {
                type: "string",
                description: "The id of the app that requested the challenge",
              },
              name: {
                type: "string",
                description: "The name of the app that requested the challenge",
              },
            },
          },
          Challenge: {
            title: "Challenge",
            type: "object",
            required: ["capability", "requestor"],
            properties: {
              capability: {
                type: "string",
                description:
                  "The capability that is being requested by the user to approve",
              },
              requestor: {
                description:
                  "The identity of which app is requesting access to this capability",
                $ref: "#/components/schemas/ChallengeRequestor",
              },
            },
          },
          ChallengeProviderRequest: {
            title: "ChallengeProviderRequest",
            allOf: [
              {
                $ref: "#/components/schemas/ProviderRequest",
              },
              {
                type: "object",
                required: ["parameters"],
                properties: {
                  parameters: {
                    description: "The request to challenge the user",
                    $ref: "#/components/schemas/Challenge",
                  },
                },
              },
            ],
          },
          GrantResult: {
            title: "GrantResult",
            type: "object",
            required: ["granted"],
            properties: {
              granted: {
                type: "boolean",
                description:
                  "Whether the user approved or denied the challenge",
              },
            },
            examples: [
              {
                granted: true,
              },
            ],
          },
          ListenResponse: {
            title: "ListenResponse",
            type: "object",
            required: ["event", "listening"],
            properties: {
              event: {
                type: "string",
                pattern: "[a-zA-Z]+\\.on[A-Z][a-zA-Z]+",
              },
              listening: {
                type: "boolean",
              },
            },
            additionalProperties: false,
          },
          ProviderResponse: {
            title: "ProviderResponse",
            type: "object",
            required: ["correlationId"],
            additionalProperties: false,
            properties: {
              correlationId: {
                type: "string",
                description:
                  "The id that was passed in to the event that triggered a provider method to be called",
              },
              result: {
                description: "The result of the provider response.",
              },
            },
          },
          ProviderRequest: {
            title: "ProviderRequest",
            type: "object",
            required: ["correlationId"],
            additionalProperties: false,
            properties: {
              correlationId: {
                type: "string",
                description:
                  "The id that was passed in to the event that triggered a provider method to be called",
              },
              parameters: {
                description: "The result of the provider response.",
                type: ["object", "null"],
              },
            },
          },
          ClosedCaptionsSettingsProviderRequest: {
            title: "ClosedCaptionsSettingsProviderRequest",
            allOf: [
              {
                $ref: "#/components/schemas/ProviderRequest",
              },
              {
                type: "object",
                properties: {
                  parameters: {
                    title: "SettingsParameters",
                    const: null,
                  },
                },
              },
            ],
            examples: [
              {
                correlationId: "abc",
              },
            ],
          },
          ClosedCaptionsSettings: {
            title: "ClosedCaptionsSettings",
            type: "object",
            required: ["enabled", "styles"],
            properties: {
              enabled: {
                type: "boolean",
                description:
                  "Whether or not closed-captions should be enabled by default",
              },
              styles: {
                $ref: "#/components/schemas/ClosedCaptionsStyles",
              },
            },
            examples: [
              {
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
            ],
          },
          FontFamily: {
            type: "string",
          },
          FontSize: {
            type: "number",
            minimum: 0,
          },
          Color: {
            type: "string",
          },
          FontEdge: {
            type: "string",
          },
          Opacity: {
            type: "number",
            minimum: 0,
            maximum: 100,
          },
          HorizontalAlignment: {
            type: "string",
          },
          VerticalAlignment: {
            type: "string",
          },
          ClosedCaptionsStyles: {
            title: "ClosedCaptionsStyles",
            type: "object",
            description:
              "The default styles to use when displaying closed-captions",
            properties: {
              fontFamily: {
                $ref: "#/components/schemas/FontFamily",
              },
              fontSize: {
                $ref: "#/components/schemas/FontSize",
              },
              fontColor: {
                $ref: "#/components/schemas/Color",
              },
              fontEdge: {
                $ref: "#/components/schemas/FontEdge",
              },
              fontEdgeColor: {
                $ref: "#/components/schemas/Color",
              },
              fontOpacity: {
                $ref: "#/components/schemas/Opacity",
              },
              backgroundColor: {
                $ref: "#/components/schemas/Color",
              },
              backgroundOpacity: {
                $ref: "#/components/schemas/Opacity",
              },
              textAlign: {
                $ref: "#/components/schemas/HorizontalAlignment",
              },
              textAlignVertical: {
                $ref: "#/components/schemas/VerticalAlignment",
              },
            },
          },
          KeyboardType: {
            title: "KeyboardType",
            type: "string",
            description: "The type of keyboard to show to the user",
            enum: ["standard", "email", "password"],
          },
          KeyboardParameters: {
            title: "KeyboardParameters",
            type: "object",
            required: ["type", "message"],
            properties: {
              type: {
                $ref: "#/components/schemas/KeyboardType",
                description: "The type of keyboard",
              },
              message: {
                description:
                  "The message to display to the user so the user knows what they are entering",
                type: "string",
              },
            },
            examples: [
              {
                type: "standard",
                message: "Enter your user name.",
              },
            ],
          },
          KeyboardProviderRequest: {
            title: "KeyboardProviderRequest",
            type: "object",
            required: ["correlationId", "parameters"],
            properties: {
              correlationId: {
                type: "string",
                description:
                  "An id to correlate the provider response with this request",
              },
              parameters: {
                description: "The request to start a keyboard session",
                $ref: "#/components/schemas/KeyboardParameters",
              },
            },
          },
          KeyboardResult: {
            title: "KeyboardResult",
            type: "object",
            required: ["text"],
            properties: {
              text: {
                type: "string",
                description: "The text the user entered into the keyboard",
              },
              canceled: {
                type: "boolean",
                description:
                  "Whether the user canceled entering text before they were finished typing on the keyboard",
              },
            },
          },
          KeyboardResultProviderResponse: {
            title: "KeyboardResultProviderResponse",
            type: "object",
            required: ["correlationId", "result"],
            properties: {
              correlationId: {
                type: "string",
                description:
                  "The id that was passed in to the event that triggered a provider method to be called",
              },
              result: {
                description:
                  "The result of the provider response, containing what the user typed in the keyboard",
                $ref: "#/components/schemas/KeyboardResult",
              },
            },
            examples: [
              {
                correlationId: "123",
                result: {
                  text: "some text",
                },
              },
            ],
          },
          PowerState: {
            title: "PowerState",
            type: "string",
            description:
              "Device power states. Note that 'suspended' is not included, because it's impossible for app code to be running during that state.",
            enum: ["active", "activeStandby"],
          },
          ActiveEvent: {
            title: "ActiveEvent",
            type: "object",
            required: ["reason"],
            properties: {
              reason: {
                type: "string",
                enum: [
                  "firstPowerOn",
                  "powerOn",
                  "rcu",
                  "frontPanel",
                  "hdmiCec",
                  "dial",
                  "motion",
                  "farFieldVoice",
                ],
              },
            },
          },
          StandbyEvent: {
            title: "StandbyEvent",
            type: "object",
            required: ["reason"],
            properties: {
              reason: {
                type: "string",
                enum: [
                  "inactivity",
                  "rcu",
                  "frontPanel",
                  "hdmiCec",
                  "dial",
                  "farFieldVoice",
                  "ux",
                ],
              },
            },
          },
          ResumeEvent: {
            title: "ResumeEvent",
            type: "object",
            required: ["reason"],
            properties: {
              reason: {
                type: "string",
                enum: [
                  "system",
                  "rcu",
                  "frontPanel",
                  "hdmiCec",
                  "dial",
                  "motion",
                  "farFieldVoice",
                ],
              },
            },
          },
          SuspendEvent: {
            title: "SuspendEvent",
            type: "object",
            required: ["reason"],
            properties: {
              reason: {
                type: "string",
                enum: ["powerOn", "rcu", "frontPanel"],
              },
            },
          },
          InactivityCancelledEvent: {
            title: "InactivityCancelledEvent",
            type: "object",
            required: ["reason"],
            properties: {
              reason: {
                type: "string",
                enum: [
                  "rcu",
                  "frontPanel",
                  "farFieldVoice",
                  "dial",
                  "hdmiCec",
                  "motion",
                ],
              },
            },
          },
          ContentPolicy: {
            title: "ContentPolicy",
            type: "object",
            required: [
              "enableRecommendations",
              "shareWatchHistory",
              "rememberWatchedPrograms",
            ],
            properties: {
              enableRecommendations: {
                type: "boolean",
                description:
                  "Whether or not to the user has enabled history-based recommendations",
              },
              shareWatchHistory: {
                type: "boolean",
                description:
                  "Whether or not the user has enabled app watch history data to be shared with the platform",
              },
              rememberWatchedPrograms: {
                type: "boolean",
                description:
                  "Whether or not the user has enabled watch history",
              },
            },
            examples: [
              {
                enableRecommendations: true,
                shareWatchHistory: false,
                rememberWatchedPrograms: true,
              },
            ],
          },
          VoiceGuidanceSettings: {
            title: "VoiceGuidanceSettings",
            type: "object",
            required: ["enabled", "speed"],
            properties: {
              enabled: {
                type: "boolean",
                description:
                  "Whether or not voice guidance should be enabled by default",
              },
              speed: {
                type: "number",
                description:
                  "The speed at which voice guidance speech will be read back to the user",
              },
            },
            examples: [
              {
                enabled: true,
                speed: 2,
              },
            ],
          },
          VoiceSpeed: {
            title: "VoiceSpeed",
            type: "number",
          },
          AccessPointList: {
            title: "AccessPointList",
            type: "object",
            description:
              "List of scanned Wifi networks available near the device.",
            properties: {
              list: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/AccessPoint",
                },
              },
            },
          },
          WifiSecurityMode: {
            title: "WifiSecurityMode",
            description: "Security Mode supported for Wifi",
            type: "string",
            enum: [
              "none",
              "wep64",
              "wep128",
              "wpaPskTkip",
              "wpaPskAes",
              "wpa2PskTkip",
              "wpa2PskAes",
              "wpaEnterpriseTkip",
              "wpaEnterpriseAes",
              "wpa2EnterpriseTkip",
              "wpa2EnterpriseAes",
              "wpa2Psk",
              "wpa2Enterprise",
              "wpa3PskAes",
              "wpa3Sae",
            ],
          },
          WifiSignalStrength: {
            title: "WifiSignalStrength",
            description:
              "Strength of Wifi signal, value is negative based on RSSI specification.",
            type: "integer",
            default: -255,
            minimum: -255,
            maximum: 0,
          },
          WifiFrequency: {
            title: "WifiFrequency",
            description: "Wifi Frequency in Ghz, example 2.4Ghz and 5Ghz.",
            type: "number",
            default: 0,
            minimum: 0,
          },
          AccessPoint: {
            title: "AccessPoint",
            description: "Properties of a scanned wifi list item.",
            type: "object",
            properties: {
              ssid: {
                type: "string",
                description: "Name of the wifi.",
              },
              securityMode: {
                $ref: "#/components/schemas/WifiSecurityMode",
              },
              signalStrength: {
                $ref: "#/components/schemas/WifiSignalStrength",
              },
              frequency: {
                $ref: "#/components/schemas/WifiFrequency",
              },
            },
          },
          WPSSecurityPin: {
            title: "WPSSecurityPin",
            description: "Security pin type for WPS(Wifi Protected Setup).",
            type: "string",
            enum: ["pushButton", "pin", "manufacturerPin"],
          },
          WifiConnectRequest: {
            title: "WifiConnectRequest",
            description: "Request object for the wifi connection.",
            type: "object",
            properties: {
              ssid: {
                schema: {
                  type: "string",
                },
              },
              passphrase: {
                schema: {
                  type: "string",
                },
              },
              securityMode: {
                schema: {
                  $ref: "#/components/schemas/WifiSecurityMode",
                },
              },
              timeout: {
                schema: {
                  $ref: "#/components/schemas/Timeout",
                },
              },
            },
          },
          Timeout: {
            title: "Timeout",
            description:
              "Defines the timeout in seconds. If the threshold for timeout is passed for any operation without a result it will throw an error.",
            type: "integer",
            default: 0,
            minimum: 0,
            maximum: 9999,
          },
        },
      },
    },
  };
  const result = fireboltOpenRpcDereferencing.dereferenceMeta(meta);
  expect(result).toEqual(expect.not.objectContaining({ components: {} }));
});

test(`fireboltOpenRpcDereferencing.replaceRefArr works properly`, () => {
  const testArrWithItemWithRef = [];
  const testPosInArrWithRef = 0;
  const testLookedUpSchema = { test: "Test" };
  const expectedResult = [{ test: "Test" }];
  fireboltOpenRpcDereferencing.testExports.replaceRefArr(
    testArrWithItemWithRef,
    testPosInArrWithRef,
    testLookedUpSchema
  );
  expect(testArrWithItemWithRef).toEqual(
    expect.arrayContaining(expectedResult)
  );
});
