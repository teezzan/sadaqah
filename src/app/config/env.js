const dotenv = require('dotenv');
dotenv.config();
env = {}
if (process.env.NODE_ENV == "test") {
    env = {
    };
}
else if (process.env.NODE_ENV == "development") {
    env = {
    };
}

else if (process.env.NODE_ENV == "production") {
    env = {
    };
}
module.exports = env;
