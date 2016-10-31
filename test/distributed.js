require("should");

var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
var test_type = process.env.NODE_ENV;
var slave1, slave2, master;

describe("The server\"s", function () {

    before(function(done) {
        
        if(test_type === undefined) {

            var env1 = Object.create( process.env );
            env1.NODE_ENV = 'slave1';
            slave1 = spawn("npm", ["start"], {"env": env1}, {"detached": true});

            var env2 = Object.create( process.env );
            env2.NODE_ENV = 'slave2';
            slave2 = spawn("npm", ["start"], {"env": env2}, {"detached": true});

            // Wait for slave servers to start before running master test
            setTimeout(function() {
               done();    
            }, 1000);
        }
        else {
            done();
        }
    });

    it("distributed setup should work seamlessly", function(done) {

        if(test_type === undefined) {

            master = exec("NODE_ENV=master mocha --timeout 10000 test/*.js",
                function(error, stdout, stderr) {

                    (error === null).should.be.true();
                    done(); 
                }
            );
        }
        else {
            done();
        }
    });

    after(function () {
        if(test_type === undefined) {
            slave1.kill("SIGINT");
            slave2.kill("SIGINT");
        }
    });
});
