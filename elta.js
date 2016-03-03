var Q = require('q');
var request = require('request');

module.exports = function() {
    var self = this;

    this.init = function() {
        self.url = 'http://www.elta-courier.gr/track.php';
    } 

    this.getStatus = function(trackingCode) {
        var q = Q.defer();
        
        this.makeTrackingRequest(trackingCode, function(err, data) {
            if (err)
                return q.reject(err);
            
            q.resolve(data);
        });

        return q.promise;
    }

    this.makeTrackingRequest = function(trackingCode, callback) {
        var options = {
            form: {number: trackingCode},
            timeout: 7000
        };

        request
            .post(self.url, options, self.makeResponseHandler(trackingCode, callback))
            .on('error', function(err) {
                callback(err, null);
            });
    }

    this.makeResponseHandler = function(trackingCode, callback) {
        return function(err, resp, body) {
            if (err)
                return callback(err, null);

            try {
                var json = JSON.parse(body);
            } catch(exc) {
                return callback(exc, null);
            }

            if (json.status === 0)
                return callback(json.result, null);

            if (json.result[trackingCode].status === 0)
                return callback(json.result[trackingCode].result, null);

            callback(null, json.result[trackingCode].result);
        }
    }

    this.init.apply(this, arguments);
}