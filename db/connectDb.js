require("dotenv").config();
const { MongoClient } = require("mongodb");

module.exports = async (cb) => {
  const uri = process.env.MONGO_URI;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const connection = await client.connect();

    console.log(
      `Successfully connected to HOST: ${connection.s.options.srvHost}`
    );

    await cb(client);
  } catch (err) {
    console.log(err);
    throw new Error("Unable to connect to mongodb database");
  }
};
