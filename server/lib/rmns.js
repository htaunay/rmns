var spatial = require("../build/Release/binding");

var rmns = {};

/* ================ HELPER METHODS =============== */

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

var is_nearest_result_valid = function(result) {

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

    var point_result = spatial.nearest_vpoint(eye, center, up, fovy,
                                              aspect, znear, zfar);

    if(!is_nearest_result_valid(point_result))
        return this.VELOCITY_ERROR();

    //var visible_result = spatial.nearest_vpoint(pos);
    //if(!is_nearest_result_valid(visible_result))
    //    return this.VELOCITY_ERROR();

    var obj_result = spatial.nearest_vobject(eye, center, up, fovy,
                                              aspect, znear, zfar);
    if(!is_nearest_result_valid(obj_result))
        return this.VELOCITY_ERROR();

    if(point_result.distance < obj_result.distance)
        return this.VELOCITY_OK(point_result.distance, point_result.nearest);
    else
        return this.VELOCITY_OK(obj_result.distance, obj_result.nearest);

    //if(point_result.distance < obj_result.distance &&
    //   point_result.distance < visible_result.distance)
    //    return this.VELOCITY_OK(point_result.distance, point_result.nearest);
    //else if(visible_result.distance < obj_result.distance)
    //    return this.VELOCITY_OK(visible_result.distance, visible_result.nearest);
    //else
    //    return this.VELOCITY_OK(obj_result.distance, obj_result.nearest);
};

module.exports = rmns;
