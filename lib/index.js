// Only trigger nodejs-dashboard if version is compatible
const compare = require('node-version-compare');
if(compare(process.version, "4.5.0") >= 0) {
    require("nodejs-dashboard");
}

const url = require("url");
const http = require("http");

const rmns = require("./rmns")
const utils = require("./utils");
const config = utils.load_config();

/* ========================================================================= */
/* ============================= SERVER SETUP ============================== */
/* ========================================================================= */

var router = function(req_url, data, cb) {

    switch(req_url.pathname) {

        case "/stats":
            if(config.is_master)    utils.forward(req_url.pathname, data, cb);
            else                    cb(rmns.get_stats());

            break;

        case "/points":
            if(config.is_master)    utils.forward(req_url.pathname, data, cb);
            else                    cb(rmns.register_points(data));

            break;

        case "/spheres":
            if(config.is_master)    utils.forward(req_url.pathname, data, cb);
            else                    cb(rmns.register_spheres(data));

            break;

        case "/reset":
            if(config.is_master)    utils.forward(req_url.pathname, data, cb);
            else                    cb(rmns.reset());

            break;

        case "/nearest_point":
            if(config.is_master)    utils.forward(req_url.pathname, data, cb);
            else                    cb(rmns.nearest_point(data));

            break;

        case "/nearest_vpoint":
            if(config.is_master)    utils.forward(req_url.pathname, data, cb);
            else                    cb(rmns.nearest_vpoint(data));

            break;

        case "/nearest_object":
            if(config.is_master)    utils.forward(req_url.pathname, data, cb);
            else                    cb(rmns.nearest_object(data));

            break;

        case "/nearest_vobject":
            if(config.is_master)    utils.forward(req_url.pathname, data, cb);
            else                    cb(rmns.nearest_vobject(data));

            break;

        case "/velocity":

            var json_data = data;
            try {
                if(typeof data === 'string' || data instanceof String)
                    json_data = JSON.parse(data);
            }
            catch(e) {
                return this.VELOCITY_ERROR();
            }

            if(req_url.query != undefined &&
               req_url.query == "ignoreHeuristic=true")
                json_data["ignoreHeuristic"] = true;

            if(config.is_master)    rmns.remote_velocity(json_data, cb);
            else                    cb(rmns.local_velocity(json_data));

            break;

        default:
            cb(rmns.NOT_FOUND());
            break;
    }
}

const server = module.exports = http.createServer(function (request, response) {

    var timestamp = null;

    var data = "";
    request.on("data", function(chunk) {
        data += chunk;
    });

    request.on("end", function() {

        timestamp = Date.now();
        const req_url = url.parse("http://" + request.url);
        router(req_url, data, function(obj) {

            if(utils.is_array(obj))
                obj = obj[0];

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

server.start = function() {
    server.listen(config.port);
    console.log("Server running at http://127.0.0.1:" + config.port + "/");
};

server.start();
