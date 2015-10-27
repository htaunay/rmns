var binding = require("../build/Release/binding");

var rmns = {};

var isNum = function(num) {
    return typeof num === "number";
}

/* ================ SERVER MESSAGES =============== */

rmns.RESET_OK = function() {

    var msg = "Reset operation successful. " +
              "Spatial structure currently has 0 points";

    return {"code": 200, "msg": msg};
};

rmns.RESET_ERROR = function() {

    var msg = "Internal server error, unable to reset spatial structure";

    return {"code": 500, "msg": msg};
};

rmns.STATS_OK = function(points, spheres) {

    var msg = "RMNS server running with:\n" +
              points + " registered point(s)\n" +
              spheres + " registered sphere(s)\n";

    return {"code": 200, "msg": msg};
};

rmns.STATS_ERROR = function() {

    var msg = "An error curred while obtaining the server stats";
    return {"code": 500, "msg": msg};
};

rmns.POINTS_OK = function(num, total) {

    var msg = "Added " + num + " point(s) successfully. " +
              "The total now is " + total + " point(s)";

    return {"code": 200, "msg": msg};
};

rmns.POINTS_ERROR = function() {

    return {"code": 400, "msg": "Invalid argument type or size"};
};

rmns.SPHERES_OK = function(num, total) {

    var msg = "Included/Updated " + num + " sphere(s) successfully. " +
              "The total now is " + total + " sphere(s)";

    return {"code": 200, "msg": msg};
}

rmns.SPHERES_ERROR = function() {

    return {"code": 400, "msg": "Invalid argument type or size"};
};

rmns.VELOCITY_OK = function(velocity, nearest) {

    return {
        "code": 200,
        "msg": "Velocity calculated with success",
        "result": {
            "velocity": velocity,
            "nearest": nearest
        }
    };
};

rmns.VELOCITY_ERROR = function() {

    return {"code": 400, "msg": "Error while calculating optimal speed"};
}

rmns.NOT_FOUND = function() {

    return {
        "code": 404,
        "msg":  "URL not found. Please check the docs @ TODO"
    };
};

/* ================ SERVER METHODS =============== */

rmns.get_stats = function() {

    var result = binding.stats();
    if(!("num_points" in result))
        return this.STATS_ERROR();
    if(!("num_spheres" in result))
        return this.STATS_ERROR();

    return this.STATS_OK(result.num_points, result.num_spheres);
};

rmns.register_points = function(data) {

    var points;
    try {
        points = JSON.parse(data);
    }
    catch(e) {
        return this.POINTS_ERROR();
    }

    if(!Array.isArray(points))
        return this.POINTS_ERROR();

    if(points.length === 0 || points.length % 3 !== 0)
        return this.POINTS_ERROR();

    for(var key in points) {
        if(!isNum(points[key]))
            return this.POINTS_ERROR();
    }

    var result = binding.points(points);
    if(!("total" in result) || !isNum(result.total) || result.total < 1)
        return this.POINTS_ERROR();

    return this.POINTS_OK(points.length / 3, result.total);
};

rmns.register_spheres = function(data) {

    var spheres;
    try {
        spheres = JSON.parse(data);
    }
    catch(e) {
        return this.SPHERES_ERROR();
    }

    if(!Array.isArray(spheres))
        return this.SPHERES_ERROR();

    for(var key in spheres) {

        var sphere = spheres[key];
        if(!("center" in sphere))
            return this.SPHERES_ERROR();

        var center = sphere.center;
        if(!("x" in center) || !("y" in center) || !("z" in center))
            return this.SPHERES_ERROR();
        if(!isNum(center.x) || !isNum(center.y) || !isNum(center.z))
            return this.SPHERES_ERROR();

        if(!("id" in sphere) || !("radius" in sphere))
            return this.SPHERES_ERROR();
        if(!isNum(sphere.id) || !isNum(sphere.radius) || sphere.radius <= 0)
            return this.SPHERES_ERROR();
    }

    var result = binding.spheres(spheres);
    if(!("total" in result) || !isNum(result.total) || result.total < 1)
        return this.SPHERES_ERROR();

    return this.SPHERES_OK(spheres.length, result.total);
};

rmns.reset = function() {

    var result = binding.reset();
    if(!('success' in result) || !result.success)
        return this.RESET_ERROR();

    return this.RESET_OK();
};

rmns.calc_velocity = function(data) {

    var pos;
    try {
        pos = JSON.parse(data);
    }
    catch(e) {
        return this.VELOCITY_ERROR();
    }

    if(typeof pos !== "object")
        return this.VELOCITY_ERROR();

    if(!("x" in pos) || !("y" in pos) || !("z" in pos))
        return this.VELOCITY_ERROR();
    if(!isNum(pos.x) || !isNum(pos.y) || !isNum(pos.z))
        return this.VELOCITY_ERROR();

    var result = binding.velocity(pos);

    if(!("velocity" in result) ||
        !isNum(result.velocity) ||
        result.velocity < 0)
        return this.VELOCITY_ERROR();

    if(!("nearest" in result) ||
        !("x" in result.nearest) ||
        !("y" in result.nearest) ||
        !("z" in result.nearest))
        return this.VELOCITY_ERROR();

    if(!isNum(result.nearest.x) ||
        !isNum(result.nearest.y) ||
        !isNum(result.nearest.z))
        return this.VELOCITY_ERROR();

    return this.VELOCITY_OK(result.velocity, result.nearest);
};

module.exports = rmns;
