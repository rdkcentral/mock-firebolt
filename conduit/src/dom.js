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

// Nav bar DOM elements
export const $btnPairing   = document.getElementById('btnPairing');
export const $btnDashboard = document.getElementById('btnDashboard');
export const $btnLog       = document.getElementById('btnLog');

// Section DOM elements
export const $pairingSection   = document.getElementById('pairingSection');
export const $dashboardSection = document.getElementById('dashboardSection');
export const $logSection       = document.getElementById('logSection');

// Misc DOM elements
export const $btnKeyForwarding = document.getElementById('btnKeyForwarding');
export const $btnConfirmPairing = document.getElementById('btnConfirmPairing');

// Important DOM elements in dashboard-section
export const $lifecycleState = document.getElementById('lifecycleState');
export const $mostRecentKeyEvent = document.getElementById('mostRecentKeyEvent');

export const $accountId = document.getElementById('accountId');
export const $deviceId = document.getElementById('deviceId');
export const $deviceDistributor = document.getElementById('deviceDistributor');
export const $deviceModel = document.getElementById('deviceModel');
export const $devicePlatform = document.getElementById('devicePlatform');
export const $deviceSdkVersion = document.getElementById('deviceSdkVersion');
export const $deviceOsVersion = document.getElementById('deviceOsVersion');

// Important DOM elements in log-section
export const $output = document.getElementById('output');

// Helpful utility functions
export function set($elem, html) {
  if ( ! $elem ) { return; }
  $elem.innerHTML = html;
}

export function setById(domId, html) {
  const $elem = document.getElementById(domId);
  if ( ! $elem ) { return; }
  set($elem, html);
}

export function get($elem) {
  return $elem.innerHTML;
}

export function getById(domId) {
  const $elem = document.getElementById(domId);
  if ( ! $elem ) { return; }
  return get($elem);
}

export function clearClasses($elem) {
  $elem.className = '';
}

export function setClass($elem, className) {
  $elem.classList.add(className);
}
