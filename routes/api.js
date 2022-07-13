"use strict";
const { ObjectId } = require("mongodb");

module.exports = function (app, database) {
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let project = req.params.project;

      const filter = {};

      Object.keys(req.query).forEach((query) => {
        if (query === "open") {
          switch (req.query.open) {
            case "true":
              filter.open = true;
              return;
            case "false":
              filter.open = false;
              return;
            default:
              return;
          }
        } else if (query === "created_on") {
          filter[query] = new Date(Date.now());
        } else {
          filter[query] = {
            $regex: `${req.query[query]}`,
            $options: "i",
          };
        }
      });
      await database
        .collection("issues")
        .find(
          {
            project,
            ...filter,
          },
          {
            projection: { project: 0 },
          }
        )
        .toArray((err, result) => {
          if (!err) {
            res.status(200).send(result);
          }
        });
    })

    .post(async function (req, res) {
      let project = req.params.project;

      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({
          error: "required field(s) missing",
        });
      }

      const issue = {
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to ? assigned_to : "",
        status_text: status_text ? status_text : "",
        created_on: new Date(Date.now()),
        updated_on: new Date(Date.now()),
        open: true,
        project,
      };

      await database
        .collection("issues")
        .insertOne({ ...issue })
        .then(async (doc, err) => {
          delete issue.project;

          await database.collection("issues").findOne(
            {
              _id: doc.insertedId,
            },
            {
              projection: { project: 0 },
            },
            (err, result) => {
              res.status(201).json({
                ...result,
              });
            }
          );
        })
        .catch((err) => {
          console.log(err);
        });
    })

    .put(async function (req, res) {
      let project = req.params.project;

      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      const bodyCopy = { ...req.body };

      delete bodyCopy._id;

      Object.keys(bodyCopy).forEach((el) => {
        if (!bodyCopy[el] && el !== "open") {
          delete bodyCopy[el];
        }
      });
      if (
        Object.keys(bodyCopy).length === 0 &&
        !Object.keys(bodyCopy).includes("open")
      ) {
        return res.json({ error: "no update field(s) sent", _id: _id });
      }

      const fields = Object.keys(req.body);

      if (fields.length <= 1 && !fields.includes("open")) {
        return res.json({ error: "could not update", _id });
      }
      const update = {};

      fields.forEach((el) => {
        if (el !== "_id" && req.body[el]) {
          if (el === "open") {
            switch (req.body.open) {
              case "true":
                update[el] = true;
                return;
              case "false":
                update[el] = false;
                return;
              default:
                return;
            }
          } else {
            update[el] = req.body[el];
          }
        }
      });

      try {
        await database
          .collection("issues")
          .findOneAndUpdate(
            { _id: new ObjectId(_id) },
            { $set: { ...update, updated_on: new Date(Date.now()) } },
            { returnDocument: "after" },
            (err, doc) => {
              if (err) {
                return res.json({ error: "could not update", _id });
              }

              if (!doc) {
                return res.json({ error: "could not update", _id });
              }
              res.status(201).json({ result: "successfully updated", _id });
            }
          );
      } catch (err) {
        res.json({ error: "could not update", _id });
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;

      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      try {
        await database.collection("issues").findOne(
          {
            _id: new ObjectId(_id),
          },
          async (err, doc) => {
            if (!doc) {
              return res.send({ error: "could not delete", _id });
            }
            if (err) {
              return res.send({ error: "could not delete", _id });
            }

            try {
              await database
                .collection("issues")
                .deleteOne({ _id: new ObjectId(_id) }, async (err) => {
                  if (err) {
                    return res.send({ error: "could not delete", _id });
                  }
                  await database.collection("issues").findOne(
                    {
                      _id: new ObjectId(_id),
                    },
                    (err, doc) => {
                      if (doc) {
                        return res.send({ error: "could not delete", _id });
                      }
                      if (err) {
                        return res.send({ error: "could not delete", _id });
                      }
                      res.send({ result: "successfully deleted", _id });
                    }
                  );
                });
            } catch (err) {
              return res.send({ error: "could not delete", _id });
            }
          }
        );
      } catch (err) {
        return res.send({ error: "could not delete", _id });
      }
    });
};
