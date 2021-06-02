var express = require("express");
const router = express.Router();
let PaymentController = require("../app/controller/Payment");
let { Authorize, Authenticate } = require('../app/utility/utils');
router.use(Authenticate);

router.get("/:campaign/:amount/:type", (req, res) => {
    console.log("paying");
    if (Number(req.params.type) < 0 || Number(req.params.type) > 2) {
        return res.status(422).json({ message: "Wrong Payment Type" });
    }

    PaymentController.generatePaymentLink(req.ctx, { amount: Number(req.params.amount), campaign: req.params.campaign, type: Number(req.params.type) }).then((response) => {
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