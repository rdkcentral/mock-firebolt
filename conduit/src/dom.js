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
