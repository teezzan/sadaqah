let express = require("express");
let app = express();
let UserRoute = require('./router/userRouter');
let CampaignRoute = require('./router/CampaignRouter');
let PayRoute = require('./router/PayRouter');
let cors = require('cors');
let db = require("./app/config/db");//

let port = process.env.PORT || 8010;
global.__root = __dirname + "/";

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

require('./app/utility/index')(app);
app.use('/user', UserRoute);
app.use('/campaign', CampaignRoute);
app.use('/pay', PayRoute);
app.listen(port, () => console.log("App listening at %s", port));
console.log("Server is listening");
