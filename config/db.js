import mongoose from 'mongoose';

const connectToMongo = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("Database URL is not defined!");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        throw error;
    }
};

export default connectToMongo;
