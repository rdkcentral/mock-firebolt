

function post(ctx, params) {
    const previous = process.env.state_value;
    if (previous == "suspended") {
        ctx.setTimeout(function () {
            process.env.previous_value = process.env.state_value
            process.env.state_value = "inactive"
            const result = { state: process.env.state_value, previous: process.env.previous_value };
            const msg = 'Post trigger for lifecycle.unsuspend sent Unsuspended lifecycle event';
            ctx.sendEvent('lifecycle.onUnsuspend', result, msg);
        }, 500);

    } 

}