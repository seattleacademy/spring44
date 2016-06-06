//config = require("./config");
//console.log(config.port)
var nodeimu = require('nodeimu');
var IMU = new nodeimu.IMU();
function getData() {
    IMU.getValue(function(err, data) {
        if (err) throw err;
        sensors = data;
	console.log(sensors);
    });
}
getData();

