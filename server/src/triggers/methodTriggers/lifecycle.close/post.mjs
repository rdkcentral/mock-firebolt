

function post(ctx, params) {
  const previous = process.env.state_value;
  if ( previous == "foreground" ) {
    ctx.setTimeout(function() {
      process.env.previous_value = process.env.state_value
      process.env.state_value = "inactive"
      const result = { state: process.env.state_value, previous: process.env.previous_value };
      const msg = 'Post trigger for lifecycle.close sent inactive lifecycle event';
      ctx.sendEvent('lifecycle.onInactive', result, msg);
      }, 500);
  
  }else if ( previous == "background" ){
    ctx.setTimeout(function() {
      process.env.previous_value = process.env.state_value
      process.env.state_value = "inactive"
      const result = { state: process.env.state_value, previous: process.env.previous_value };
      const msg = 'Post trigger for lifecycle.close sent inactive lifecycle event';
      ctx.sendEvent('lifecycle.onInactive', result, msg);
    }, 500);

  }


}
