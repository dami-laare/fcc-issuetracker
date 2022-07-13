const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
require("dotenv").config();

chai.use(chaiHttp);

const expectedFields = [
  "_id",
  "issue_title",
  "issue_text",
  "created_by",
  "assigned_to",
  "status_text",
  "created_on",
  "updated_on",
  "open",
];

suite("Functional Tests", function () {
  suite("POST requests to server", function () {
    test("Create a issue with all fields", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_title: "test",
          issue_text: "test",
          created_by: "test",
          assigned_to: "test",
          status_text: "test",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          Object.keys(res.body).forEach((el, i) => {
            assert.strictEqual(el, expectedFields[i]);
          });
        });
      done();
    });
    test("Create a issue with required fields", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_title: "test",
          issue_text: "test",
          created_by: "test",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          Object.keys(res.body).forEach((el, i) => {
            assert.strictEqual(el, expectedFields[i]);
          });
        });
      done();
    });
    test("Create a issue with missing required fields", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_title: "test",
          issue_text: "test",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          assert.strictEqual(res.body.error, "required field(s) missing");
        });
      done();
    });
  });
  suite("GET requests", function () {
    test("Get issues for a project", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          assert.isArray(res.body, "Response is an array");
          done();
        });
    });

    test("Get issues with one filter", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .query({ created_by: "test" })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          assert.isArray(res.body);
          done();
        });
    });

    test("Get issues with multiple filters", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .query({ created_by: "temitayo", open: true })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          assert.isArray(res.body);
          done();
        });
    });
  });

  suite("PUT requests", function () {
    test("Update a single field", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id: "62ce81a22c140d39715b032b",
          created_by: "Rotimi",
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.body.result, "successfully updated");
          done();
        });
    });
    test("Update multiple fields", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id: "62ce81a22c140d39715b032b",
          created_by: "Rotimi",
          assigned_to: "Damilare",
          status_text: "Updating stuff",
          issue_title: "Tesiting udates nowwww",
          issue_text: "Testing update",
          open: "false",
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.body.result, "successfully updated");
          done();
        });
    });
    test("Update a single field with missing ID", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          created_by: "Rotimi",
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.body.error, "missing _id");
          done();
        });
    });
    test("Update an issue field with no fields", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id: "62cdd8e9035100b488745337",
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.isOk(res.body.error);
          done();
        });
    });
    test("Update a single field with invalid ID", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id: "jhicekbfjrefef",
          created_by: "Rotimi",
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.body.error, "could not update");
          done();
        });
    });
  });

  suite("DELETE requests", function () {
    test("Deletes an issue with a valid ID", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id: process.env.ID,
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.body.result, "successfully deleted");
          done();
        });
    });
    test("Deletes an issue with a invalid ID", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id: "62cde0850119240d41e",
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.body.error, "could not delete");
          done();
        });
    });
    test("Deletes an issue without an ID", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({})
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.body.error, "missing _id");
          done();
        });
    });
  });
});
