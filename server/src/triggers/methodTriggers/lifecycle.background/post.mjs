
function post(ctx, params) {
    const previous = process.env.state_value;
    if (previous == "foreground") {
        ctx.setTimeout(function () {
            process.env.previous_value = process.env.state_value
            process.env.state_value = "background"
            const result = { state: process.env.state_value, previous: process.env.previous_value };
            const msg = 'Post trigger for lifecycle.background sent Background lifecycle event';
            ctx.sendEvent('lifecycle.onBackground', result, msg);
        }, 500);

    } else if (previous == "inactive") {
        ctx.setTimeout(function () {
            process.env.previous_value = process.env.state_value
            process.env.state_value = "background"
            const result = { state: process.env.state_value, previous: process.env.previous_value };
            const msg = 'Post trigger for lifecycle.background sent Background lifecycle event';
            ctx.sendEvent('lifecycle.onBackground', result, msg);
        }, 500);

    }

}