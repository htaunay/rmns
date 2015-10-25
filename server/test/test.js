require("should");
require("should-http");

var server  = require("../lib/index.js");
var rmns = require("../lib/rmns.js");
var request = require("request");

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

var test_post = function(endpoint, expected_res, body, done) {

    var data  = {};
    data.url  = "http://localhost:8081/" + endpoint;
    data.headers = {"content-type" : "application/json"};
    data.body = JSON.stringify(body);

    request.post(data, function(err, res, body) {

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

            test_post('points', rmns.POINTS_ERROR(), {"Not": "Array"}, done);
        });

        it("should not allow empty point arrays", function(done) {

            test_post('points', rmns.POINTS_ERROR(), [], done);
        });

        it("should not allow arrays not multiples of three", function(done) {

            test_post('points', rmns.POINTS_ERROR(), [1,2,3,4], done);
        });

        it("should not allow arrays with strings", function(done) {

            test_post('points', rmns.POINTS_ERROR(), [1,2.0,"three"], done);
        });

        it("should register one point correctly", function(done) {

            test_post('points', rmns.POINTS_OK(1,1), [1,2,3], done);
        });

        it("should accumulate points correctly", function(done) {

            test_get("reset", rmns.RESET_OK(), function() {

                test_post('points', rmns.POINTS_OK(1,1), [1,2,3], function() {
                 
                    test_post('points', rmns.POINTS_OK(3,4), [1,4,7,2,5,8,3,6,9], function() {
                        
                        test_post('points', rmns.POINTS_OK(1,5), [0.0,1.0,2.0], done);
                    });   
                });
            });
        });

        it("should refesh points correctly", function(done) {

            test_get("reset", rmns.RESET_OK(), function() {

                test_post('points', rmns.POINTS_OK(2,2), [6,6,6,6,6,6], function() {
                 
                    test_get("reset", rmns.RESET_OK(), function() {
                        
                        test_post('points', rmns.POINTS_OK(1,1), [0.0,1.0,2.0], done);
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

    after(function () {
        server.close();
    });
});
