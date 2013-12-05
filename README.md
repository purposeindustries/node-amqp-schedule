node-amqp-schedule
==================

Install
-------

```
npm install amqp-schedule
```

Use with [postwait/node-amqp](https://github.com/postwait/node-amqp).

Usage
-----

```js
var scheduler = require('ampq-schedule');
var delayedPublish = scheduler(conn); // conn is an amqp.Connection instance

// later

delayedPublish(exchangeName, routingKey, message, delayMs, messageOptions, callback);

// or

delayedPublish(exchangeName, routingKey, message, date, messageOptions, callback);
```

Details
-------

`delayedPublish` creates a temporary queue with `ttl` and dead letter exchange. The queue expires if it's empty.

You can provide a second paramereter (`options`) to `scheduler`. `options.prefix` is the temp queue name prefix, defaults to `schedule.`.
The temp queue expires after `delay + options.threshold`, `threshold` defaults to 10 seconds.

So if you want to publish a message 1 min later in the exchange `foo` with the routing key `bar`, the message will be hold in a queue named `schedule.foo.bar.60000`.
