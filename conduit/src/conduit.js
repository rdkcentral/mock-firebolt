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

import * as fireboltCoreSdk from '@firebolt-js/sdk';
const Account = fireboltCoreSdk.Account;
const Device = fireboltCoreSdk.Device;
const Lifecycle = fireboltCoreSdk.Lifecycle;
import fireboltCoreSdkMeta from '@firebolt-js/sdk/dist/firebolt-open-rpc.json';
import * as dom from './dom.js';
import * as keyEventManagement from './keyEventManagement.js';
import * as stateManagement from './stateManagement.js';

let socketUrl;
let socket;
let userId;

// ----------------------------------------------------------------------

function _appendMessage(msgType, msg) {
  const element = document.createElement('p');
  if ( msgType === 'ERROR' ) {
    element.className = 'error';
  }
  element.innerHTML = msg;
  dom.$output.appendChild(element);
  dom.$output.scrollTop = dom.$output.scrollHeight;
}

function appendMessage(msg) {
  _appendMessage('INFO', msg);
}

function appendErrorMessage(msg) {
  _appendMessage('ERROR', msg);
}

function sendFireboltResponseMessage(originalRequestId, response, userId) {
  const oConduitReplyMsg = {
    from: 'conduit',
    type: 'FIREBOLT-RESPONSE',
    userId: userId,
    data: {
      openRpcMsg: {
        jsonrpc: '2.0',
        id: originalRequestId,
        ...response
      }
    }
  };
  appendMessage('Sending Firebolt response message back to Mock Firebolt');
  appendMessage(JSON.stringify(oConduitReplyMsg));
  const conduitReplyMsg = JSON.stringify(oConduitReplyMsg);
  socket.send(conduitReplyMsg);
}

const keymap = {
  'btnPairing'  :           { LEFT: null,           RIGHT: 'btnDashboard',           UP: null,           DOWN: 'ipNumber1'        },
  'btnDashboard':           { LEFT: 'btnPairing',   RIGHT: 'btnLog',                 UP: null,           DOWN: 'sections'         },
  'btnLog':                 { LEFT: 'btnDashboard', RIGHT: 'btnKeyForwarding',       UP: null,           DOWN: 'sections'         },
  'btnKeyForwarding':       { LEFT: 'btnLog',       RIGHT: null,                     UP: null,           DOWN: 'sections'         },
  'sections':               { LEFT: null,           RIGHT: null,                     UP: 'btnDashboard', DOWN: null               },
  'ipNumber1':              { LEFT: null,           RIGHT: 'ipNumber2',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumber2':              { LEFT: 'ipNumber1',    RIGHT: 'ipNumber3',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumber3':              { LEFT: 'ipNumber2',    RIGHT: 'ipNumber4',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumber4':              { LEFT: 'ipNumber3',    RIGHT: 'ipNumber5',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumber5':              { LEFT: 'ipNumber4',    RIGHT: 'ipNumber6',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumber6':              { LEFT: 'ipNumber5',    RIGHT: 'ipNumber7',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumber7':              { LEFT: 'ipNumber6',    RIGHT: 'ipNumber8',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumber8':              { LEFT: 'ipNumber7',    RIGHT: 'ipNumber9',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumber9':              { LEFT: 'ipNumber8',    RIGHT: 'ipNumbera',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumbera':              { LEFT: 'ipNumber9',    RIGHT: 'ipNumberb',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumberb':              { LEFT: 'ipNumbera',    RIGHT: 'ipNumberc',              UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'ipNumberc':              { LEFT: 'ipNumberb',    RIGHT: 'portNumber1',            UP: 'btnPairing',   DOWN: 'portNumber1'      },
  'portNumber1':            { LEFT: 'ipNumberc',    RIGHT: 'portNumber2',            UP: 'ipNumber1',    DOWN: 'btnConfirmPairing'},
  'portNumber2':            { LEFT: 'portNumber1',  RIGHT: 'portNumber3',            UP: 'ipNumber1',    DOWN: 'btnConfirmPairing'},
  'portNumber3':            { LEFT: 'portNumber2',  RIGHT: 'portNumber4',            UP: 'ipNumber1',    DOWN: 'btnConfirmPairing'},
  'portNumber4':            { LEFT: 'portNumber3',  RIGHT: 'btnConfirmPairing',      UP: 'ipNumber1',    DOWN: 'btnConfirmPairing'},
  'btnConfirmPairing':      { LEFT: 'portNumber4',  RIGHT: null,                     UP: 'btnLog',       DOWN: null               },
};

const updownmap = {
  'UP': {
    '0': '1',   '1': '2',   '2': '3',   '3': '4',   '4': '5',
    '5': '6',   '6': '7',   '7': '8',   '8': '9',   '9': '0'
  },
  'DOWN': {
    '0': '9',   '1': '0',   '2': '1',   '3': '2',   '4': '3',
    '5': '4',   '6': '5',   '7': '6',   '8': '7',   '9': '8'
  }
};

function getNextPairingDomId(currentDomId) {
  const base16 = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c' ];
  if ( currentDomId.startsWith('ipNumber') ) {
    const curr = currentDomId.substr(-1);
    if ( base16.indexOf(curr) === base16.length - 1 ) {
      return 'portNumber1';
    } else {
      const next = base16[base16.indexOf(curr) + 1];
      return `ipNumber${next}`
    }
  } else if ( currentDomId.startsWith('portNumber') ) {
    const curr = currentDomId.substr(-1);
    if ( base16.indexOf(curr) === 3 ) {
      return 'btnConfirmPairing';
    } else {
      const next = base16[base16.indexOf(curr) + 1];
      return `portNumber${next}`
    }
  }
}

const COUNTDOWN_TO_ON_SECONDS          = 3;
const COUNTDOWN_TO_OFF_SECONDS         = 5;
const COUNTDOWN_TO_OFF_WARNING_SECONDS = 3;

let countdownToOn;          // 3,2,1,0 before key forwarding is turned on
let countdownToOff;         // 3,2,1,0 before key forwarding is turned off
let countdownToOnInterval;
let countdownToOffInterval;

function updateBtnKeyForwarding(val, className) {
  dom.set(dom.$btnKeyForwarding, `${val}`);
  dom.clearClasses(dom.$btnKeyForwarding);
  if ( className ) {
    dom.setClass(dom.$btnKeyForwarding, className);
  }
}

function startKeyForwardingStartingCountdown() {
  countdownToOn = COUNTDOWN_TO_ON_SECONDS;
  updateBtnKeyForwarding(`${countdownToOn}s`, 'countdownToOn');

  function handleCountdownToOnTick() {
    countdownToOn = countdownToOn - 1;
    if ( countdownToOn > 0 ) {
      updateBtnKeyForwarding(`${countdownToOn}s`, 'countdownToOn');
    } else {
      clearInterval(countdownToOnInterval);
      stateManagement.turnOnKeyForwarding();
      updateBtnKeyForwarding('ON', null);
    }
  }

  countdownToOnInterval = setInterval(handleCountdownToOnTick, 1000);
}

function startKeyForwardingEndingCountdown() {
  countdownToOff = COUNTDOWN_TO_OFF_SECONDS;
  if ( countdownToOff <= COUNTDOWN_TO_OFF_WARNING_SECONDS ) {
    updateBtnKeyForwarding(`${countdownToOff}s`, 'countdownToOff');
  }

  function handleCountdownToOffTick() {
    countdownToOff = countdownToOff - 1;
    if ( countdownToOff > 0 ) {
      if ( countdownToOff <= COUNTDOWN_TO_OFF_WARNING_SECONDS ) {
        updateBtnKeyForwarding(`${countdownToOff}s`, 'countdownToOff');
      } else {
        updateBtnKeyForwarding('ON', null);
      }
    } else {
      clearInterval(countdownToOffInterval);
      stateManagement.turnOffKeyForwarding();
      updateBtnKeyForwarding('OFF', null);
    }
  }

  countdownToOffInterval = setInterval(handleCountdownToOffTick, 1000);
}

function resetKeyForwardingEndingCountdown() {
  if ( countdownToOffInterval ) { clearInterval(countdownToOffInterval); }
  startKeyForwardingEndingCountdown();
}

keyEventManagement.setupKeyListener((key) => {
  // Forward the key to the app, if key forwarding is on
  const isKeyForwarding = stateManagement.getIsKeyForwarding();

  if ( isKeyForwarding ) {
    // Reset countdownToOffInterval
    resetKeyForwardingEndingCountdown();

    // Log that the key was pressed
    appendMessage(`${key} pressed and was sent to your app`);

    // Forward the key press
    const oConduitMsg = {
      from: 'conduit',
      type: 'KEYPRESS-FORWARD',
      userId: userId,
      data: {
        key: key
      }
    };
    const conduitMsg = JSON.stringify(oConduitMsg);
    try {
      appendMessage('Forwarding keypress message to Mock Firebolt...');
      socket.send(conduitMsg);
      appendMessage('Successfully forwarded keypress message to Mock Firebolt');
      appendMessage(conduitMsg);
    } catch ( ex ) {
      appendErrorMessage(`KEYPRESS-FORWARD-ERROR: ${ex.message}`);
    }

    return; // Don't handle the key here in this app if we're forwarding; gets too confusing!
  }

  // Handle the key
  const currentDomId = stateManagement.getCurrentDomId();

  if ( [ 'UP', 'DOWN' ].includes(key) &&
       ( currentDomId.startsWith('ipNumber') || currentDomId.startsWith('portNumber') ) ) {
    const curr = dom.getById(currentDomId);
    const next = updownmap[key][curr];
    dom.setById(currentDomId, next);

  } else if ( [ 'LEFT', 'RIGHT', 'BACK'].includes(key) && currentDomId === 'sections' ) {
    if ( key === 'LEFT' ) {
      dom.$output.scrollTop = Math.max(dom.$output.scrollTop - 100, 0);
    } else if ( key === 'RIGHT' ) {
      dom.$output.scrollTop = Math.min(dom.$output.scrollTop + 100, dom.$output.scrollHeight);
    } else {
      dom.$output.innerHTML = '';
    }

  } else if ( [ 'UP', 'DOWN', 'LEFT', 'RIGHT' ].includes(key) ) {
    if ( ! keymap[currentDomId] ) {
      return;
    }
    const map = keymap[currentDomId];
    if ( ! map[key] ) {
      return;
    }
    const nextDomId = map[key];
    if ( nextDomId === 'btnPairing' ) {
      stateManagement.gotoNavBarButton(nextDomId, dom.$pairingSection);
    } else if ( nextDomId === 'btnDashboard' ) {
      stateManagement.gotoNavBarButton(nextDomId, dom.$dashboardSection);
    } else if ( nextDomId === 'btnLog' ) {
      stateManagement.gotoNavBarButton(nextDomId, dom.$logSection);
    } else {
      stateManagement.gotoDomId(nextDomId);
    }

  } else if ( key === 'OK' ) {
    if ( currentDomId === 'btnKeyForwarding' ) {
      startKeyForwardingStartingCountdown();
    } else if ( currentDomId === 'btnConfirmPairing' ) {
      // Construct new socket URL from our UX components
      const newSocketUrl =
        (window.location.hostname === 'localhost' ? 'ws' : 'wss') + '://' +
        document.getElementById('ipNumber1').innerText +
        document.getElementById('ipNumber2').innerText +
        document.getElementById('ipNumber3').innerText +
        '.' +
        document.getElementById('ipNumber4').innerText +
        document.getElementById('ipNumber5').innerText +
        document.getElementById('ipNumber6').innerText +
        '.' +
        document.getElementById('ipNumber7').innerText +
        document.getElementById('ipNumber8').innerText +
        document.getElementById('ipNumber9').innerText +
        '.' +
        document.getElementById('ipNumbera').innerText +
        document.getElementById('ipNumberb').innerText +
        document.getElementById('ipNumberc').innerText +
        ':' +
        document.getElementById('portNumber1').innerText +
        document.getElementById('portNumber2').innerText +
        document.getElementById('portNumber3').innerText +
        document.getElementById('portNumber4').innerText;

        // (Re-)run the app with the user-specified socket URL
        runApp(newSocketUrl);
    // } else {
      // Ignore key
    }

  } else if ( key === 'BACK' ) {
    // Not used within Conduit app

  } else if ( key >= '0' && key <= '9' ) {
    if ( currentDomId.startsWith('ipNumber') || currentDomId.startsWith('portNumber') ) {
      dom.setById(currentDomId, key);
      stateManagement.gotoDomId(getNextPairingDomId(currentDomId));
    }
  // } else {
    // Ignore key
  }
});

// ----------------------------------------------------------------------

function registerLifecycleCallbacks() {
  appendMessage('Setting up listeners for Firebolt lifecycle events...');
  let errorCount = 0;
  Lifecycle.listen((event, value) => {
    appendMessage(`Lifecycle.listen fired: event: ${event}, value: ${JSON.stringify(value)}`);

    if (value.state) {
      appendMessage(`Lifecycle state moving from ${value.previous} to ${value.state}`);
      dom.set(dom.$lifecycleState, value.state);
      dom.clearClasses(dom.$lifecycleState);
      if ( [ 'inactive', 'background', 'foreground' ].includes(value.state) ) { 
        dom.setClass(dom.$lifecycleState, `lifecycleState_${value.state}`);
      } else {
        dom.setClass(dom.$lifecycleState, 'lifecycleState_boot');
      }
    }

    // Forward event
    const oConduitMsg = {
      from: 'conduit',
      type: 'FIREBOLT-LIFECYCLE-EVENT-FORWARD',
      userId: userId,
      data: {
        moduleName: 'lifecycle',
        eventName: event,
        value: value
      }
    };
    const conduitMsg = JSON.stringify(oConduitMsg);
    try {
      appendMessage('Forwarding Firebolt lifecycle message to Mock Firebolt...');
      socket.send(conduitMsg);
      appendMessage('Successfully forwarded Firebolt lifecycle message to Mock Firebolt');
      appendMessage(conduitMsg);
    } catch ( ex ) {
      appendErrorMessage(`FIREBOLT-LIFECYCLE-EVENT-FORWARD-ERROR: ${ex.message}`);
      errorCount += 1;
    }
  });
  if ( errorCount === 0 ) {
    appendMessage('Successfully set up listeners for Firebolt lifecycle events');
  } else {
    appendErrorMessage(`Set up listeners for Firebolt lifecycle events', but ${errorCount} errors occurred`);
  }
}

// ----------------------------------------------------------------------

Account.id()
.then(id => {
  dom.set(dom.$accountId, id);
})
.catch(err => {
  dom.set(dom.$accountId, `ERROR: ${err.code}: ${err.message}`);
});

Device.id()
.then(id => {
  dom.set(dom.$deviceId, id);
})
.catch(err => {
  dom.set(dom.$deviceId, `ERROR: ${err.code}: ${err.message}`);
});

Device.distributor()
.then(distributor => {
  dom.set(dom.$deviceDistributor, distributor);
})
.catch(err => {
  dom.set(dom.$deviceDistributor, `ERROR: ${err.code}: ${err.message}`);
});

Device.model()
.then(model => {
  dom.set(dom.$deviceModel, model);
})
.catch(err => {
  dom.set(dom.$deviceModel, `ERROR: ${err.code}: ${err.message}`);
});

Device.platform()
.then(platform => {
  dom.set(dom.$devicePlatform, platform);
})
.catch(err => {
  dom.set(dom.$devicePlatform, `ERROR: ${err.code}: ${err.message}`);
});

Device.version()
.then(version => {
  const sSdk = `${version.sdk.major}.${version.sdk.minor}.${version.sdk.patch} (${version.sdk.readable})`; 
  const sOs  = `${version.os.major}.${version.os.minor}.${version.os.patch} (${version.os.readable})`; 
  dom.set(dom.$deviceSdkVersion, sSdk);
  dom.set(dom.$deviceOsVersion, sOs);
})
.catch(err => {
  dom.set(dom.$deviceSdkVersion, `ERROR: ${err.code}: ${err.message}`);
  dom.set(dom.$deviceOsVersion, `ERROR: ${err.code}: ${err.message}`);
});

// ----------------------------------------------------------------------

function uc1(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

function getModuleName(oMethod) {
  const pieces = oMethod.name.split('.');
  return pieces[0];
}

// 'lifecycle' -> 'Lifecycle', but 'secondscreen' -> 'SecondScreen' (note the second capital 'S')
function getSdkModuleName(oMethod) {
  const pieces = oMethod.name.split('.');
  let sdkModuleName = uc1(pieces[0]); // foo -> Foo
  // @HACK: Workaround due to second capital 'S'
  if ( sdkModuleName.toLowerCase() === 'secondscreen' ) {
    sdkModuleName = 'SecondScreen';
  }
  return sdkModuleName;
}

function getEventName(oMethod) {
  // 'onForeground' -> 'foreground'
  function lc1(s) {
    return s && s[0].toLowerCase() + s.slice(1);
  }
  const pieces = oMethod.name.split('.');
  const eventName = lc1(pieces[1].substr(2)); // 'onForeground' -> 'foreground'
  return eventName;
}

function showWelcomeMessage() {
    appendMessage('Welcome to the Conduit app');
}

function ensureMockFireboltConduitWebsocketUrl(pSocketUrl) {
  if ( pSocketUrl ) {
    socketUrl = pSocketUrl;
  } else {
    const queryParams = new window.URLSearchParams(document.location.search);
    socketUrl = queryParams.get('mfc');
    if ( ! socketUrl ) {
      appendErrorMessage('Missing Mock Firebolt Conduit Web Socket URL');
      throw new Error(`MISSING-MFC-URL-PARAMETER`);
    }
  }
  appendMessage(`Using Mock Firebolt Conduit Web Socket URL: ${socketUrl}`);
}

function getUserId() {
  const queryParams = new window.URLSearchParams(document.location.search);
  userId = queryParams.get('userId'); // Mock Firebolt will handle undefined/null/falsy value
}

function createWebsocket() {
  try {
    socket = new WebSocket(socketUrl);
    appendMessage(`Created web socket to communicate with Mock Firebolt Conduit Web Socket URL ${socketUrl}`);
  } catch ( ex ) {
    appendErrorMessage(`Could not connect to Mock Firebolt Conduit Web Socket URL: ${socketUrl}`);
    appendErrorMessage(ex.message);
    throw new Error('COULD-NOT-CONNECT-TO-SOCKET');
  }
}

// If timer goes off, we didn't get a ping from the server, so terminate the socket
function heartbeat(socket) {
  if ( socket.pingTimeout ) { clearTimeout(socket.pingTimeout); }

  // Use `WebSocket#terminate()`, which immediately destroys the connection,
  // instead of `WebSocket#close()`, which waits for the close timer.
  // Delay should be equal to the interval at which your server
  // sends out pings plus a conservative assumption of the latency.
  socket.pingTimeout = setTimeout(() => {
    socket.terminate();
  }, 30000 + 1000);
}

function performInitialHandshake() {
  appendMessage('Sending initial handshake message to Mock Firebolt Conduit Socket URL');
  const oConduitMsg = {
    from: 'conduit',
    type: 'INITIAL-HANDSHAKE',
    userId: userId,
    data: undefined
  };
  const conduitMsg = JSON.stringify(oConduitMsg);
  socket.send(conduitMsg);
}

function handleMessage(oConduitMsg, socket) {
  if ( oConduitMsg.from !== 'mock-firebolt' ) {
    appendErrorMessage('Received a message that was not from Mock Firebolt... dropping');
    appendErrorMessage(JSON.stringify(oConduitMsg, null, 4));
    return;
  }

  if ( oConduitMsg.type === 'PING-FROM-SERVER' ) {
    //appendMessage('Received a ping message from Mock Firebolt');
    const oConduitMsg = {
      from: 'conduit',
      type: 'PONG-FROM-CLIENT',
      userId: userId,
      data: undefined
    };
    const conduitMsg = JSON.stringify(oConduitMsg);
    socket.send(conduitMsg);
    //appendMessage('Sent a pong message to Mock Firebolt');
    heartbeat(socket);

  } else if ( oConduitMsg.type === 'FIREBOLT-CALL-FROM-SERVER' ) {
    let response, oConduitReplyMsg;

    appendMessage('Received a Firebolt call message from Mock Firebolt');
    appendMessage(`${JSON.stringify(oConduitMsg)}`);

    const openRpcMethodName = oConduitMsg.data.openRpcMsg.method;
    const [ openRpcPackageName, openRpcFunctionName ] = openRpcMethodName.split('.');
    const sdkPackageName = uc1(openRpcPackageName);
    const sdkFunctionName = openRpcFunctionName;
    const sdkFcn = fireboltCoreSdk[sdkPackageName][openRpcFunctionName];
    const args = oConduitMsg.data.openRpcMsg.args;

    if ( ! sdkFcn ) {
      const oMethod = fireboltCoreSdkMeta.methods.find((oMethod) => { return (oMethod.name === openRpcMethodName); });
      if ( oMethod && oMethod.tags && oMethod.tags.find((oTag) => { return (oTag.name === 'rpc-only'); }) ) {
        // The OpenRPC metadata for this method has a tag with the name "rpc-only"; not intented to have an SDK method... ignore
        appendMessage('Ignoring Firebolt call message because the method is marked rpc-only');
      } else {
        appendErrorMessage(`INTERNAL ERROR: Could not find SDK function:`);
        appendErrorMessage(`....openRpcMethodName: ${openRpcMethodName}`);
        appendErrorMessage(`....sdkPackageName: ${sdkPackageName}`);
        appendErrorMessage(`....sdkFunctionName: ${sdkFunctionName}`);
      }
    } else {
      if ( ! args ) {
        sdkFcn.call(null)
          .then(val => { response = { result: val }; })
          .catch(err => { response = { error: { code: err.code, message: err.message } }; })
          .finally(() => {
            sendFireboltResponseMessage(oConduitMsg.data.openRpcMsg.id, response, userId);
          })
      } else {
        sdkFcn.call(null, args)
          .then(val => { response = { result: val }; })
          .catch(err => { response = { error: { code: err.code, message: err.message } }; })
          .finally(() => {
            sendFireboltResponseMessage(oConduitMsg.data.openRpcMsg.id, response, userId);
          })
      }
    }

  } else if ( oConduitMsg.type === 'INITIAL-HANDSHAKE-ACK' ) {
    appendMessage('Received a handshake ack from Mock Firebolt');
    heartbeat(socket);
    registerLifecycleCallbacks();
    appendMessage('Calling Lifecycle.ready...');
    Lifecycle.ready();
    appendMessage('Successfully called Lifecycle.ready');
    subscribeToAllFireboltEvents();

  } else {
    appendErrorMessage('Received an unknown type of message... dropping');
    appendErrorMessage(JSON.stringify(oConduitMsg, null, 4));
  }
}

function addWebsocketEventListeners() {
  socket.addEventListener('open', function (event) {
    appendMessage('Mock Firebolt Conduit Web Socket open event received');
    performInitialHandshake();
  });

  socket.addEventListener('close', function (event) {
    appendMessage('Mock Firebolt Conduit Web Socket close event received');
    clearTimeout(socket.pingTimeout);
  });

  socket.addEventListener('message', function (event) {
    const oConduitMsg = JSON.parse(event.data); // JSON String -> Object
    // appendMessage('Received a message event:');
    // appendMessage(JSON.stringify(oConduitMsg, null, 4));
    handleMessage(oConduitMsg, socket);
  });

  socket.addEventListener('error', function (event) {
    appendErrorMessage('Mock Firebolt Conduit Web Socket error event received');
    appendErrorMessage(`Socket error: ${JSON.stringify(event)}`);
  });
}

// Generic listener for any/all xxx.onXxxx methods *EXCEPT* lifecycle.onXxx
function fireboltEventListener(moduleName, eventName, value) {
  // Work around bug where events fire with undefined value values; shouldn't happen
  if ( ! value ) { return; }

  const sValue = ( value ? JSON.stringify(value) : '*falsy*');
  appendMessage(`Received a Firebolt message from device. event: ${eventName}, value: ${sValue}`);

  // Forward event
  const oConduitMsg = {
    from: 'conduit',
    type: 'FIREBOLT-EVENT-FORWARD',
    userId: userId,
    data: {
      moduleName: moduleName,
      eventName: eventName,
      value: value
    }
  };
  const conduitMsg = JSON.stringify(oConduitMsg);
  try {
    socket.send(conduitMsg);
    appendMessage('Forwarded Firebolt message to Mock Firebolt');
    appendMessage(conduitMsg);
  } catch ( ex ) {
    appendErrorMessage(`FIREBOLT-EVENT-FORWARD-ERROR: ${ex.message}`);
  }
}

function subscribeToAllFireboltEvents() {
  // Find methods which are of the form <module>.on<event>
  const eventMethods = fireboltCoreSdkMeta.methods.filter((oMethod) => { return (oMethod.name.indexOf('\.on') !== -1); });

  appendMessage('Subscribing to Firebolt non-lifecycle events...');
  let errorCount = 0;
  eventMethods.forEach((oMethod) => {
    try {
      const pieces = oMethod.name.split('.');
      const openRpcModuleName = pieces[0];
      if ( openRpcModuleName !== 'lifecycle' ) { 
        /* @TODO: Use OpenRPC message directly vs. using the SDK calls (not sure if code below would really work)
        const pieces = oMethod.name.split('.');
        const moduleName = pieces[0];
        const functionName = pieces[1]; 
        appendMessage(`Subscribing to ${oMethod.name} events using Transport.send('${moduleName}', '${functionName}', { listen: true })...`);
        fireboltCoreSdk.Transport.send(pieces[0], pieces[1], { listen: true });
        */

        const moduleName = getModuleName(oMethod);
        const sdkModuleName = getSdkModuleName(oMethod);
        const eventName = getEventName(oMethod); 
        appendMessage(`Subscribing to ${oMethod.name} events using ${sdkModuleName}.listen('${eventName}')...`);
        fireboltCoreSdk[sdkModuleName].listen(eventName, function(value) {
          fireboltEventListener(moduleName, eventName, value);
        });

        appendMessage(`Successfully subscribed to ${oMethod.name} events`);
      }
    } catch ( ex ) {
      appendErrorMessage(`Error attempting to subscribe to ${oMethod.name} events:`);
      appendErrorMessage(JSON.stringify(ex, Object.getOwnPropertyNames(ex)));
      errorCount += 1;
    }
  });
  if ( errorCount === 0 ) {
    appendMessage('Successfully subscribed to Firebolt non-lifecycle events');
  } else {
    appendErrorMessage(`Subscribed to Firebolt non-lifecycle events, but ${errorCount} errors occurred`);
  }
}

// ----------------------------------------------------------------------

function runApp(wsAddress) {
  showWelcomeMessage();
  ensureMockFireboltConduitWebsocketUrl(wsAddress);
  getUserId();
  createWebsocket();
  addWebsocketEventListeners();
}

// ----------------------------------------------------------------------

export {
  runApp
};
