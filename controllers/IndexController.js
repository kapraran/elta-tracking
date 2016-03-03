module.exports = function() {
    var self = this;

    this.init = function(app) { 
        self.app = app;
    }

    this.get = function(req, res) {
        res.render('index.html');
    }

    this.post = function(req, res) {
        var trackingCode = req.body.trackingCode;
        var email = req.body.email;
        var label = req.body.label;

        if (!trackingCode)
            return res.json({error: true});

        if (self.app.track(trackingCode, email, label))
            res.json({error: false});
        else
            res.json({error: true});
    }

    this.init.apply(this, arguments);
}