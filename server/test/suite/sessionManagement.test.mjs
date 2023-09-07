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

// sessionManagement: Tests

"use strict";

import fs from "fs";
import { jest } from "@jest/globals";
import { logger } from "../../src/logger.mjs";
import * as sessionManagement from "../../src/sessionManagement.mjs";

const userId = '12345';
const singleExampleArray =  [
  {
    methodCall: 'accessibility.closedCaptionsSettings',
    timestamp: 1663091848444,
    sequenceId: 1,
    response: { 
      result: {
        enabled: true,
        styles: {
          fontFamily: 'Monospace sans-serif',
          fontSize: 1,
          fontColor: '#ffffff',
          fontEdge: 'none',
          fontEdgeColor: '#7F7F7F',
          fontOpacity: 100,
          backgroundColor: '#000000',
          backgroundOpacity: 100,
          textAlign: 'center',
          textAlignVertical: 'middle'
        }
      },
      timestamp: 1663091848455
    }
  },
  {
    methodCall: 'appcatalog.apps',
    params: {
      request: {}
    },
    timestamp: 1662743885216,
    sequenceId: 2,
    response: {
      error: {
          code: -32601,
          message: 'Method not found'
      }, 
      timestamp: 1663091851797
    }
  },
  {
    methodCall: 'missing.response',
    params: { type: 'platform' },
    timestamp: 1663091857761,
    sequenceId: 3,
    error: {
        code: 'Missing',
        message: 'Response'
    }
  },
  {
    methodCall: 'discovery.policy',
    timestamp: 1663091862727,
    sequenceId: 4,
    response: {
      result: false,
      timestamp: 1663091866532
    }
  },
  {
    methodCall: 'authentication.token',
    params: { type: 'platform' },
    timestamp: 1663091857761,
    sequenceId: 3,
    error: {
        code: 'CertError',
        message: 'Received response as undefined'
    },
    response: {
      result: false,
      timestamp: 1663091866532
    }
  },
];

test(`sessionManagement.stopRecording works properly in case of throwing error`, () => {
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => { return error});
  sessionManagement.startRecording();
  const result = sessionManagement.stopRecording();
  expect(spy).toHaveBeenCalled();
  expect(result).toBe(null);
});

describe(`Session`, () => {
  const session = new sessionManagement.Session(userId);

  test(`should return null`, () => {
    const result = session.exportSession();
    expect(result).toBe(null);
  });
  test(`should return filepath`, () => {
    const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    const result = session.exportSession();
    expect(spy).toHaveBeenCalled();
    expect(result).toMatch(/(sessions)/);
    spy.mockClear();
  });
});

describe(`FireboltCall`, () => {
  const fireboltCall = new sessionManagement.FireboltCall(
    "Test Method",
    "Test Parameters"
  );
  test(`should instantiate`, () => {
    expect(fireboltCall.methodCall).toEqual("Test Method");
  });
});

describe(`SessionHandler`, () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test(`should initialize without a WebSocket or FileStream`, () => {
    const sessionHandler = new sessionManagement.testExports.SessionHandler();
    expect(sessionHandler.ws).toBeNull();
    expect(sessionHandler.stream).toBeNull();
  });

  test(`_determineMode sets mode to 'websocket' for a WebSocket directory`, () => {
    const dir = 'ws://example.com';
    const sessionHandler = new sessionManagement.testExports.SessionHandler();
  
    sessionHandler._determineMode(dir);
    expect(sessionHandler.mode).toBe('websocket');
  });
  
  test(`_determineMode sets mode to 'filestream' for a non-WebSocket directory`, () => {
    const dir = './some/directory/path';
    const sessionHandler = new sessionManagement.testExports.SessionHandler();
  
    sessionHandler._determineMode(dir);
    expect(sessionHandler.mode).toBe('filestream');
  });

  describe(`Websocket functionality`, () => {
    test(`should open a WebSocket connection`, () => {
      const mockSessionHandler = {
        ws: {
          open: jest.fn(),
          send: jest.fn(),
          close: jest.fn(),
        },
        stream: null,
        close: jest.fn(() => {
          mockSessionHandler.ws.close()
        }),
        write: jest.fn(() => {
          mockSessionHandler.ws.send()
        }),
        open: jest.fn(() => {
          mockSessionHandler.ws.open()
        }),
        mode: 'websocket'
      };

      const SessionHandler = jest.spyOn(sessionManagement.testExports, 'SessionHandler')
      .mockImplementation(() => mockSessionHandler);
      const dir = 'ws://example.com';

      const sessionHandler = new SessionHandler();
      sessionHandler.open(dir);
      
      expect(sessionHandler.open).toHaveBeenCalled();
      expect(sessionHandler.ws.open).toHaveBeenCalled();
    });

    test(`should close a WebSocket connection`, () => {
      const mockSessionHandler = {
        ws: {
          open: jest.fn(),
          send: jest.fn(),
          close: jest.fn(),
        },
        stream: null,
        close: jest.fn(() => {
          mockSessionHandler.ws = null
        }),
        write: jest.fn(() => {
          mockSessionHandler.ws.send()
        }),
        open: jest.fn(() => {
          mockSessionHandler.ws.open()
        }),
        mode: 'websocket'
      };
      
      const SessionHandler = jest.spyOn(sessionManagement.testExports, 'SessionHandler')
      .mockImplementation(() => mockSessionHandler);
      const dir = 'ws://example.com';

    const sessionHandler = new SessionHandler();
    sessionHandler.close(dir);

    expect(sessionHandler.close).toHaveBeenCalled();
    expect(sessionHandler.ws).toBeNull();
    });
  });

  describe(`FileStream functionality`, () => {
    test(`should open a file stream`, () => {
      const dir = './some/directory/path';
      const mockWriteStream = {
        write: jest.fn(),
        end: jest.fn()
      };

      jest.spyOn(fs, 'createWriteStream').mockReturnValue(mockWriteStream);

      const sessionHandler = new sessionManagement.testExports.SessionHandler();
      sessionHandler.open(dir);

      expect(sessionHandler.stream).toBeTruthy();
    });

    test(`should write data to the file stream`, () => {
      const dir = './some/directory/path';
      const data = 'test data';

      const mockWriteStream = {
        write: jest.fn(),
        end: jest.fn()
      };

      jest.spyOn(fs, 'createWriteStream').mockReturnValue(mockWriteStream);
      jest.spyOn(fs, 'mkdirSync').mockReturnValue(() => jest.fn());

      const sessionHandler = new sessionManagement.testExports.SessionHandler();
      sessionHandler.open(dir);
      sessionHandler.write(data);

      expect(mockWriteStream.write).toHaveBeenCalledWith(`${data}\n`);
    });

    test(`should close the file stream`, () => {
      const dir = './some/directory/path';

      const mockEnd = jest.fn();
      const mockWriteStream = {
        write: jest.fn(),
        end: mockEnd
      };

      jest.spyOn(fs, 'createWriteStream').mockReturnValue(mockWriteStream);

      const sessionHandler = new sessionManagement.testExports.SessionHandler();
      sessionHandler.open(dir);
      sessionHandler.close();

      expect(mockEnd).toHaveBeenCalled();
      expect(sessionHandler.stream).toBeNull();
    });

    test(`should create directory if it does not exist`, () => {
      const dir = './some/non/existent/path';
    
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      const mockMkdirSync = jest.spyOn(fs, 'mkdirSync').mockImplementation(jest.fn());
      jest.spyOn(fs, 'createWriteStream').mockReturnValue({
        write: jest.fn(),
        end: jest.fn()
      });
    
      const sessionHandler = new sessionManagement.testExports.SessionHandler();
      sessionHandler.open(dir);
    
      expect(mockMkdirSync).toHaveBeenCalled();
    });
  });
});

describe(`Session ws server functions`, () => {
  let mockWs1, mockWs2, mockWs3;

  beforeEach(() => {
    // Mock WebSocket objects
    mockWs1 = { send: jest.fn() };
    mockWs2 = { send: jest.fn() };
    mockWs3 = { send: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test(`should associate user with WebSocket`, () => {
    sessionManagement.associateUserWithSessionWsMap('user1', mockWs1);

    const ws = sessionManagement.getWsfromSessionMap('user1')
    expect(ws).toBe(mockWs1);
  });

  test(`should remove user from WebSocket mapping`, () => {
    sessionManagement.associateUserWithSessionWsMap('user1', mockWs1);
    sessionManagement.removeUserFromSessionWsMap('user1');

    const ws = sessionManagement.getWsfromSessionMap('user1')
    expect(ws).toBeNull();
  });

  test(`should send message to matching sessions`, () => {
    const uuid = '20318aab-ea53-4a65-8d97-09f74bbf5b0b';
    const userId = 'user1';
    const data = 'test message';

    sessionManagement.associateUserWithSessionWsMap(userId, mockWs1);
    sessionManagement.associateUserWithSessionWsMap('user2', mockWs2);
    sessionManagement.associateUserWithSessionWsMap(uuid, mockWs3);

    sessionManagement.sendMessageToMatchingSessions(data, userId);

    expect(mockWs1.send).toHaveBeenCalledWith(data);
    expect(mockWs2.send).not.toHaveBeenCalled();
    expect(mockWs3.send).toHaveBeenCalledWith(data);
  });
});

test(`sessionManagement.startRecording works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  sessionManagement.startRecording();
  expect(spy).toHaveBeenCalled();
});

test(`sessionManagement.stopRecording works properly for file condition`, () => {
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  sessionManagement.startRecording();
  const result = sessionManagement.stopRecording();
  expect(result).toMatch(/(sessions)/);
});

test(`sessionManagement.stopRecording works properly for else path`, () => {
  const result = sessionManagement.stopRecording();
  expect(result).toBe(null);
});

test(`sessionManagement.stopRecording cleans up user session data`, () => {
  const mockSessionHandler = {
    ws: {
      open: jest.fn(),
      send: jest.fn(),
      close: jest.fn()
    }, 
    close: jest.fn(() => {
      mockSessionHandler.ws.close()
    }),
    write: jest.fn(() => {
      mockSessionHandler.ws.send()
    }),
    open: jest.fn()
  };
  
  const mockSessionRecording = {
    '12345': {
      recording: true,
      recordedSession: {
        userId: '12345',
        calls: [],
        sessionOutput: 'log',
        sessionOutputPath: 'ws://example.com',
        mockOutputPath: 'ws://example.com',
        sessionHandler: mockSessionHandler,
        exportSession: jest.fn()
      }
    }
  };

  sessionManagement.testExports.setTestSessionRecording(mockSessionRecording);

  sessionManagement.startRecording(userId);
  sessionManagement.stopRecording(userId);

  expect(mockSessionRecording['12345']).toBeUndefined();
});

test(`sessionManagement.isRecording works properly`, () => {
  if (true) {
    sessionManagement.startRecording(userId);
    const result = sessionManagement.isRecording(userId);
    expect(result).toBeTruthy();
    sessionManagement.stopRecording(userId);
  }
  const result = sessionManagement.isRecording(userId);
  expect(result).toBeFalsy();
});

test(`sessionManagement.addCall works properly`, () => {
  sessionManagement.startRecording(userId);
  const result = sessionManagement.addCall("methodName", "Parameters");
  expect(result).toBeUndefined();
});

test(`sessionManagement.addCall calls sessionHandler.write`, () => {
  const mockSessionHandler = {
    close: jest.fn(),
    write: jest.fn(),
    open: jest.fn()
  };
  
  const mockSessionRecording = {
    '12345': {
      recording: true,
      recordedSession: {
        userId: '12345',
        calls: [],
        sessionOutput: 'live',
        sessionOutputPath: 'ws://example.com',
        mockOutputPath: 'ws://example.com',
        sessionHandler: mockSessionHandler,
        exportSession: jest.fn()
      }
    }
  };
    
  sessionManagement.startRecording('12345');
  sessionManagement.testExports.setTestSessionRecording(mockSessionRecording);
  sessionManagement.addCall("methodName", "Parameters", userId);

  expect(mockSessionRecording['12345'].recordedSession.sessionHandler.write).toHaveBeenCalled();
});

test(`sessionManagement.addCall does not call sessionHandler.write if sessionOutput equals server`, () => {  
  const mockSessionHandler = {
    close: jest.fn(),
    write: jest.fn(),
    open: jest.fn()
  };
  
  const mockSessionRecording = {
    '12345': {
      recording: true,
      recordedSession: {
        userId: '12345',
        calls: [],
        sessionOutput: 'server',
        sessionOutputPath: 'ws://example.com',
        mockOutputPath: 'ws://example.com',
        sessionHandler: mockSessionHandler,
        exportSession: jest.fn()
      }
    }
  };
  
  sessionManagement.startRecording('12345');
  sessionManagement.testExports.setTestSessionRecording(mockSessionRecording);
  sessionManagement.addCall('methodName', 'Parameters', '12345');

  expect(mockSessionRecording['12345'].recordedSession.sessionHandler.write).not.toHaveBeenCalled();
});

test(`verify sortJsonByTime method is working`, () => {
  const session = new sessionManagement.Session(userId);
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  session.sortJsonByTime({ "sessionStart": 1660644687500, "sessionEnd": 1660644699862, "calls": [ { "methodCall": "moneybadger.logMoneyBadgerLoaded", "params": { "startTime": 1660644697447, "version": "4.10.0-7e1cc95" }, "timestamp": 1660644697456, "sequenceId": 1 }, { "methodCall": "lifecycle.onInactive", "params": { "listen": true }, "timestamp": 1660644697795, "sequenceId": 2, "response": { "result": { "listening": true, "event": "lifecycle.onInactive" }, "timestamp": 1660644697796 } }]});
  expect(spy).toHaveBeenCalled();
  spy.mockClear();
});

test('verify updateCallWithResponse is working', () => {
  const mockSessionHandler = {
    close: jest.fn(),
    write: jest.fn(),
    open: jest.fn()
  };

  const mockSessionRecording = {
    '12345': {
      recording: true,
      recordedSession: {
        userId: '12345',
        calls: [
          {
            methodCall: 'device.id',
            params: {},
            timestamp: 1694024718139,
            sequenceId: 11
          }
        ],
        sessionOutput: 'live',
        sessionOutputPath: 'ws://example.com',
        mockOutputPath: 'ws://example.com',
        sessionHandler: mockSessionHandler,
        exportSession: jest.fn()
      }
    }
  };

  sessionManagement.testExports.setTestSessionRecording(mockSessionRecording);

  const result = sessionManagement.updateCallWithResponse("device.id", "testing_session", "device.id", userId);
  expect(result).toBeUndefined();
});

test('verify updateCallWithResponse is working for server sessionOutput', () => {
  const mockSessionHandler = {
    close: jest.fn(),
    write: jest.fn(),
    open: jest.fn()
  };

  const mockSessionRecording = {
    '12345': {
      recording: true,
      recordedSession: {
        userId: '12345',
        calls: [
          {
            methodCall: 'device.id',
            params: {},
            timestamp: 1694024718139,
            sequenceId: 11
          }
        ],
        sessionOutput: 'server',
        sessionOutputPath: 'ws://example.com',
        mockOutputPath: 'ws://example.com',
        sessionHandler: mockSessionHandler,
        exportSession: jest.fn()
      }
    }
  };

  sessionManagement.testExports.setTestSessionRecording(mockSessionRecording);

  const result = sessionManagement.updateCallWithResponse("device.id", "testing_session", "device.id", userId);
  expect(result).toBeUndefined();
});

test('verify updateCallWithResponse is working for recording Events', () => {
  const mockSessionRecording = {
    '12345': {
      recording: true,
      recordedSession: {
        userId: '12345',
        calls: [],
        sessionOutput: 'log',
        sessionOutputPath: './output/sessions',
        mockOutputPath: './output/sessions',
        sessionHandler: jest.fn(),
        exportSession: jest.fn()
      }
    }
  };
  const methodCall = 'method1';
  const eventMessage = '{"result":"NEW-DEVICE-NAME-1","id":13,"jsonrpc":"2.0"}';
  const key = 'events';
  sessionManagement.testExports.setTestSessionRecording(mockSessionRecording);

  sessionManagement.startRecording();
  sessionManagement.addCall(methodCall, eventMessage, userId);
  sessionManagement.updateCallWithResponse(methodCall, eventMessage, key, userId);
  const result = sessionManagement.testExports.getMockEventCall(userId);
  expect(result).toMatchObject([{"methodCall" : "method1", "response":{"events":"{\"result\":\"NEW-DEVICE-NAME-1\",\"id\":13,\"jsonrpc\":\"2.0\"}" } },
  ]);
  sessionManagement.stopRecording();
});

test('verify a session output directory is created when it does not exist', () => {
  const session = new sessionManagement.Session();
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
  const spy2 = jest.spyOn(fs, "mkdirSync").mockImplementation(() => {});
  const result = session.exportSession();
  expect(spy).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(result).toMatch(/(sessions)/);
  spy.mockClear();
  spy2.mockClear();
})

test('verify a session output raw wrties raw output', () => {
  const session = new sessionManagement.Session(userId);
  session.sessionOutput = 'raw';
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  const result = session.exportSession();
  expect(spy).toHaveBeenCalled();
  expect(result).toMatch(/(raw)/);
  expect(result).toMatch(/(Succesfully wrote output in raw format to .\/output\/sessions)/);
  spy.mockClear();
})

test('verify a session output mock-overrides calls conversion method', () => {
  const session = new sessionManagement.Session(userId);
  session.sessionOutput = 'mock-overrides';
  const spy = jest.spyOn(session, "convertJsonToYml").mockImplementation(() => {});
  const result = session.exportSession();
  expect(spy).toHaveBeenCalled();
  expect(result).toMatch(/(Succesfully wrote output in mock-overrides format to .\/output\/mocks)/);
  spy.mockClear();
})

test('sessionManagement.setOutputDir works properly', () => {
  const mockSessionRecording = {
    '12345': {
      recording: true,
      recordedSession: {
        userId: '12345',
        calls: [],
        sessionOutput: 'log',
        sessionOutputPath: './output/sessions/12345',
        mockOutputPath: './output/mocks/12345/1691598208828',
        sessionHandler: jest.fn(),
        exportSession: jest.fn()
      }
    }
  };

  sessionManagement.testExports.setTestSessionRecording(mockSessionRecording)
  sessionManagement.testExports.setOutputDir('./test', userId);
  
  const sessionOutputPath = sessionManagement.getSessionOutputDir(userId)
  const mockOutputPath = sessionManagement.getMockOutputDir(userId)

  expect(sessionOutputPath).toBe('./test');
  expect(mockOutputPath).toBe('./test');
})

test('sessionManagement.setOutputDir calls sessionHandler.open', () => {
  const mockSessionHandler = {
    close: jest.fn(),
    write: jest.fn(),
    open: jest.fn()
  };

  const mockSessionRecording = {
    '12345': {
      recording: true,
      recordedSession: {
        userId: '12345',
        calls: [],
        sessionOutput: 'live',
        sessionOutputPath: './output/sessions/12345',
        mockOutputPath: './output/mocks/12345/1691598208828',
        sessionHandler: mockSessionHandler,
        exportSession: jest.fn()
      }
    }
  };

  sessionManagement.testExports.setTestSessionRecording(mockSessionRecording)
  sessionManagement.testExports.setOutputDir('ws://example.com', userId);
  
  expect(mockSessionRecording['12345'].recordedSession.sessionHandler.open).toHaveBeenCalled();
})

test('sessionManagement.setOutputFormat works properly', () => {
  const mockSessionRecording = {
    '12345': {
      recording: true,
      recordedSession: {
        userId: '12345',
        calls: [],
        sessionOutput: 'log',
        sessionOutputPath: './output/sessions/12345',
        mockOutputPath: './output/mocks/12345/1691598208828',
        sessionHandler: jest.fn(),
        exportSession: jest.fn()
      }
    }
  };

  sessionManagement.testExports.setTestSessionRecording(mockSessionRecording)
  sessionManagement.setOutputFormat('test', userId);
  const format = sessionManagement.getOutputFormat(userId);
  expect(format).toBe('test');
})

test('sessionManagement.setOutputFormat throws error when no user is passed', () => {
  const spy = jest.spyOn(logger, "error");
  sessionManagement.setOutputFormat('test');
  const format = sessionManagement.getOutputFormat(userId);
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
})

test('verify check params finds repetition', () => {
  const session = new sessionManagement.Session(userId);
  const array = [
    {
      paramDetails: {
        param: {
          options: {
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    },{
      paramDetails: {
        param: {
          options: {
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }
  ]
  const object = {
    paramDetails: {
      param: {
        options: {
          environment:"prod",
          authenticationEntity:"MVPD"
        }
      },
      result: {
        adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
        adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
        adNetworkId: '519178',
        adProfileId: '12345:caf_allinone_profile',
        adSiteSectionId: 'caf_allinone_profile_section',
        adOptOut: true,
        privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
        ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
        ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
        appName: 'FutureToday',
        appBundleId: 'FutureToday.comcast',
        distributorAppId: '1001',
        deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
        coppa: 0,
        authenticationEntity: '60f72475281cfba3852413bd53e957f6'
      }
    }
  }
  const result = session.checkParams(array, object);
  expect(result).toBeTruthy;
})

test('verify check params does not find repetition', () => {
  const array = [
    {
      paramDetails: {
        param: {
          options: {
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    },{
      paramDetails: {
        param: {
          options: {
            coppa : "false",
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }
  ]
  const object = {
    paramDetails: {
      param: {
        options: {
          coppa : "true",
          environment:"prod",
          authenticationEntity:"MVPD"
        }
      },
      result: {
        adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
        adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
        adNetworkId: '519178',
        adProfileId: '12345:caf_allinone_profile',
        adSiteSectionId: 'caf_allinone_profile_section',
        adOptOut: true,
        privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
        ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
        ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
        appName: 'FutureToday',
        appBundleId: 'FutureToday.comcast',
        distributorAppId: '1001',
        deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
        coppa: 0,
        authenticationEntity: '60f72475281cfba3852413bd53e957f6'
      }
    }
  }
  const session = new sessionManagement.Session(userId);
  const result = session.checkParams(array, object);
  expect(result).toBeFalsy;
})

test('verify handleMultipleExampleMethod with multiple types of params', () => {
  const method = 'advertising.config';
  const array = [
    {
      paramDetails: {
        param: {
          anotherParam : "true",
          options: {
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }, {
      paramDetails: {
        param: {
          options: {
            coppa : "false",
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }, {
      paramDetails: {
        param: {
          options: {
            coppa : "true",
            environment:"prod",
            authenticationEntity:"MVPD"
          },
          anotherParam : true
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }, 
  ]
  const session = new sessionManagement.Session(userId);
  const result = session.handleMultipleExampleMethod(method, array);
  expect(result).toMatch('function (ctx,params){');
  expect(result).toMatch('if(JSON.stringify(params.anotherParam)  ===  \"true\" && JSON.stringify(params.options)  ===  \'{\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){');
  expect(result).toMatch('else if(JSON.stringify(params.options)  ===  \'{\"coppa\":\"false\",\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){');
  expect(result).toMatch('else if(JSON.stringify(params.options)  ===  \'{\"coppa\":\"true\",\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\' && JSON.stringify(params.anotherParam)  ===  true){');
  expect(result).toMatch("throw new ctx.FireboltError(-32888,'advertising.config is not working')");  
})

test('verify handleMultipleExampleMethod using a default param', () => {
  const method = 'advertising.config';
  const array = [
    {
      paramDetails: {
        param: {
          options: {
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }, {
      paramDetails: {
        param: {},
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }
  ]
  const session = new sessionManagement.Session(userId);
  const result = session.handleMultipleExampleMethod(method, array);
  expect(result).toMatch('function (ctx,params){');
  expect(result).toMatch('if(JSON.stringify(params.options)  ===  \'{\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){');
  expect(result).toMatch('else{');
})

test('verify handleSingleExampleMethod works for call with result object', () => {
  let staticObject = {};
  staticObject["methods"] = 'accessibility.closedCaptionsSettings';
  let obj;
  const session = new sessionManagement.Session(userId);
  const result = session.handleSingleExampleMethod(singleExampleArray, staticObject, 'accessibility.closedCaptionsSettings', obj, 0);
  expect(JSON.stringify(result)).toMatch('{\"methods\":{\"accessibility.closedCaptionsSettings\":{\"result\":{\"enabled\":true,\"styles\":{\"fontFamily\":\"Monospace sans-serif\",\"fontSize\":1,\"fontColor\":\"#ffffff\",\"fontEdge\":\"none\",\"fontEdgeColor\":\"#7F7F7F\",\"fontOpacity\":100,\"backgroundColor\":\"#000000\",\"backgroundOpacity\":100,\"textAlign\":\"center\",\"textAlignVertical\":\"middle\"}}}}}');
})

test('verify handleSingleExampleMethod works for call with error in response', () => {
  let staticObject = {};
  staticObject["methods"] = 'appcatalog.apps';
  let obj;
  const session = new sessionManagement.Session(userId);
  const result = session.handleSingleExampleMethod(singleExampleArray, staticObject, 'appcatalog.apps', obj, 1);
  expect(JSON.stringify(result)).toMatch('{\"methods\":{\"appcatalog.apps\":{\"result\":{\"error\":{\"code\":-32601,\"message\":\"Method not found\"},\"timestamp\":1663091851797}}}}');
})

test('verify handleSingleExampleMethod works for missing Response', () => {
  let staticObject = {};
  staticObject["methods"] = 'discovery.policy';
  let obj;
  const session = new sessionManagement.Session(userId);
  const result = session.handleSingleExampleMethod(singleExampleArray, staticObject, 'discovery.policy', obj, 2);
  expect(JSON.stringify(result)).toMatch('{\"methods\":{\"discovery.policy\":{}}}');
})


test('verify handleSingleExampleMethod works for false result', () => {
  let staticObject = {};
  staticObject["methods"] = 'discovery.policy';
  let obj;
  const session = new sessionManagement.Session(userId);
  const result = session.handleSingleExampleMethod(singleExampleArray, staticObject, 'discovery.policy', obj, 3);
  expect(JSON.stringify(result)).toMatch('{\"methods\":{\"discovery.policy\":{\"result\":false}}}');
})

test('verify handleSingleExampleMethod works for Cert Error', () => {
  let staticObject = {};
  staticObject["methods"] = 'authentication.token';
  let obj;
  const session = new sessionManagement.Session(userId);
  const result = session.handleSingleExampleMethod(singleExampleArray, staticObject, 'authentication.token', obj, 4);
  expect(JSON.stringify(result)).toMatch('{\"methods\":{\"authentication.token\":{\"result\":null}}}');
})

test('verify convertJsonToYml works for multiple method calls', () => {
  const session = new sessionManagement.Session(userId);
  const input = '{"sessionStart":1663165159924,"sessionEnd":1663165214534,"calls":[{"methodCall":"advertising.config","params":{"options":{"environment":"prod","authenticationEntity":"MVPD"}},"timestamp":1663165186358,"sequenceId":5,"response":{"result":{"adServerUrl":"http://demo.v.fwmrm.net/ad/p/1","adServerUrlTemplate":"http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D","adNetworkId":"519178","adProfileId":"12345:caf_allinone_profile","adSiteSectionId":"caf_allinone_profile_section","adOptOut":true,"privacyData":"ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K","ifaValue":"01234567-89AB-CDEF-GH01-23456789ABCD","ifa":"ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==","appName":"FutureToday","appBundleId":"FutureToday.comcast","distributorAppId":"1001","deviceAdAttributes":"ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=","coppa":0,"authenticationEntity":"60f72475281cfba3852413bd53e957f6"},"timestamp":1663165189721}},{"methodCall":"advertising.config","params":{"options":{"coppa":false,"environment":"prod","authenticationEntity":"MVPD"}},"timestamp":1663165187952,"sequenceId":6,"error":{"code":"CertError","message":"Received response as undefined"}},{"methodCall":"advertising.config","params":{"options":{"coppa":true,"environment":"prod","authenticationEntity":"MVPD"}},"timestamp":1663165189718,"sequenceId":7,"response":{"result":{"adServerUrl":"http://demo.v.fwmrm.net/ad/p/1","adServerUrlTemplate":"http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D","adNetworkId":"519178","adProfileId":"12345:caf_allinone_profile","adSiteSectionId":"caf_allinone_profile_section","adOptOut":true,"privacyData":"ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K","ifaValue":"01234567-89AB-CDEF-GH01-23456789ABCD","ifa":"ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==","appName":"FutureToday","appBundleId":"FutureToday.comcast","distributorAppId":"1001","deviceAdAttributes":"ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=","coppa":0,"authenticationEntity":"60f72475281cfba3852413bd53e957f6"},"timestamp":1663165189721}},{"methodCall":"advertising.config","params":{"options":{"coppa":true,"environment":"prod","authenticationEntity":"MVPD","anotherParam":true}},"timestamp":1663165189718,"sequenceId":7,"response":{"error":{"code":-32601,"message":"Method not found"},"timestamp":1663165189721}}]}';
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
  const spy2 = jest.spyOn(fs, "mkdirSync").mockImplementation(() => {});
  const spy3 = jest.spyOn(session, "checkParams").mockImplementation(() => false);
  const spy4 = jest.spyOn(session, "handleMultipleExampleMethod").mockImplementation(() => 'function (ctx,params){\n   if(JSON.stringify(params.options)  ===  \'{\"coppa\":false,\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){\n      return null; \n   }\n   else if(JSON.stringify(params.options)  ===  \'{\"coppa\":true,\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){\n      return {\"adServerUrl\":\"http://demo.v.fwmrm.net/ad/p/1\",\"adServerUrlTemplate\":\"http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D\",\"adNetworkId\":\"519178\",\"adProfileId\":\"12345:caf_allinone_profile\",\"adSiteSectionId\":\"caf_allinone_profile_section\",\"adOptOut\":true,\"privacyData\":\"ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K\",\"ifaValue\":\"01234567-89AB-CDEF-GH01-23456789ABCD\",\"ifa\":\"ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==\",\"appName\":\"FutureToday\",\"appBundleId\":\"FutureToday.comcast\",\"distributorAppId\":\"1001\",\"deviceAdAttributes\":\"ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=\",\"coppa\":0,\"authenticationEntity\":\"60f72475281cfba3852413bd53e957f6\"}; \n   }\n   else if(JSON.stringify(params.options)  ===  \'{\"coppa\":true,\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\",\"anotherParam\":true}\'){\n      return {\"error\":{\"code\":-32601,\"message\":\"Method not found\"},\"timestamp\":1663165189721}; \n   }\n   else if(JSON.stringify(params.options)  ===  \'{\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){\n      return {\"adServerUrl\":\"http://demo.v.fwmrm.net/ad/p/1\",\"adServerUrlTemplate\":\"http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D\",\"adNetworkId\":\"519178\",\"adProfileId\":\"12345:caf_allinone_profile\",\"adSiteSectionId\":\"caf_allinone_profile_section\",\"adOptOut\":true,\"privacyData\":\"ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K\",\"ifaValue\":\"01234567-89AB-CDEF-GH01-23456789ABCD\",\"ifa\":\"ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==\",\"appName\":\"FutureToday\",\"appBundleId\":\"FutureToday.comcast\",\"distributorAppId\":\"1001\",\"deviceAdAttributes\":\"ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=\",\"coppa\":0,\"authenticationEntity\":\"60f72475281cfba3852413bd53e957f6\"}; \n   }\n   throw new ctx.FireboltError(-32888,\'advertising.config is not working\')\n}');
  const spy5 = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  const result = session.convertJsonToYml(input);
  expect(spy).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(spy3).toHaveBeenCalled();
  expect(spy4).toHaveBeenCalled();
  expect(spy5).toHaveBeenCalled();
  expect(result).toBeUndefined();
  spy.mockClear();
  spy2.mockClear();
  spy3.mockClear();
  spy4.mockClear();
  spy5.mockClear();
})

test('verify convertJsonToYml handles write exception for multiple method calls', () => {
  const session = new sessionManagement.Session(userId);
  const input = '{"sessionStart":1663165159924,"sessionEnd":1663165214534,"calls":[{"methodCall":"advertising.config","params":{"options":{"coppa":false,"environment":"prod","authenticationEntity":"MVPD"}},"timestamp":1663165187952,"sequenceId":6,"error":{"code":"CertError","message":"Received response as undefined"}},{"methodCall":"advertising.config","params":{"options":{"coppa":true,"environment":"prod","authenticationEntity":"MVPD","anotherParam":true}},"timestamp":1663165189718,"sequenceId":7,"response":{"error":{"code":-32601,"message":"Method not found"},"timestamp":1663165189721}}]}';  
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
  const spy2 = jest.spyOn(fs, "mkdirSync").mockImplementation(() => {});
  const spy3 = jest.spyOn(session, "checkParams").mockImplementation(() => false);
  const spy4 = jest.spyOn(session, "handleMultipleExampleMethod").mockImplementation(() => 'function (ctx,params){\n   if(JSON.stringify(params.options)  ===  \'{\"coppa\":true,\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\",\"anotherParam\":true}\'){\n      return {\"error\":{\"code\":-32601,\"message\":\"Method not found\"},\"timestamp\":1663165189721}; \n   }\n   else if(JSON.stringify(params.options)  ===  \'{\"coppa\":false,\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){\n      return null; \n   }\n   throw new ctx.FireboltError(-32888,\'advertising.config is not working\')\n}');
  const spy5 = jest.spyOn(fs, "writeFileSync").mockImplementation(() => new error);
  const result = session.convertJsonToYml(input);
  expect(spy).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(spy3).toHaveBeenCalled();
  expect(spy4).toHaveBeenCalled();
  expect(spy5).toHaveBeenCalled();
  expect(result.message).toMatch('error is not defined');
  spy.mockClear();
  spy2.mockClear();
  spy3.mockClear();
  spy4.mockClear();
  spy5.mockClear();
})

test('verify convertJsonToYml handles only duplicate method calls', () => {
  const session = new sessionManagement.Session(userId);
  const input = '{"sessionStart":1663165159924,"sessionEnd":1663165214534,"calls":[{"methodCall":"advertising.config","params":{"options":{"coppa":true,"environment":"prod","authenticationEntity":"MVPD","anotherParam":true}},"timestamp":1663165189718,"sequenceId":7,"response":{"error":{"code":-32601,"message":"Method not found"},"timestamp":1663165189721}},{"methodCall":"advertising.config","params":{"options":{"coppa":false,"environment":"prod","authenticationEntity":"MVPD"}},"timestamp":1663165187952,"sequenceId":6,"error":{"code":"CertError","message":"Received response as undefined"}}]}';
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
  const spy2 = jest.spyOn(fs, "mkdirSync").mockImplementation(() => {});
  const spy3 = jest.spyOn(session, "checkParams").mockImplementation(() => true);
  const spy4 = jest.spyOn(session, "handleSingleExampleMethod").mockImplementation(() => '{"methods":{"advertising.config":{"result":{"error":{"code":-32601,"message":"Method not found"},"timestamp":1663165189721}}}}');
  const spy5 = jest.spyOn(fs, "writeFileSync").mockImplementation(() => new error);
  const result = session.convertJsonToYml(input);
  expect(spy).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(spy3).toHaveBeenCalled();
  expect(spy4).toHaveBeenCalled();
  expect(spy5).toHaveBeenCalled();
  expect(result.message).toMatch('error is not defined');
  spy.mockClear();
  spy2.mockClear();
  spy3.mockClear();
  spy4.mockClear();
  spy5.mockClear();
})

test('verify convertJsonToYml handles invalid inputs', () => {
  const session = new sessionManagement.Session(userId);
  const input = 'Invalid Input';
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => true);
  const result = session.convertJsonToYml(input);
  expect(spy).toHaveBeenCalled();
  expect(result.message).toMatch('Unexpected token I in JSON at position 0');
  spy.mockClear();
})

test('verify convertJsonToYml handles invalid inputs to skip', () => {
  const session = new sessionManagement.Session(userId);
  const input = '{"sessionStart":1663165159924,"sessionEnd":1663165214534,"calls":[{"methodCall":"advertising.onChanged","params":{"options":{"coppa":true,"environment":"prod","authenticationEntity":"MVPD","anotherParam":true}},"timestamp":1663165189718,"sequenceId":7,"response":{"error":{"code":-32601,"message":"Method not found"},"timestamp":1663165189721}}]}';
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => true);
  const result = session.convertJsonToYml(input);
  expect(spy).toHaveBeenCalled();
  expect(result).toBeUndefined();
  spy.mockClear();
})