var express = require("express");
const router = express.Router();
let PaymentController = require("../app/controller/Payment");
let { Authorize, Authenticate } = require('../app/utility/utils');
router.use(Authenticate);

router.get("/:campaign/:amount", (req, res) => {
    console.log("paying");

    PaymentController.generatePaymentLink(req.ctx, { amount: Number(req.params.amount), campaign: req.params.campaign }).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
})

router.post("/hook", (req, res) => {
    console.log("paying");

    PaymentController.hook(req).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
})

module.exports = router;