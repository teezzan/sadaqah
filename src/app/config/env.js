const dotenv = require('dotenv');
dotenv.config();
env = {}
if (process.env.NODE_ENV == "test") {
    env = {
    };
}
else if (process.env.NODE_ENV == "development") {
    env = {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    };
}

else if (process.env.NODE_ENV == "production") {
    env = {
    };
}
module.exports = env;
