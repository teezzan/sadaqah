var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const CardSchema = Schema({
    card_token: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: false, sparse: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    next_bill_date: { type: Date, required: true },
    campaign_title: { type: String, required: true },
    payment_type: { type: String, required: true, default: "single" }
}, { id: true });


CardSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

CardSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

const CardModel = mongoose.model("Card", CardSchema);
module.exports = CardModel