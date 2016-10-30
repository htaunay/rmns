require("should");
require("should-http");

var server  = require("../lib/index.js");
var rmns = require("../lib/rmns.js");
var tools = require("./tools.js")
var request = require("request");

var utils = require("../lib/utils.js");
var port = utils.load_config().port;

/* ========================================================================= */
/* ============================= HELPER METHODS ============================ */
/* ========================================================================= */

var test_get = function(endpoint, expected_res, done) {

    request.get("http://localhost:" + port + "/" + endpoint,
        function(err, res, body) {

            if(err !== null)
                console.log(err);

            res.statusCode.should.be.eql(expected_res.code);
            res.should.be.json();

            body = JSON.parse(res.body);
            (body.msg === undefined).should.be.false();
            body.msg.should.be.eql(expected_res.msg);

            done();
    });
};

var test_post = function(endpoint, expected_res, post_data, done) {

    var data  = {};
    data.url  = "http://localhost:" + port + "/" + endpoint;
    data.headers = {"content-type" : "application/json"};
    data.body = JSON.stringify(post_data);

    request.post(data, function(err, res, body) {

        if(err !== null)
            console.log(err);

        res.statusCode.should.be.eql(expected_res.code);
        res.should.be.json();

        body = JSON.parse(res.body);
        (body.msg === undefined).should.be.false();
        body.msg.should.be.eql(expected_res.msg);

        if("result" in expected_res) {

            // Ignore time results that are not deterministic
            if("time" in body.result) delete body.result["time"];
            if("time" in expected_res.result) delete expected_res.result["time"];

            (body.result === undefined).should.be.false();
            body.result.should.be.eql(expected_res.result);
        }

        done();
    });
};

var test_velocity = function(expected_res, post_data, done) {

    var data  = {};
    data.url  = "http://localhost:" + port + "/velocity";
    data.headers = {"content-type" : "application/json"};
    data.body = JSON.stringify(post_data);

    if(post_data.ignoreHeuristic)
        data.url += "?ignoreHeuristic=true";

    request.post(data, function(err, res, body) {

        if(err !== null)
            console.log(err);

        res.statusCode.should.be.eql(expected_res.code);
        res.should.be.json();

        body = JSON.parse(res.body);
        (body.msg === undefined).should.be.false();
        body.msg.should.be.eql(expected_res.msg);

        if("result" in expected_res) {

            (body.result === undefined).should.be.false();
            var r1 = body.result;
            var r2 = expected_res.result;

            (r1.distance === undefined).should.be.false();
            r2.distance.should.be.approximately(r1.distance, 0.001);
            (r1.velocity === undefined).should.be.false();
            r2.velocity.should.be.approximately(r1.velocity, 0.001);
            (r1.nearest === undefined).should.be.false();
            tools.vec3_equal(r1.nearest, r2.nearest, 0.001).should.be.true();

            if(!post_data.ignoreHeuristic) {
                (r1.vnearest === undefined).should.be.false();
                tools.vec3_equal(r1.vnearest, r2.vnearest, 0.001).should.be.true();
                (r1.cos_similarity === undefined).should.be.false();
                r2.cos_similarity.should.be.approximately(r1.cos_similarity, 0.01);
                (r1.multiplier === undefined).should.be.false();
                r2.multiplier.should.be.approximately(r1.multiplier, 0.001);
            }
        }

        done();
    });
};

/* ========================================================================= */
/* ================================= TESTS ================================= */
/* ========================================================================= */

describe("The server\'s", function () {

    before(function () {
        server.start();
    });

    beforeEach(function (done) {
        test_get("reset", rmns.RESET_OK(), done);
    });

    describe("stats endpoint", function() {

        it("should return the correct 200", function(done) {

            test_get("stats", rmns.STATS_OK(0,0), done);
        });
    });

    describe("points endpoint", function() {

        it("should only allow array object type", function(done) {

            test_post("points", rmns.POINTS_ERROR(), {"Not": "Array"}, done);
        });

        it("should not allow empty point arrays", function(done) {

            test_post("points", rmns.POINTS_ERROR(), [], done);
        });

        it("should not allow arrays not multiples of three", function(done) {

            test_post("points", rmns.POINTS_ERROR(), [1,2,3,4], done);
        });

        it("should not allow arrays with strings", function(done) {

            test_post("points", rmns.POINTS_ERROR(), [1,2.0,"three"], done);
        });

        it("should register one point correctly", function(done) {

            test_post("points", rmns.POINTS_OK(1,1), [1,2,3], done);
        });

        it("should accumulate points correctly", function(done) {

            test_post("points", rmns.POINTS_OK(1,1), [1,2,3], function() {

                var points = [1,4,7,2,5,8,3,6,9];
                test_post("points", rmns.POINTS_OK(3,4), points, function() {

                    points = [0.0,1.0,2.0];
                    test_post("points", rmns.POINTS_OK(1,5), points, done);
                });
            });
        });

        it("should refesh points correctly", function(done) {

            var points = [6,6,6,6,6,6];
            test_post("points", rmns.POINTS_OK(2,2), points, function() {

                test_get("reset", rmns.RESET_OK(), function() {

                    var points = [0.0,1.0,2.0];
                    test_post("points", rmns.POINTS_OK(1,1), points, done);
                });
            });
        });
    });

    describe("spheres endpoint", function() {

        it("should only allow array object type", function(done) {

            test_post("spheres", rmns.SPHERES_ERROR(), {"Not": "Array"}, done);
        });

        it("should not allow empty arrays", function(done) {

            test_post("spheres", rmns.SPHERES_ERROR(), [], done);
        });

        it("should guarantee that all sphere data is complete", function(done) {

            var spheres = [
                tools.build_sphere(123,5,1,2,3),
                tools.build_sphere(345,10,4,5,6),
                tools.build_sphere(222,1,8,9,1)
            ];

            delete spheres[1]["radius"];
            test_post("spheres", rmns.SPHERES_ERROR(), spheres, done);
        });

        it("should guarantee that all sphere data is correct", function(done) {

            var spheres = [
                tools.build_sphere(123,5,1,2,3),
                tools.build_sphere(345,10,4,5,6),
                tools.build_sphere(222,1,null,9,1)
            ];

            test_post("spheres", rmns.SPHERES_ERROR(), spheres, done);
        });

        it("should register spheres correctly", function(done) {

            var spheres = [
                tools.build_sphere(123,5,1,2,3),
                tools.build_sphere(345,10,4,5,6),
                tools.build_sphere(222,1,7,9,1)
            ];

            test_post("spheres", rmns.SPHERES_OK(3,3), spheres, done);
        });

        it("should acumulate spheres correctly", function(done) {

            var spheres = [
                tools.build_sphere(123,5,1,2,3),
                tools.build_sphere(345,10,4,5,6),
                tools.build_sphere(222,1,7,9,1)
            ];

            test_post("spheres", rmns.SPHERES_OK(3,3), spheres, function() {

                for(var key in spheres)
                    spheres[key].id++;

                test_post("spheres", rmns.SPHERES_OK(3,6), spheres, function() {

                    for(var key in spheres)
                        spheres[key].id++;

                    test_post("spheres", rmns.SPHERES_OK(3,9), spheres, done);
                });
            });
        });

        it("should refresh spheres correctly", function(done) {

            var spheres = [
                tools.build_sphere(123,5,1,2,3),
                tools.build_sphere(345,10,4,5,6),
                tools.build_sphere(222,1,7,9,1)
            ];

            test_post("spheres", rmns.SPHERES_OK(3,3), spheres, function() {

                test_get("reset", rmns.RESET_OK(), function() {

                    test_post("spheres", rmns.SPHERES_OK(3,3), spheres, done);
                });
            });
        });

        it("should update spheres correctly", function(done) {

            var spheres = [
                tools.build_sphere(123,5,1,2,3),
                tools.build_sphere(345,10,4,5,6),
                tools.build_sphere(222,1,7,9,1)
            ];

            test_post("spheres", rmns.SPHERES_OK(3,3), spheres, function() {

                spheres[0].id++;
                test_post("spheres", rmns.SPHERES_OK(3,4), spheres, function() {

                    spheres[2].id++;
                    test_post("spheres", rmns.SPHERES_OK(3,5), spheres, done);
                });
            });
        });
    });

    describe("reset endpoint", function() {

        it("should return the correct 200", function(done) {

            test_get("reset", rmns.RESET_OK(), done);
        });
    });

    describe("nearest_point endpoint", function() {

        it("should return the the correct nearest point", function(done) {

            var points = [10,10,10,5,5,5,0,0,0];
            test_post("points", rmns.POINTS_OK(3,3), points, function() {

                test_get("stats", rmns.STATS_OK(3,0), function() {

                    const nearest = utils.vec3(0,0,0);
                    const result = {"found": true, "nearest": nearest, "distance": 1};
                    test_post("nearest_point", rmns.NEAREST_POINT_OK(result), {'eye': {'x': 1, 'y': 0, 'z': 0}}, function() {
                        done();
                    });
                });
            });
        });
    });

    describe("velocity endpoint", function() {

        it("should not allow array as input", function(done) {

            var input = ["Array", "Input"];
            test_post("velocity", rmns.VELOCITY_ERROR(), input, done);
        });

        it("should not allow empty inputs", function(done) {

            test_post("velocity", rmns.VELOCITY_ERROR(), {}, done);
        });

        it("should guarantee that all input data is complete", function(done) {

            var vec3 = tools.build_vec3(1,2,3);
            delete vec3["y"];

            test_post("velocity", rmns.VELOCITY_ERROR(), vec3, done);
        });

        it("should guarantee that all input data is correct", function(done) {

            var vec3 = tools.build_vec3(1,2,"3");

            test_post("velocity", rmns.VELOCITY_ERROR(), vec3, done);
        });

        it("should calculate the velocity correctly", function(done) {

            var points = [10,10,10,5,5,5,0,0,0];
            var pos = tools.build_vec3(-3,-4,0);
            var nearest = tools.build_vec3(0,0,0);

            test_post("points", rmns.POINTS_OK(3,3), points, function() {

                var camera = tools.build_camera(
                    pos,
                    tools.build_vec3(100,100,100),
                    tools.build_vec3(0,1,0),
                    60.0, 16.0/9.0, 0.1, 100
                );

                var res = tools.build_velocity_result(
                    5, 1, 1, 5, nearest, nearest
                );

                test_velocity(res, camera, done);
            });
        });

        it("should ignore the visible object heuristic correctly", function(done) {

            var points = [10,0,0,5,0,0,0,0,0];
            var pos = tools.build_vec3(1,0,0);
            var nearest = tools.build_vec3(0,0,0);

            test_post("points", rmns.POINTS_OK(3,3), points, function() {

                var camera = tools.build_camera(
                    pos,
                    tools.build_vec3(20,0,0),
                    tools.build_vec3(0,1,0),
                    60.0, 16.0/9.0, 0.1, 100
                );
                camera.ignoreHeuristic = true;

                var res = tools.build_velocity_result(
                    1, undefined, 1, 1, nearest, undefined
                );

                test_velocity(res, camera, done);
            });
        });

        it("should calculate the multiplier correctly", function(done) {

            var points = [0,0,200,0,0,10,0,0,5,0,0,0,0,0,-5];
            var pos = tools.build_vec3(0,0,-4);
            var nearest = tools.build_vec3(0,0,-5);
            var vnearest = tools.build_vec3(0,0,0);

            test_post("points", rmns.POINTS_OK(5,5), points, function() {

                var camera = tools.build_camera(
                    pos,
                    tools.build_vec3(0,0,100),
                    tools.build_vec3(0,1,0),
                    60.0, 16.0/9.0, 0.1, 100
                );

                var res = tools.build_velocity_result(
                    2, -1, 2, 1, nearest, vnearest
                );

                test_velocity(res, camera, done);
            });
        });

        it("should calculate the cosine similarity correctly", function(done) {

            var points = [0,0,200,0,0,10,0,0,5,0,0,0,0,-1,-5];
            var pos = tools.build_vec3(0,0,-5);
            var nearest = tools.build_vec3(0,-1,-5);
            var vnearest = tools.build_vec3(0,0,0);

            test_post("points", rmns.POINTS_OK(5,5), points, function() {

                var camera = tools.build_camera(
                    pos,
                    tools.build_vec3(0,0,100),
                    tools.build_vec3(0,1,0),
                    60.0, 16.0/9.0, 0.1, 100
                );

                var res = tools.build_velocity_result(
                    1.5, 0, 1.5, 1, nearest, vnearest
                );

                test_velocity(res, camera, done);
            });
        });

        it("should calculate the velocity correctly with spheres",
        function(done) {

            var points = [0,0,10,0,0,5,0,0,0];
            var spheres = [
                tools.build_sphere(123,3,0,10,-5),
                tools.build_sphere(345,2,0,-40,25),
                tools.build_sphere(222,1,0,0,-7)
            ];

            var pos = tools.build_vec3(0,0,-5);
            var nearest = tools.build_vec3(0,0,-6);
            var vnearest = tools.build_vec3(0,0,0);

            test_post("points", rmns.POINTS_OK(3,3), points, function() {

                test_post("spheres", rmns.SPHERES_OK(3,3), spheres, function() {

                    var camera = tools.build_camera(
                        pos,
                        tools.build_vec3(0,0,100),
                        tools.build_vec3(0,1,0),
                        60.0, 16.0/9.0, 0.1, 100
                    );

                    var res = tools.build_velocity_result(
                        2, -1, 2, 1, nearest, vnearest
                    );

                    test_velocity(res, camera, function() {

                        camera.center = tools.build_vec3(0,100,0);
                        vnearest = tools.build_vec3(0,7,-5);

                        res = tools.build_velocity_result(
                            1.5, 0, 1.5, 1, nearest, vnearest
                        );

                        test_velocity(res, camera, function() {

                            camera.center = tools.build_vec3(0,-10,0);
                            vnearest = tools.build_vec3(0,-38.4, 23.8);

                            res = tools.build_velocity_result(
                                1.8, -0.6, 1.8, 1, nearest, vnearest
                            );

                            test_velocity(res, camera, done);
                        });
                    });
                });
            });
        });
    });

    describe("unexistant endpoints", function() {

        it("should return the expected 404", function(done) {

            test_get("invalid_endpoint", rmns.NOT_FOUND(), done);
        });
    });

    after(function () {
        server.close();
    });
});
