
function post(ctx, params) {

  ctx.setTimeout(function() {
    process.env.previous_value = process.env.state_value
    process.env.state_value = "inactive"
    const result = { state: process.env.state_value, previous: process.env.previous_value };
    const msg = 'Post trigger for lifecycle.ready sent inactive lifecycle event';
    ctx.sendEvent('lifecycle.onInactive', result, msg);
  }, 500);

  ctx.setTimeout(function() {
    process.env.previous_value = process.env.state_value
    process.env.state_value = "foreground"
    const result = { state: process.env.state_value, previous: process.env.previous_value };
    const msg = 'Post trigger for lifecycle.ready sent foreground lifecycle event';
    ctx.sendEvent('lifecycle.onForeground', result, msg);
  }, 1000);
}
