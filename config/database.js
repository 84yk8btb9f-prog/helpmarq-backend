import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const options = {
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 30000,
            heartbeatFrequencyMS: 30000,
            retryWrites: true,
            retryReads: true
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log('✓ MongoDB connected');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        
        // Only log critical errors
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB error:', err);
        });

        // Removed verbose reconnection logging
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected - attempting to reconnect...');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('✗ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;