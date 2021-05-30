let mongoose = require("mongoose");
let env = require('./env');

mongoose.connect(
    env.MONGO_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },
    (err) => {
        if (err) {
            console.log("Failed to Connect");
        }
        else {
            console.log("Connection Successful ");
        }
    }
);