var express = require('express');
var Mailgun = require('./mailgun');
var Elta = require('./elta');
var _ = require('underscore');
var swig = require('swig');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

module.exports = function EltaTracking() {
    var self = this;

    this.init = function(config) {
        self.app = express();
        self.swig = swig;
        self.port = config.port || 8888;
        self.host = config.host || '0.0.0.0';
        self.mailgun = new Mailgun(config.mailgun);
        self.elta = new Elta();
        self.trackingCodes = {};
        self.maxTrackingCodes = config.maxTrackingCodes || 2;
        self.interval = setInterval(self.runCheck, 5 * 60 * 1000); // 5 minutes
        self.emailTemplate = '';

        self.initExpress();
        self.initSwig();
    }

    this.initExpress = function() {
        self.app.use(bodyParser());
        self.app.use(cookieParser());
        self.app.use('/static', express.static('static'));
    }

    this.initSwig = function() {
        self.app.engine('html', self.swig.renderFile);
        self.app.set('view engine', 'html');
        self.app.set('views', __dirname + '/templates');
        self.app.set('view cache', false);

        self.swig.setDefaults({ cache: false });

        self.emailTemplate = self.swig.compileFile(__dirname + '/templates/email.html');
    }

    this.route = function(endpoint, controller) {
        var inst = new controller(self);

        self.app.get(endpoint, inst.get);
        self.app.post(endpoint, inst.post);
    }

    this.listen = function() {
        self.app.listen(self.port, self.host);
        console.log('i am listening');
    }

    this.runCheck = function() {
        console.log('checking');
        var now = Date.now();

        _.each(self.trackingCodes, function(props, trackingCode) {

            if (props.latestCheck == null || (now - props.latestCheck) >= props.interval) {
                props.latestCheck = now;

                self.elta.getStatus(trackingCode)
                    .then(function(data) {
                        var checksum = self.makeChecksum(data);

                        if (checksum == props.checksum)
                            return;

                        props.checksum = checksum;
                        self.sendEmail(trackingCode, props, data);
                    })
                    .fail(function(err) {
                        console.log('failed to fetch... #' + trackingCode);
                        console.log(err);
                    });
            }
        });
    }

    this.makeChecksum = function(data) {
        var len = data.length;
        var last = _.clone(data).pop();
        var hash = len + last.status + last.date + last.time;

        return hash;
    }

    this.sendEmail = function(_trackingCode, _props, _statuses) {
        var to = _props.email;
        var subject = 'Ενημέρωση κατάστασης αποστολής';
        
        if (_props.label) 
            subject += ' - ' + _props.label;
        else
            subject += ' - #' + _trackingCode;
        
        var content = self.emailTemplate({
            trackingCode: _trackingCode,
            props: _props,
            statuses: _statuses
        });

        self.mailgun.sendEmail(to, subject, content)
            .then(function(body) {
                console.log('email sent to ' + to);
            })
            .fail(function(err) {
                console.log('failed to send email to ' + to);
            });
    }

    this.track = function(trackingCode, email, label) {
        if (_.size(self.trackingCodes) >= self.maxTrackingCodes)
            return false;

        if (_.has(self.maxTrackingCodes, trackingCode))
            return false;

        var item = self.createTrackingObject(trackingCode, email, label);
        self.trackingCodes[trackingCode] = item;

        return true;
    }

    this.createTrackingObject = function(_trackingCode, _email, _label) {
        return {
            trackingCode: _trackingCode,
            email: _email,
            label: _label,
            created: Date.now(),
            latestCheck: null,
            checksum: null,
            interval: 20 * 60 * 1000 // 20 minutes
        }
    }

    this.init.apply(this, arguments);
}