require("should");
require("should-http");

var server  = require("../lib/index.js");
var rmns = require("../lib/rmns.js");
var tools = require("./tools.js")
var request = require("request");

/* ================ HELPER METHODS =============== */

var test_get = function(endpoint, expected_res, done) {

    request.get("http://localhost:8081/" + endpoint, function(err, res, body) {

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
    data.url  = "http://localhost:8081/" + endpoint;
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

            (body.result === undefined).should.be.false();
            body.result.should.be.eql(expected_res.result);
        }

        done();
    });
};

/* =================== TESTS ================== */

describe("The server\'s", function () {

    before(function () {
        server.listen(8081);
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

            test_get("reset", rmns.RESET_OK(), function() {

                test_post("points", rmns.POINTS_OK(1,1), [1,2,3], function() {

                    test_post("points", rmns.POINTS_OK(3,4), [1,4,7,2,5,8,3,6,9], function() {

                        test_post("points", rmns.POINTS_OK(1,5), [0.0,1.0,2.0], done);
                    });
                });
            });
        });

        it("should refesh points correctly", function(done) {

            test_get("reset", rmns.RESET_OK(), function() {

                test_post("points", rmns.POINTS_OK(2,2), [6,6,6,6,6,6], function() {

                    test_get("reset", rmns.RESET_OK(), function() {

                        test_post("points", rmns.POINTS_OK(1,1), [0.0,1.0,2.0], done);
                    });
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

            test_get("reset", rmns.RESET_OK(), function() {

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
        });

        it("should refresh spheres correctly", function(done) {

            var spheres = [
                tools.build_sphere(123,5,1,2,3),
                tools.build_sphere(345,10,4,5,6),
                tools.build_sphere(222,1,7,9,1)
            ];

            test_get("reset", rmns.RESET_OK(), function() {

                test_post("spheres", rmns.SPHERES_OK(3,3), spheres, function() {

                    test_get("reset", rmns.RESET_OK(), function() {

                        test_post("spheres", rmns.SPHERES_OK(3,3), spheres, done);
                    });
                });
            });
        });

        it("should update spheres correctly", function(done) {

            var spheres = [
                tools.build_sphere(123,5,1,2,3),
                tools.build_sphere(345,10,4,5,6),
                tools.build_sphere(222,1,7,9,1)
            ];

            test_get("reset", rmns.RESET_OK(), function() {

                test_post("spheres", rmns.SPHERES_OK(3,3), spheres, function() {

                    spheres[0].id++;

                    test_post("spheres", rmns.SPHERES_OK(3,4), spheres, function() {

                        spheres[2].id++;

                        test_post("spheres", rmns.SPHERES_OK(3,5), spheres, done);
                    });
                });
            });
        });
    });

    describe("reset endpoint", function() {

        it("should return the correct 200", function(done) {

            test_get("reset", rmns.RESET_OK(), done);
        });
    });

    describe("velocity endpoint", function() {

        it("should not allow array as input", function(done) {

            test_post("velocity", rmns.VELOCITY_ERROR(), ["Array", "Input"], done);
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

                test_post("velocity", rmns.VELOCITY_OK(5,nearest), pos, done);
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
