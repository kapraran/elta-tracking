module.exports = function() {
    var self = this;

    this.init = function(app) { 
        self.app = app;
    }

    this.get = function(req, res) {
        res.render('admin.html', {trackingCodes: self.app.trackingCodes});
    }

    this.post = function(req, res) {

    }

    this.init.apply(this, arguments);
}