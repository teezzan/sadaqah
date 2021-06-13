var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const UserSchema = Schema({
    googleId: { type: String, trim: true, required: true, unique: true },
    avatar: { type: String, required: false },
    name: { type: String, required: false },
    email: { type: String, trim: true, required: false, unique: true, sparse: true },
    password: { type: String, required: false },
    account_number: { type: String, required: false },
    bank_code: { type: String, required: false },
    bank_name: { type: String, required: false },
    account_name: { type: String, required: false },
    recipient_code: { type: String, required: false },
    contributions: [
        {
            amount: { type: Number, default: 0 },
            campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
            record: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
            date: { type: Date, default: new Date() },
            total_before: { type: Number, default: 0 },
            total_after: { type: Number, default: 0 },
        }
    ]

}, { id: true });


UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel