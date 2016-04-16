require("should");

var exec = require("child_process").exec
var test_type = process.env.NODE_ENV;
var slave1, slave2, master;

describe("The server\"s", function () {

    before(function(done) {
        
        if(test_type === undefined) {
            slave1 = exec("NODE_ENV=slave1 npm start", function(){});
            slave2 = exec("NODE_ENV=slave2 npm start", function(){});

            setTimeout(function() {
               done();    
            }, 100);
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
