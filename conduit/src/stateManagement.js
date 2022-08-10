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

import * as dom from './dom.js';

let currentSection;         // 'PAIRING', 'DASHBOARD', or 'LOG'
let currentDomId;           // btnDashboard, etc.
let isKeyForwarding;        // true (forward keys to user's app) or false (default)

// Utility Functions

function hideAllSections() {
  dom.$pairingSection.style.display = 'none';
  dom.$dashboardSection.style.display = 'none';
  dom.$logSection.style.display = 'none';
}

function showSection($elem) {
  $elem.style.display = 'block';
}

function clearActive() {
  Array.from(document.querySelectorAll('.active')).forEach((el) => el.classList.remove('active'));
}

function activateElem($elem) {
  if ( ! $elem ) { return; }
  $elem.classList.add('active');
}

function activateElemById(domId) {
  const $elem = document.getElementById(domId);
  activateElem($elem);
}

// If we're already forwarding keys, drop. Otherwise, start forwarding keys (after initial countdown)
function handleBtnKeyForwardingClick() {
  if ( isKeyForwarding ) { return; }
  turnOnKeyForwarding();
}

// External-Facing Functions

function getCurrentDomId() {
  return currentDomId;
}

function gotoNavBarButton(btnDomId, $section) {
  currentDomId = btnDomId;
  clearActive();
  const $btn = document.getElementById(btnDomId);
  activateElem($btn);
  hideAllSections();
  showSection($section);
}

function gotoDomId(domId) {
  currentDomId = domId;
  clearActive();
  const $elem = document.getElementById(domId);
  activateElem($elem);
}

function getIsKeyForwarding() {
  return isKeyForwarding;
}

function turnOffKeyForwarding() {
  isKeyForwarding = false;
}

function turnOnKeyForwarding() {
  isKeyForwarding = true;
}

// Initialization

gotoNavBarButton('btnDashboard', dom.$dashboardSection);
turnOffKeyForwarding();

// Event listeners for nav bar buttons

dom.$btnPairing.addEventListener('click', () => { gotoNavBarButton('btnPairing', dom.$pairingSection); });
dom.$btnDashboard.addEventListener('click', () => { gotoNavBarButton('btnDashboard', dom.$dashboardSection); });
dom.$btnLog.addEventListener('click', () => { gotoNavBarButton('btnLog', dom.$logSection); });

dom.$btnKeyForwarding.addEventListener('click', handleBtnKeyForwardingClick);

[ '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c' ].forEach((letter) => {
  const domId = `ipNumber${letter}`;
  document.getElementById(domId).addEventListener('click', () => {
    gotoDomId(domId);
  });
});

[ '1', '2', '3', '4' ].forEach((letter) => {
  const domId = `portNumber${letter}`;
  document.getElementById(domId).addEventListener('click', () => {
    gotoDomId(domId);
  });
});

dom.$btnConfirmPairing.addEventListener('click', () => {
  gotoDomId('btnConfirmPairing');
});


export {
  getCurrentDomId, gotoNavBarButton, gotoDomId,
  getIsKeyForwarding, turnOffKeyForwarding, turnOnKeyForwarding
}
