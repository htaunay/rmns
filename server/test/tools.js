var tools = {};

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
}

tools.build_vec3 = function(x, y, z) {

    return {
        "x": x,
        "y": y,
        "z": z
    };
}

module.exports = tools;
