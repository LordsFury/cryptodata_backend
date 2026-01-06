import mongoose from 'mongoose';

const CoinSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    names: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    market_cap: {
        type: String,
        required: true
    },
    volume: {
        type: String,
        required: true
    },
    percent_change_1h: {
        type: Number,
        required: true
    },
    percent_change_24h: {
        type: Number,
        required: true
    },
    percent_change_7d: {
        type: Number,
        required: true
    },
    percent_change_30d: {
        type: Number,
        required: true
    },
    percent_change_1y: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    rank: {
            type: Number,
            required: true
    },
    symbol: {
        type: String,
        required: true,
        index: true
    },

}, { timestamps: true });

const CoinModel = mongoose.models.Coin || mongoose.model("Coin", CoinSchema);
export default CoinModel;