var math = require("math");
var spatial = require("../build/Release/binding");
var config = require("../config/config.json");
spatial.setup_config(config);

var rmns = {};

/* ================ PRIVATE METHODS =============== */

var is_num = function(num) {
    return typeof num === "number";
};

var is_pos_num = function(num) {
    return is_num(num) && num >= 0;
};

var is_vec3 = function(vec3) {

    if(typeof vec3 !== "object")
        return false;

    if(!("x" in vec3) || !("y" in vec3) || !("z" in vec3))
        return false;
    if(!is_num(vec3.x) || !is_num(vec3.y) || !is_num(vec3.z))
        return false;

    return true;
};

var sub_vec3 = function(v1, v2) {

    var vec = {};
    vec.x = v1.x - v2.x;
    vec.y = v1.y - v2.y;
    vec.z = v1.z - v2.z;

    return vec;
};

var normalize_vec3 = function(vec) {

    var length = math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    length += 0.001; // Avoid division by zero

    var nvec = {};
    nvec.x = vec.x / length;
    nvec.y = vec.y / length;
    nvec.z = vec.z / length;

    return nvec;
};

var is_nearest_result_valid = function(result) {

    if(!result.found)
        return true;

    if(!("distance" in result) ||
        !is_num(result.distance) ||
        result.distance < 0)
        return false;

    if(!("nearest" in result) ||
        !("x" in result.nearest) ||
        !("y" in result.nearest) ||
        !("z" in result.nearest))
        return false;

    if(!is_num(result.nearest.x) ||
        !is_num(result.nearest.y) ||
        !is_num(result.nearest.z))
        return false;

    return true;
};

var calc_heuristic = function(eye, nearest, vnearest, distance) {

    var result;
    if(vnearest != null) {

        var nearest_vec  = sub_vec3(nearest,  eye);
        var vnearest_vec = sub_vec3(vnearest, eye);

        nearest_vec  = normalize_vec3(nearest_vec);
        vnearest_vec = normalize_vec3(vnearest_vec);

        var cos_similarity = nearest_vec.x * vnearest_vec.x +
                             nearest_vec.y * vnearest_vec.y +
                             nearest_vec.z * vnearest_vec.z;

        var multiplier = 1.0 + ((1.0 - cos_similarity) / 2.0);

        var velocity = distance * multiplier;

        result = {
            "velocity": velocity,
            "multiplier": multiplier,
            "cos_similarity": cos_similarity
        };
    }
    else {
        result = {
            "velocity": distance,
            "multiplier": 1.0,
            "cos_similarity": 1.0
        };
    }

    return result;
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

rmns.VELOCITY_OK = function(
        heuristic_result, distance, nearest, vnearest, times) {

    return {
        "code": 200,
        "msg": "Velocity calculated with success",
        "result": {
            "distance":             distance,
            "velocity":             heuristic_result.velocity,
            "nearest":              nearest,
            "vnearest":             vnearest,
            "cos_similarity":       heuristic_result.cos_similarity,
            "multiplier":           heuristic_result.multiplier,
            "times":                times
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

    var result = spatial.stats();
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
        if(!is_num(points[key]))
            return this.POINTS_ERROR();
    }

    var result = spatial.points(points);
    if(!("total" in result) || !is_num(result.total) || result.total < 1)
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
        if(!is_num(center.x) || !is_num(center.y) || !is_num(center.z))
            return this.SPHERES_ERROR();

        if(!("id" in sphere) || !("radius" in sphere))
            return this.SPHERES_ERROR();
        if(!is_num(sphere.id) || !is_num(sphere.radius) || sphere.radius <= 0)
            return this.SPHERES_ERROR();
    }

    var result = spatial.spheres(spheres);
    if(!("total" in result) || !is_num(result.total) || result.total < 1)
        return this.SPHERES_ERROR();

    return this.SPHERES_OK(spheres.length, result.total);
};

rmns.reset = function() {

    var result = spatial.reset();
    if(!('success' in result) || !result.success)
        return this.RESET_ERROR();

    return this.RESET_OK();
};

// TODO specific endpoints (e.g. nearest object)

rmns.calc_velocity = function(data) {

    var eye;
    var center;
    var up;
    var fovy;
    var aspect;
    var znear;
    var zfar;

    try {
        data    = JSON.parse(data);
        eye     = data.eye;
        center  = data.center;
        up      = data.up;
        fovy    = data.fovy;
        aspect  = data.aspect;
        znear   = data.znear;
        zfar    = data.zfar;
    }
    catch(e) {
        return this.VELOCITY_ERROR();
    }

    if(!is_vec3(eye) || !is_vec3(center) || !is_vec3(up))
        return this.VELOCITY_ERROR();

    if(!is_pos_num(fovy) || !is_pos_num(aspect) || !is_pos_num(znear) ||
       !is_pos_num(zfar) || znear >= zfar)
        return this.VELOCITY_ERROR();

    var times = {};
    var start = Date.now();
    var now = null;

    now = Date.now();
    var point_result = spatial.nearest_point(eye);
    times.point = Date.now() - now;
    if(!is_nearest_result_valid(point_result))
        return this.VELOCITY_ERROR();

    now = Date.now();
    var vpoint_result = spatial.nearest_vpoint(eye, center, up, fovy,
                                              aspect, znear, zfar);
    times.vpoint = Date.now() - now;
    if(!is_nearest_result_valid(vpoint_result))
        return this.VELOCITY_ERROR();

    now = Date.now();
    var obj_result = spatial.nearest_object(eye);
    times.obj = Date.now() - now;
    if(!is_nearest_result_valid(obj_result))
        return this.VELOCITY_ERROR();

    now = Date.now();
    var vobj_result = spatial.nearest_vobject(eye, center, up, fovy,
                                              aspect, znear, zfar);
    times.vobj = Date.now() - now;
    if(!is_nearest_result_valid(vobj_result))
        return this.VELOCITY_ERROR();

    var nearest = null;
    var distance = -1;
    if
    (
        (point_result.found && !obj_result.found) ||
        (
            point_result.found && obj_result.found &&
            point_result.distance < obj_result.distance
        )
    )
    {
        nearest  = point_result.nearest;
        distance = point_result.distance;
    }
    else if
    (
        (!point_result.found && obj_result.found) ||
        (
            point_result.found && obj_result.found &&
            point_result.distance > obj_result.distance
        )
    )
    {
        nearest  = obj_result.nearest;
        distance = obj_result.distance;
    }

    var vnearest = null;
    if
    (
        (vpoint_result.found && !vobj_result.found) ||
        (
            vpoint_result.found && vobj_result.found &&
            vpoint_result.distance < vobj_result.distance
        )
    )
    {
        vnearest = vpoint_result.nearest;
    }
    else if
    (
        (!vpoint_result.found && vobj_result.found) ||
        (
            vpoint_result.found && vobj_result.found &&
            vpoint_result.distance > vobj_result.distance
        )
    )
    {
        vnearest  = vobj_result.nearest;
    }

    now = Date.now();
    var heuristic_result = calc_heuristic(eye, nearest, vnearest, distance);
    times.heuristic = Date.now() - now;

    times.velocity = Date.now() - start;
    return this.VELOCITY_OK(
            heuristic_result, distance, nearest, vnearest, times);
};

module.exports = rmns;
