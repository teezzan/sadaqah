var express = require("express");
const router = express.Router();
let UserController = require("../app/controller/User");
let { Authorize, Authenticate } = require('../app/utility/utils');
router.use(Authenticate);



module.exports = router;