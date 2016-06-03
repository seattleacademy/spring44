var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.text());

var sensorData = {};
sensorData.counter = 0;
sensorData.timestamp = Date.now();
var networkInterfaces = require('os').networkInterfaces();
sensorData.address = networkInterfaces.wlan0[0].address;
sensorData.port = sensorData.address.split('.')[3] + '000';
sensorData.mac = networkInterfaces.wlan0[0].mac;
sensorData.odometer = 0;

var irobot = require('./index');
var robot = new irobot.Robot('/dev/ttyUSB0');

robot.on('sensordata', function(data) {
    sensorData.odometer += data.state.distance.millimeters;
    if (data.state.mode.passive == true) sensorData.mode = "passive";
    if (data.state.mode.safe == true) sensorData.mode = "safe";
    if (data.state.mode.full == true) sensorData.mode = "full";
    sensorData.battery = data.battery.voltage.volts;
    sensorData.bumper_left = data.bumpers.left.activated;
    sensorData.bumper_right = data.bumpers.right.activated;
    sensorData.cliff_left = data.cliff_sensors.left.signal.raw;
    sensorData.cliff_front_left = data.cliff_sensors.front_left.signal.raw;
    sensorData.cliff_front_right = data.cliff_sensors.front_right.signal.raw;
    sensorData.cliff_right = data.cliff_sensors.right.signal.raw;
    //Stop a bot that has not been reached for 5 seconds.
    if ((Date.now() - sensorData.timestamp) > 5000)
        robot.drive({ left: '0', right: '0' });
    //console.log(JSON.stringify(data, null, 4));
});

function getSensors() {
    sensorData.counter++;
    sensorData.timestamp = Date.now();
    return JSON.stringify(sensorData);
}
app.all('/sensors', function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(getSensors());
});

app.all('/drive', function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (sensorData.mode == "passive") robot.safeMode();
    console.log(JSON.parse(req.body));
    robot.drive(JSON.parse(req.body));
    res.send(getSensors());
});

app.listen(sensorData.port, function() {
    console.log('listening on', sensorData.address + ':' + sensorData.port);
});
