var express = require("express");
const router = express.Router();
let UserController = require("../app/controller/User");
let { Authorize, Authenticate } = require('../app/utility/utils');
router.use(Authenticate);

router.get("/", (req, res) => {
    UserController.greet().then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
})


router.post("/register", (req, res) => {
    UserController.create(req.body).then((response) => {
        res.status(201).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
});

router.post("/login", (req, res) => {
    UserController.login(req.body).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
});

router.post("/forgetpassword", (req, res) => {
    UserController.forgetPassword(req.body).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
});



router.get("/verify", (req, res) => {
    UserController.verifyPasswordToken(req.query).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
});



router.post("/change_pass", (req, res) => {
    UserController.changePassword(req.body).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
});

router.get("/me", Authorize, (req, res) => {
    UserController.me(req.ctx).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
});

router.post("/updateme", Authorize, (req, res) => {

    UserController.editUser(req.ctx, req.body).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
});

router.get("/authfail", (req, res) => {
    res.status(400).json({ message: "Access Denied" });
})

router.post("/add_account", Authorize, (req, res) => {

    UserController.addAccountNumber(req.ctx, req.body).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
});




module.exports = router;