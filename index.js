module.exports = function scheduler(conn, opt) {
  opt = opt || {};
  opt.separator = opt.separator || '.';
  opt.prefix = opt.prefix || 'schedule';
  opt.threshold = opt.threshold || 10000;
  return function publish(exchange, route, message, delay, options, fn) {
    if(delay instanceof Date) {
      delay = delay.getTime() - Date.now();
    }
    var name = opt.prefix + opt.separator + [exchange, route, delay].join(opt.separator);
    var queue = conn.queue(name, {
      durable: true,
      autoDelete: true,
      arguments: {
        'x-dead-letter-exchange': exchange,
        'x-dead-letter-routing-key': route,
        'x-message-ttl': delay,
        'x-expires': delay + opt.threshold
      }
    }, function() {
      conn.publish(name, message, options, fn);
    });
  };
};
