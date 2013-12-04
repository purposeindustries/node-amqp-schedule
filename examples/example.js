var amqp = require('amqp');
var conn = amqp.createConnection();
var schedule = require('../index')(conn);
conn.once('ready', function() {
  conn.queue('foobar', function(q) {
    q.subscribe(function(message) { console.log(new Date(), message); });
    var ex = conn.exchange('dead');
    ex.once('open', function() {
      q.bind(ex, 'foobar');
    });
  });
  var date = new Date(Date.now()+20*1000);
  schedule('dead', 'foobar', { foobar: '10s after ' + new Date() }, 1000*10, { content_type: 'application/json' });
  schedule('dead', 'foobar', { foobar: '@ ' + date }, date, { content_type: 'application/json' });
});
