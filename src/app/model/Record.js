var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const RecordSchema = Schema({
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    remitted: {
        status: { type: Boolean, default: false },
        Date: { type: Date }
    },
    total: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    createdAt: { type: Date, default: new Date() },
    contributions: [
        {
            amount: { type: Number, default: 0 },
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            email: { type: String, default: "*************@gmail.com" },
            date: { type: Date, default: new Date() },
            total_before: { type: Number, default: 0 },
            total_after: { type: Number, default: 0 },
        }
    ]

}, { id: true });

RecordSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

RecordSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

const RecordSchema = mongoose.model("Record", RecordSchema);
module.exports = UserModel