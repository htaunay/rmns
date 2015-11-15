require("should");

var tools = require("./tools.js")
var spatial = require("../build/Release/binding");

// TODO
//stats
//points
//cubes
//spheres
//reset
//nearest_point
//nearest_vpoint
//nearest_object

describe("The SpatialStructure class", function () {

    beforeEach(function () {
        spatial.reset();
    });

    describe("nearest_point method", function() {

        it("should calculate the nearest distance correctly", function() {

            var r = spatial.points([
                0,0,0,
                50,10,25,
                -100,100,42
            ]);
            r.total.should.be.eql(3);

            r = spatial.nearest_point(tools.build_vec3(0,0,0));
            r.distance.should.be.eql(0);

            r = spatial.nearest_point(tools.build_vec3(100,100,100));
            r.distance.should.be.approximately(127.377, 0.001);

            r = spatial.nearest_point(tools.build_vec3(-999,123,42));
            r.distance.should.be.approximately(899.294, 0.001);
        });

        it("should return the nearest point correctly", function() {

            var r = spatial.points([
                0,0,0,
                1,0,0,
                0,1,0,
                0,0,1,
                1,1,1
            ]);
            r.total.should.be.eql(5);

            r = spatial.nearest_point(tools.build_vec3(-1,-1,-1));
            r.nearest.should.be.eql(tools.build_vec3(0,0,0));
        });
    });

    //after(function () {
    //});
});
