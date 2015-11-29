var rmns = require("./rmns")
var http = require("http");

// cb receives built obj
var router = function(url, data, cb) {

    switch(url) {

        case "/stats":
            cb(rmns.get_stats());
            break;

        case "/points":
            cb(rmns.register_points(data));
            break;

        //case "/cubes":
        //    cb(binding.points(JSON.parse(data)));
        //    console.log("Calling cubes endpoint");
        //    break;

        case "/spheres":
            cb(rmns.register_spheres(data));
            break;

        case "/reset":
            cb(rmns.reset());
            break;

        case "/velocity":
            cb(rmns.calc_velocity(data));
            break;

        default:
            cb(rmns.NOT_FOUND());
            break;
    }
}

var server = module.exports = http.createServer(function (request, response) {

    var timestamp = null;

    var data = "";
    request.on("data", function(chunk) {
        data += chunk;
    });

    request.on("end", function() {

        timestamp = Date.now();
        router(request.url, data, function(obj) {

            response.statusCode = obj.code;
            response.setHeader("Content-Type", "application/json");

            var json = { "msg": obj.msg, "timestamp": timestamp };
            if("result" in obj) {
                json["result"] = obj.result;
            }

            response.end(JSON.stringify(json) + "\n");
        });
    });
});

var port = 8081;
server.listen(port);
console.log("Server running at http://127.0.0.1:" + port + "/");
