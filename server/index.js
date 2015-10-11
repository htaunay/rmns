var http = require("http");
var binding = require("./build/Release/binding"); 

// cb receives built obj
var router = function(url, data, cb) {

    switch(url) {

        case "/reset":
            cb(binding.reset());
            console.log("Calling reset endpoint");
            break;

        case "/points":
            cb(binding.points(JSON.parse(data)));
            console.log("Calling points endpoint");
            break;

        //case "/cubes":
        //    cb(binding.points(JSON.parse(data)));
        //    console.log("Calling cubes endpoint");
        //    break;

        case "/spheres":
            cb(binding.spheres(JSON.parse(data)));
            console.log("Calling spheres endpoint");
            break;

        case "/velocity":
            cb(binding.velocity(JSON.parse(data)));
            console.log("Calling velocity endpoint");
            break;

        default:
            cb({
                "code": "404",
                "msg":  "URL not found. Please check the docs @ TODO"
            });
            break;
    }
}

var server = http.createServer(function (request, response) {

    var data = "";
    request.on("data", function(chunk) {
        data += chunk;
    });

    request.on("end", function() {

        router(request.url, data, function(obj) {

            response.statusCode = obj.code;
            response.setHeader("Content-Type", "application/json");

            var json = { "msg": obj.msg };
            if("result" in obj) {
                for(var key in obj.result)
                    json[key] = obj.result[key];
            }

            response.end(JSON.stringify(json) + "\n");
        });
    });
});

var port = 8081;
server.listen(port);
console.log("Server running at http://127.0.0.1:" + port + "/");
