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
        JWT_SECRET: process.env.JWT_SECRET || "jwt-test-secret",
        PASSWORD_RESET_JWT_SECRET: process.env.PASSWORD_RESET_JWT_SECRET || "jwt-PASSWORD-secret",
        MONGO_URL: process.env.MONGO_URI,
        server: process.env.SERVER || "localhost:8010"
    };
}

else if (process.env.NODE_ENV == "production") {
    env = {
    };
}
module.exports = env;
