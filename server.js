var config = require('./config');
var EltaTracking = require('./app');
var IndexController = require('./controllers/IndexController');
var AdminController = require('./controllers/AdminController');

var app = new EltaTracking(config);

app.route('/', IndexController);
app.route('/admin', AdminController);

app.listen();