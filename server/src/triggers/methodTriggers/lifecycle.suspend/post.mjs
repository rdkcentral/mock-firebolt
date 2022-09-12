

function post(ctx, params) {
    const previous = process.env.state_value;
    if (previous == "inactive") {
        ctx.setTimeout(function () {
            process.env.previous_value = process.env.state_value
            process.env.state_value = "suspended"
            const result = { state: process.env.state_value, previous: process.env.previous_value };
            const msg = 'Post trigger for lifecycle.suspend sent Suspended lifecycle event';
            ctx.sendEvent('lifecycle.onSuspend', result, msg);
        }, 500);

    } 

}