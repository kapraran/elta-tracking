var $form = document.querySelector('form.tracking');
var $trackingCode = document.querySelector('input.tracking-code');
var $email = document.querySelector('input.email');
var $label = document.querySelector('input.label');
var $track = document.querySelector('button.track');

var serialize = function(obj) {
    var str = [];
    
    for(var p in obj) {
        if (obj.hasOwnProperty(p))
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
    
    return str.join("&");
}

$track.onclick = function(e) {
    var data = {};

    data.trackingCode = $trackingCode.value;
    data.email = $email.value;
    data.label = $label.value;

    var request = new XMLHttpRequest();
    request.open('POST', '/', true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(serialize(data));

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            var response = JSON.parse(request.responseText);
            console.log(response);
            
            if (!response.error)
                return alert('ok');
            alert('error');
        } else {
            alert('error');
        }
    }

    request.onerror = function() {
        alert('error');
    }

    e.preventDefault();
}