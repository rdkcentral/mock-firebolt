

function post(ctx, params) {
    const previous = process.env.state_value;
    if (previous == "unloading") {
        ctx.setTimeout(function () {
            process.env.previous_value = process.env.state_value
            process.env.state_value = "terminated"
            const result = { state: process.env.state_value, previous: process.env.previous_value };
            const msg = 'Post trigger for lifecycle.terminate sent Terminated lifecycle event';
            ctx.sendEvent('lifecycle.onTerminate', result, msg);
        }, 500);

    } 

}