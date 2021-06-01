var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const CampaignSchema = Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    assets: [{ type: String }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    target: { type: Number, required: true },
    duration: { type: Number, required: true },
    recurring: { type: Boolean, default: false },
    createdAt: { type: Date, default: new Date() }

}, { id: true });

CampaignSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

CampaignSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

const CampaignModel = mongoose.model("Campaign", CampaignSchema);
module.exports = CampaignModel