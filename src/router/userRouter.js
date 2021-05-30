var express = require("express");
const router = express.Router();
let UserController = require("../app/controller/User");


router.get("/", (req, res) => {
    UserController.greet().then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
})

router.get("/login", (req, res) => {
    UserController.greet().then((response) => {
        res.status(200).json({ response: "login page" });
    }).catch(err => {
        res.status(err.code).json(err);
    })
})

router.get("/authfail", (req, res) => {
    res.status(400).json({ message: "Access Denied" });
})





module.exports = router;