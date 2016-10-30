var http = require("http");
var math = require("math");

var utils = {};

utils.load_config = function(file) {

    var config_file = process.env.NODE_ENV;
    var path;

    if(config_file !== undefined && typeof config_file === "string")
        path = "../config/" + config_file + ".json";
    else if(file != undefined)
        path = process.cwd() + "/" + file;
    else
        path = "../config/stand-alone.json";

    utils.config_file = config_file;
    return require(path);
};

utils.vec3 = function(x,y,z) {

    if(!this.is_num(x) || !this.is_num(y) || !this.is_num(z))
        return null;

    var vec = {};
    vec.x = x;
    vec.y = y;
    vec.z = z;

    return vec;
};

utils.is_array = function(obj) {

    return (!!obj) && (obj.constructor === Array);
};

utils.sub_vec3 = function(v1, v2) {

    var vec = {};
    vec.x = v1.x - v2.x;
    vec.y = v1.y - v2.y;
    vec.z = v1.z - v2.z;

    return vec;
};

utils.normalize_vec3 = function(vec) {

    var length = math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    length += 0.001; // Avoid division by zero

    var nvec = {};
    nvec.x = vec.x / length;
    nvec.y = vec.y / length;
    nvec.z = vec.z / length;

    return nvec;
};

utils.array_to_vec3 = function(array) {

    if(!this.is_array(array) || array.length != 3)
        return null;

    var vec3 = {};
    vec3.x = array[0];
    vec3.y = array[1];
    vec3.z = array[2];

    return vec3;
};

utils.is_num = function(num) {
    return typeof num === "number";
};

utils.is_pos_num = function(num) {
    return this.is_num(num) && num >= 0;
};

utils.is_vec3 = function(vec3) {

    if(vec3 === null || typeof vec3 !== "object")
        return false;

    if(!("x" in vec3) || !("y" in vec3) || !("z" in vec3))
        return false;
    if(!this.is_num(vec3.x) || !this.is_num(vec3.y) || !this.is_num(vec3.z))
        return false;

    return true;
};

utils.is_valid_view = function(view) {

    if(!this.is_vec3(view.eye) || !this.is_vec3(view.center) || !this.is_vec3(view.up))
        return false;

    if(!this.is_pos_num(view.fovy)   ||
       !this.is_pos_num(view.aspect) ||
       !this.is_pos_num(view.znear)  ||
       !this.is_pos_num(view.zfar)   ||
       view.znear >= view.zfar)
        return false;

    return true;
};

utils.is_nearest_result_valid = function(result) {

    if(!result.found)
        return false;

    if(!("distance" in result) ||
        !this.is_num(result.distance) ||
        result.distance < 0)
        return false;

    if(!("nearest" in result) || !this.is_vec3(result.nearest))
        return false;

    return true;
};

var get_method = function(path) {

    if(path === "/stats" || path === "/reset")
        return "GET";
    else
        return "POST";
};

var return_from_forward = function(json, length, final_result, cb) {

    final_result.push(json);

    if(final_result.length === length)
        cb(final_result);
};

utils.forward = function(path, data, cb) {

    var endpoints;
    var config = this.load_config();

    if(config.slaves[path] instanceof Array) {
        endpoints = config.slaves[path];
    }
    else {
        endpoints = [];
        endpoints.push(config.slaves[path]);
    }

    var final_result = [];
    var length = endpoints.length;
    endpoints.map(function(item) {

        var options = {
            host: item.ip,
            port: item.port,
            path: path,
            method: get_method(path)
        };

        var request = http.request(options, function(response) {

            var response_data = "";
            response.setEncoding("utf8");
            response.on("data", function (chunk) {
                response_data += chunk;
            });

            response.on("end", function() {
                var json = JSON.parse(response_data);
                json.code = response.statusCode;
                return_from_forward(json, length, final_result, cb);
            });
        });

        request.write(data);
        request.end();
    });
};

module.exports = utils;
