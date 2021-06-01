var express = require("express");
const router = express.Router();
let UserController = require("../app/controller/User");
let CampaignController = require("../app/controller/Campaign");
let { Authorize, Authenticate } = require('../app/utility/utils');
router.use(Authenticate);

router.get("/", (req, res) => {
    CampaignController.getAllCampaigns().then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
})
router.post("/create", (req, res) => {

    CampaignController.create(req.ctx, req.body).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
})

router.get("/:campaign", (req, res) => {

    CampaignController.getCampaign(req.ctx, req.params.campaign).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
})

router.delete("/:campaign", (req, res) => {

    CampaignController.deleteCampaign(req.ctx, req.params.campaign).then((response) => {
        res.status(201).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
})
router.post("/:id", (req, res) => {

    CampaignController.editCampaign(req.ctx, { ...req.body, id: req.params.id }).then((response) => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(err.code).json(err);
    })
})

module.exports = router;