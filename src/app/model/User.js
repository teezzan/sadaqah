var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const UserSchema = Schema({
    googleId: { type: String, required: true, unique: true },
    avatar: { type: String, required: false },
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    bank_code: { type: Number, required: false },
    account_number: { type: Number, required: false },
    contributions: [
        {
            amount: { type: Number, default: 0 },
            campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
            record: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
            email: { type: String, default: "*************@gmail.com" },
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