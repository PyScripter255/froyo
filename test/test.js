var assert = require("assert"),
froyo = require("../froyo"),
request = require("supertest");

describe("froyo", function () {
    var app = froyo.app();
    describe("#app", function () {
        it("should use middleware", function (done) {
            app.use(froyo.static("./"));
            done();
        })
        it('should serve requests', function (done) {
            function namer(req, res) {
                res.writeHead(200, { "Content-Type": "text/plain" })
                assert.equal(req.params.name, "bob");
                res.end(req.params.name)
            };
            app.use(function (req, res, err) {
                "pass"
            })
            app.scoop({
                '/name/:name': namer
            });

            request(app)
            .get("/name/bob")
            .expect(200)
            .expect("Content-Type", "text/plain")
            .expect("bob")
            .end(function (err, res) {
                if (err) done(err);
                else done();
            });
        })
        it("should have get and posts methods", function (done) {
            var index = {
                get: function (req, res) {
                    res.writeHead(200)
                    res.end("Hi")
                },
                post: function (req, res) {
                    res.writeHead(200)
                    req.on("data", function (d) {
                        assert.equal(d, "hi", "The post data should be hi")
                    })
                    res.end("hi")
                }
            }
            app.scoop({
                '/': index
            });
            request(app)
            .get("/")
            .expect(200)
            .expect("Hi")

            request(app)
            .post("/")
            .send("hi")
            .end(function (err, res) {
                if (err) done(err);
                else done();
            });
        })
    })
    describe("#static", function () {
        it("should compile mustache templates", function (done) {
            function index(req, res) {
                res.render("./test.html", "mustache", { me: { name: "bob"} });
            }
            app.scoop({
                '/': index
            });
            request(app)
            .get("/")
            .expect(200)
            .expect("Content-Type", "text/html")
            .expect("<!doctype html><html><body>Hi bob</body></html>")
             .end(function (err, res) {
                 assert.equal(res.body, "<!doctype html><html><body>Hi bob</body></html>", "The template didn't render right")
                 if (err) done(err);
                 else done();
             });
            done();
        })
    })
})
