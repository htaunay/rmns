var binding = require("../build/Release/binding"); 

var rmns = {};

rmns.RESET_OK = function() {
    
    var msg = "Reset operation successful. " + 
              "Spatial structure currently has 0 points";

    return {"code": 200, "msg": msg};
};

rmns.STATS_OK = function(points, spheres) {

    var msg = "RMNS server running with:\n" + 
              points + " registered point(s)\n" + 
              spheres + " registered sphere(s)\n";

    return {"code": 200, "msg": msg};
};

rmns.POINTS_OK = function(num, total) {
    
    var msg = "Added " + num + " point(s) successfully. " +
              "The total now is " + total + " point(s)";

    return {"code": 200, "msg": msg};
};

rmns.POINTS_ERROR = function() {
    
    return {"code": 400, "msg": "Invalid argument type or size"};
};

rmns.register_points = function(data) {

    var points = undefined;
    try {
        points = JSON.parse(data);
    }
    catch(e) {
        return this.POINTS_ERROR();
    }

    if(!Array.isArray(points))
        return this.POINTS_ERROR();

    if(points.length == 0 || points.length % 3 != 0)
        return this.POINTS_ERROR();

    for(key in points) {
        if(isNaN(points[key]))
            return this.POINTS_ERROR();
    }

    var result = binding.points(points);
    if(!('total' in result))
        return this.POINTS_ERROR();

    return this.POINTS_OK(points.length / 3, result.total);
};

module.exports = rmns;
