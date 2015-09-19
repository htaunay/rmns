var http = require("http");
var binding = require("./build/Release/binding"); 

// cb receives built obj
var router = function(url, data, cb) {

    switch(url) {

        case "/reset":
            cb(binding.reset());
            break;

        case "/points":
            cb(binding.points(JSON.parse(data)));
            break;

        case "/start":
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
            if(obj !== undefined && "result" in obj) {
                json.result = obj.result;
            }

            response.end(JSON.stringify(json));
        });
    });
});

var port = 8081;
server.listen(port);
console.log("Server running at http://127.0.0.1:" + port + "/");
