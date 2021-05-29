var express = require("express");
const router = express.Router();
let UserController = require("../app/controller/user");

router.get("/greet", (req, res) => {
    UserController.greet().then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
})

module.exports = router;