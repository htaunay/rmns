var math = require("math");
var rmns = require("../lib/rmns.js");

var tools = {};

tools.build_vec3 = function(x, y, z) {

    return {
        "x": x,
        "y": y,
        "z": z
    };
};

tools.vec3_equal = function(v1, v2, margin) {

    if(margin === undefined)
        margin = 0;

    if(math.abs(v1.x - v2.x) > margin)
        return false;

    if(math.abs(v1.y - v2.y) > margin)
        return false;

    if(math.abs(v1.z - v2.z) > margin)
        return false;

    return true;
};

tools.build_sphere = function(id, radius, x, y, z) {

    return {
        "id": id,
        "radius": radius,
        "center": {
            "x": x,
            "y": y,
            "z": z
        }
    };
};

tools.build_camera = function(eye, center, up, fovy, aspect, znear, zfar) {

    return {
        "eye":      eye,
        "center":   center,
        "up":       up,
        "fovy":     fovy,
        "aspect":   aspect,
        "znear":    znear,
        "zfar":     zfar
    };
};

tools.build_velocity_result = function(
        velocity,
        cos_similarity,
        multiplier,
        distance,
        nearest,
        vnearest
) {

    var heuristic_result = {
        "velocity":         velocity,
        "cos_similarity":   cos_similarity,
        "multiplier":       multiplier
    };

    var times = {
        "heuristic":    0,
        "obj":          0,
        "point":        0,
        "velocity":     0,
        "vobj":         0,
        "vpoint":       0
    };

    return rmns.VELOCITY_OK(
        heuristic_result, distance, nearest, vnearest, times
    );
};

module.exports = tools;
