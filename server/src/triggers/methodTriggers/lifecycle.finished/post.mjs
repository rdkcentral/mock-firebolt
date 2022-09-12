

function post(ctx, params) {
    const previous = process.env.state_value;
    if (previous == "unloading") {
        ctx.setTimeout(function () {
            process.env.previous_value = process.env.state_value
            process.env.state_value = "finished"
            const result = { state: process.env.state_value, previous: process.env.previous_value };
            const msg = 'Post trigger for lifecycle.finished sent Finished lifecycle event';
            ctx.sendEvent('lifecycle.onFinished', result, msg);
        }, 500);

    } 

}