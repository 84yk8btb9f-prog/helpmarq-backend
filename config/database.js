import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const options = {
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            retryWrites: true,
            retryReads: true,
            heartbeatFrequencyMS: 10000,  // ← Add this
            serverSelectionTimeoutMS: 30000  // ← Increase this
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log('✓ MongoDB connected');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        
        // Only log errors and initial connection
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB error:', err);
        });

        // Remove the verbose reconnection logging
        // mongoose.connection.on('disconnected', () => {
        //     console.log('⚠️ MongoDB disconnected');
        // });

        // mongoose.connection.on('reconnected', () => {
        //     console.log('✓ MongoDB reconnected');
        // });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB closed');
            process.exit(0);
        });

    } catch (error) {
        console.error('✗ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;