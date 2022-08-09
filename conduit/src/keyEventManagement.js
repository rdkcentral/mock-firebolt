import * as dom from './dom.js';
import * as stateManagement from './stateManagement.js';

function handleKeyEvent(keyName, fHandleKeyEvent) {
  fHandleKeyEvent.call(null, keyName);
  if ( stateManagement.getIsKeyForwarding() ) {
    dom.$mostRecentKeyEvent.innerHTML = keyName;
  }
}

function setupKeyListener(fHandleKeyEvent) {
  document.addEventListener('keydown', function(event) {
    if ( event.which === 8 ) {
      handleKeyEvent('BACK', fHandleKeyEvent);
      event.preventDefault();
    } else if ( event.which === 13 ) {
      handleKeyEvent('OK', fHandleKeyEvent);
      event.preventDefault();
    } else if ( event.which === 39 ) {
      handleKeyEvent('RIGHT', fHandleKeyEvent);
    } else if ( event.which === 37 ) {
      handleKeyEvent('LEFT', fHandleKeyEvent);
    } else if ( event.which === 40 ) {
      handleKeyEvent('DOWN', fHandleKeyEvent);
    } else if ( event.which === 38 ) {
      handleKeyEvent('UP', fHandleKeyEvent);
    } else if ( event.which >= 48 && event.which <= 57 ) {
      handleKeyEvent(`${event.which - 48}`, fHandleKeyEvent);
    //} else {
      // Ignore all other keys
    }
  });
}

export {
  setupKeyListener
}
