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

        it("xyz", function(done) {

            var r = spatial.points([
                //1,1,0,
                //1,2,0,
                //2,3,0,
                //4,2,0,
                //5,4,0,
                //4,6,0,
                //1,4,0,
                //5,2,0,
                //3,1,0
                1,1,1,
                4,3,2,
                7,5,3,
                2,7,4,
                5,9,5,
                8,2,6,
                3,4,7,
                6,6,8,
                9,8,9
            ]);
            r.total.should.be.eql(9);

            var mv = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
            var proj = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

            r = spatial.nearest_vpoint(tools.build_vec3(8,3,5), mv, proj);
            r.distance.should.be.eql(5);
            r.nearest.should.be.eql(tools.build_vec3(0,0,0));
        });

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

    describe("nearest_vpoint method", function() {

        it("should calculate the nearest distance correctly", function() {

            //var r = spatial.points([
            //    0,0,0,
            //    50,10,25,
            //    -100,100,42
            //]);
            //r.total.should.be.eql(3);

            //r = spatial.nearest_point(tools.build_vec3(0,0,0));
            //r.distance.should.be.eql(0);

            //r = spatial.nearest_point(tools.build_vec3(100,100,100));
            //r.distance.should.be.approximately(127.377, 0.001);

            //r = spatial.nearest_point(tools.build_vec3(-999,123,42));
            //r.distance.should.be.approximately(899.294, 0.001);
        });

        it("should return the nearest visible point correctly", function() {

            var r = spatial.points([
                0,0,0,
                1,1,1,
                2,2,2,
                3,3,3,
                4,4,4, 
                5,5,5,
                6,6,6,
                7,7,7,
                8,8,8,
                9,9,9
            ]);
            r.total.should.be.eql(10);

            r = spatial.nearest_vpoint(tools.build_vec3(5.1,5.1,5.1));
            r.nearest.should.be.eql(tools.build_vec3(9,9,9));

            r = spatial.nearest_vpoint(tools.build_vec3(0,1,0));
            r.nearest.should.be.eql(tools.build_vec3(0,0,0));

            //var r = spatial.points([
            //    50,50,50,
            //    12,12,12,
            //    8,8,8,
            //    5,5,5,
            //    -1,-1,-1
            //]);
            //r.total.should.be.eql(5);

            //r = spatial.nearest_vpoint(tools.build_vec3(0,0,0));
            //r.nearest.should.be.eql(tools.build_vec3(5,5,5));

            //r = spatial.nearest_vpoint(tools.build_vec3(10,10,10.01));
            //r.nearest.should.be.eql(tools.build_vec3(12,12,12));
        });
    });

    //after(function () {
    //});
});
