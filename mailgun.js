var Q = require('q');

module.exports = function() {
    var self = this;

    this.init = function(options) {
        self.apiKey = options.apiKey;
        self.domain = options.domain;
        
        self.mailgun = require('mailgun-js')({apiKey: self.apiKey, domain: self.domain})
    } 

    this.sendEmail = function(to, subject, content) {
        var q = Q.defer();
        var email = self.createEmailObject(to, subject, content);

        self.mailgun.messages().send(email, function(err, body) {
            if (err) q.reject(err);
            q.resolve(body);
        });

        return q.promise;
    }

    this.createEmailObject = function(_to, _subject, content) {
        return {
            from: 'Elta tracking <elta@samples.mailgun.org>',
            to: _to,
            subject: _subject,
            html: content
        }
    }

    this.init.apply(this, arguments);
}