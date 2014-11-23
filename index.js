var maxPossibleDelay = Math.pow(2,30) - 1;

module.exports = function scheduler(conn, opt, exchange) {
    opt = opt || {};
    opt.separator = opt.separator || '.';
    opt.prefix = opt.prefix || 'schedule';
    opt.threshold = opt.threshold || 10000;
    opt.round = opt.round || 1000;

    return function publish(exchangeName, route, message, delay, options, fn) {
        if(delay instanceof Date) {
            delay = delay.getTime() - Date.now();
        }

        if (delay + opt.threshold > maxPossibleDelay) {
            delay = maxPossibleDelay - opt.threshold;
        }

        delay = Math.round(delay/opt.round)*opt.round;

        var ttl = delay,
            time = { ms: 1000, s: 60, m: 60, h: 24, d: 30, mo: 12, y: 999999 };

        delay = Object.keys(time).map(function(unit, i, keys) {
            var mod = delay%time[unit];
            delay = Math.floor(delay/time[unit]);
            return mod ? mod + unit : '';
        }).reverse().join('');

        var name = opt.prefix + opt.separator + [exchangeName, route, delay].join(opt.separator),
            queue = conn.queue(name, {
                durable: true,
                autoDelete: true,
                arguments: {
                    'x-dead-letter-exchange': exchangeName,
                    'x-dead-letter-routing-key': route,
                    'x-message-ttl': ttl,
                    'x-expires': ttl + opt.threshold
                }
            }, function() {
                var publisher = exchange ? exchange : conn;
                publisher.publish(name, message, options, fn);
            });
    };
};
