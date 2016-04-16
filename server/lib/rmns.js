var utils = require("./utils");
var config = utils.load_config();

var spatial = require("../build/Release/binding");
spatial.setup_config(config);

var rmns = {};

/* ========================================================================= */
/* ============================ PRIVATE METHODS ============================ */
/* ========================================================================= */

var build_nearest_func = function(type, method_name, ok_msg, error_msg) {

    return function(data) {

        if(typeof data === "string") {

            try {
                data = JSON.parse(data);
            }
            catch(e) {
                return error_msg();
            }
        }

        var result;
        if(type === "eye") {

            if(!utils.is_vec3(data.eye))
                return error_msg();

            result = spatial[method_name](data.eye);
        }
        else if(type === "view") {

            if(!utils.is_valid_view(data))
                return error_msg();

            result = spatial[method_name](
                data.eye, data.center, data.up, data.fovy,
                data.aspect, data.znear, data.zfar
            );
        }
        else {
            return error_msg();
        }

        if(!utils.is_nearest_result_valid(result))
            return error_msg();

        return ok_msg(result);
    };
};

var calc_multiplier = function(eye, nearest, vnearest, distance) {

    var result;
    if(vnearest != null) {

        var nearest_vec  = utils.sub_vec3(nearest,  eye);
        var vnearest_vec = utils.sub_vec3(vnearest, eye);

        nearest_vec  = utils.normalize_vec3(nearest_vec);
        vnearest_vec = utils.normalize_vec3(vnearest_vec);

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

var calc_heuristic = function(point_result, vpoint_result,
        obj_result, vobj_result, eye, times) {

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
    var heuristic_result = calc_multiplier(eye, nearest, vnearest, distance);
    times.heuristic = Date.now() - now;

    return {
        "heuristic_result": heuristic_result,
        "nearest": nearest,
        "vnearest": vnearest,
        "distance": distance
    }
};

var return_velocity = function(final_result, times, start, cb) {

    if("point_result" in final_result && "vpoint_result" in final_result &&
       "object_result" in final_result && "vobject_result" in final_result)
    {
        var result = calc_heuristic(
                final_result.point_result,
                final_result.vpoint_result,
                final_result.object_result,
                final_result.vobject_result,
                final_result.eye,
                times
        );

        if(config.velocity_multiplier !== undefined)
            result.heuristic_result.velocity *= config.velocity_multiplier;

        times.velocity = Date.now() - start;
        cb(
            rmns.VELOCITY_OK(
                result.heuristic_result,
                result.distance,
                result.nearest,
                result.vnearest,
                times
            )
        );
    }
};

/* ========================================================================= */
/* ============================ SERVER MESSAGES ============================ */
/* ========================================================================= */

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

rmns.SPHERES_OK = function(num, total, time) {

    var msg = "Included/Updated " + num + " sphere(s) successfully. " +
              "The total now is " + total + " sphere(s)";

    return {"code": 200, "msg": msg, "result": {"time": time}};
}

rmns.SPHERES_ERROR = function() {

    return {"code": 400, "msg": "Invalid argument type or size"};
};

rmns.NEAREST_POINT_OK = function(result) {

    var msg;

    if(result.found)
        msg = "Nearest global point found";
    else
        msg = "No global point was found";

    return {"code": 200, "msg": msg, "result": result};
};

rmns.NEAREST_POINT_ERROR = function() {

    return {"code": 400, "msg": "An error occurred while attempting to " +
        "locate the nearest global point"};
};

rmns.NEAREST_VPOINT_OK = function(result) {

    var msg;

    if(result.found)
        msg = "Nearest visible point found";
    else
        msg = "No visible point was found";

    return {"code": 200, "msg": msg, "result": result};
};

rmns.NEAREST_VPOINT_ERROR = function() {

    return {"code": 400, "msg": "An error occurred while attempting to " +
        "locate the nearest visible point"};
};

rmns.NEAREST_OBJECT_OK = function(result) {

    var msg;

    if(result.found)
        msg = "Nearest global object found";
    else
        msg = "No global object was found";

    return {"code": 200, "msg": msg, "result": result};
};

rmns.NEAREST_OBJECT_ERROR = function() {

    return {"code": 400, "msg": "An error occurred while attempting to " +
        "locate the nearest global object"};
};

rmns.NEAREST_VOBJECT_OK = function(result) {

    var msg;

    if(result.found)
        msg = "Nearest visible object found";
    else
        msg = "No visible object was found";

    return {"code": 200, "msg": msg, "result": result};
};

rmns.NEAREST_VOBJECT_ERROR = function() {

    return {"code": 400, "msg": "An error occurred while attempting to " +
        "locate the nearest visible object"};
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

/* ========================================================================= */
/* ============================= SERVER METHODS ============================ */
/* ========================================================================= */

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
        if(!utils.is_num(points[key]))
            return this.POINTS_ERROR();
    }

    var result = spatial.points(points);
    if(!("total" in result) || !utils.is_num(result.total) || result.total < 1)
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

    var before = Date.now()
    for(var key in spheres) {

        var sphere = spheres[key];
        if(!("center" in sphere))
            return this.SPHERES_ERROR();

        var center = sphere.center;
        if(!("x" in center) || !("y" in center) || !("z" in center))
            return this.SPHERES_ERROR();
        if(!utils.is_num(center.x) || !utils.is_num(center.y) || !utils.is_num(center.z))
            return this.SPHERES_ERROR();

        if(!("id" in sphere) || !("radius" in sphere))
            return this.SPHERES_ERROR();
        if(!utils.is_num(sphere.id) || !utils.is_num(sphere.radius) || sphere.radius <= 0)
            return this.SPHERES_ERROR();
    }

    var result = spatial.spheres(spheres);
    var time = Date.now() - before;
    if(!("total" in result) || !utils.is_num(result.total) || result.total < 1)
        return this.SPHERES_ERROR();

    return this.SPHERES_OK(spheres.length, result.total, time);
};

rmns.reset = function() {

    var result = spatial.reset();
    if(!('success' in result) || !result.success)
        return this.RESET_ERROR();

    return this.RESET_OK();
};

rmns.nearest_point = build_nearest_func(
        "eye", "nearest_point",
        rmns.NEAREST_POINT_OK, rmns.NEAREST_POINT_ERROR
);

rmns.nearest_vpoint = build_nearest_func(
        "view", "nearest_vpoint",
        rmns.NEAREST_VPOINT_OK, rmns.NEAREST_VPOINT_ERROR
);

rmns.nearest_object = build_nearest_func(
        "eye", "nearest_object",
        rmns.NEAREST_OBJECT_OK, rmns.NEAREST_OBJECT_ERROR
);

rmns.nearest_vobject = build_nearest_func(
        "view", "nearest_vobject",
        rmns.NEAREST_VOBJECT_OK, rmns.NEAREST_VOBJECT_ERROR
);

rmns.remote_velocity = function(data, cb) {

    var final_result = {};
    try {
        var json = JSON.parse(data);
        if(!("eye" in json)) {
            cb(this.VELOCITY_ERROR())
            return;
        }
        else {
            final_result.eye = json.eye
        }
    }
    catch(e) {
        return this.VELOCITY_ERROR();
    }


    var times = {};
    var start = Date.now();

    var point_now = Date.now();
    utils.forward("/nearest_point", data, function(obj) {

        times.point = Date.now() - point_now;
        // TODO deal with multiple results
        final_result.point_result = obj[0].result;
        return_velocity(final_result, times, start, cb);
    });

    var vpoint_now = Date.now();
    utils.forward("/nearest_vpoint", data, function(obj) {

        times.vpoint = Date.now() - vpoint_now;
        final_result.vpoint_result = obj[0].result;
        return_velocity(final_result, times, start, cb);
    });

    var object_now = Date.now();
    utils.forward("/nearest_object", data, function(obj) {

        times.object = Date.now() - object_now;
        final_result.object_result = obj[0].result;
        return_velocity(final_result, times, start, cb);
    });

    var vobject_now = Date.now();
    utils.forward("/nearest_vobject", data, function(obj) {

        times.vobject = Date.now() - vobject_now;
        final_result.vobject_result = obj[0].result;
        return_velocity(final_result, times, start, cb);
    });
};

rmns.local_velocity = function(data) {

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

    if(!utils.is_vec3(eye) || !utils.is_vec3(center) || !utils.is_vec3(up))
        return this.VELOCITY_ERROR();

    if(!utils.is_pos_num(fovy) || !utils.is_pos_num(aspect) || !utils.is_pos_num(znear) ||
       !utils.is_pos_num(zfar) || znear >= zfar)
        return this.VELOCITY_ERROR();

    var times = {};
    var start = Date.now();
    var now = null;

    now = Date.now();
    var point_result = spatial.nearest_point(eye);
    times.point = Date.now() - now;
    if(!utils.is_nearest_result_valid(point_result))
        return this.VELOCITY_ERROR();

    now = Date.now();
    var vpoint_result = spatial.nearest_vpoint(eye, center, up, fovy,
                                              aspect, znear, zfar);
    times.vpoint = Date.now() - now;
    if(!utils.is_nearest_result_valid(vpoint_result))
        return this.VELOCITY_ERROR();

    now = Date.now();
    var obj_result = spatial.nearest_object(eye);
    times.object = Date.now() - now;
    if(!utils.is_nearest_result_valid(obj_result))
        return this.VELOCITY_ERROR();

    now = Date.now();
    var vobj_result = spatial.nearest_vobject(eye, center, up, fovy,
                                              aspect, znear, zfar);
    times.vobject = Date.now() - now;
    if(!utils.is_nearest_result_valid(vobj_result))
        return this.VELOCITY_ERROR();

    var result = calc_heuristic(point_result, vpoint_result,
            obj_result, vobj_result, eye, times);

    if(config.velocity_multiplier !== undefined)
        result.heuristic_result.velocity *= config.velocity_multiplier;

    times.velocity = Date.now() - start;
    return this.VELOCITY_OK(
        result.heuristic_result,
        result.distance,
        result.nearest,
        result.vnearest,
        times
    );
};

module.exports = rmns;
