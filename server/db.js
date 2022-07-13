const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');

module.exports = async() => {
  const connectionParams = {
    useNewUrlParser: true,
		useUnifiedTopology: true,
		serverApi: ServerApiVersion.v1
  };
	try {
		await mongoose.connect(process.env.DB, connectionParams);
		console.log("Connected to the database");
	} catch (error) {
		console.log("Error: Could not connect to the database " + error.message);
	}
}