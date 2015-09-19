var http = require("http");
var binding = require("./build/Release/binding"); 

var server = http.createServer(function (request, response) {

    if(request.method === "POST") {

        var data = "";
        request.on("data", function(chunk) {
            data += chunk;
        });
        
        request.on("end", function() {

            response.writeHead(200, "OK", {"Content-Type":"application/json"});

            var pos = JSON.parse(data);
            var speed = binding.get_speed(pos.x, pos.y, pos.z);
            response.end(JSON.stringify({"speed": speed}));
        });
    }
});

var port = 8081;
server.listen(port);
console.log("Server running at http://127.0.0.1:" + port + "/");
