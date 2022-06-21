function post(ctx, params) {
  if ( params && params.hasOwnProperty('value') ) {
    // Called as a settr
    const msg = 'Post trigger for closedcaptions.enabled sent accessibility.onClosedCaptionsSettingsChanged event';
    const ccs = ctx.get('closedCaptionsSettings');
    // Ensure that the change event contains our stashed value, so it matches what the app gets from a getter call
    ctx.sendEvent('accessibility.onClosedCaptionsSettingsChanged', ccs, msg);
    return ccs.enabled;
  } else {
    // Called as a gettr
    return undefined; // "Use whatever value you were going to use; I have no override/opinion"
  }
}
