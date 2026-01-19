// config/database.js - PRODUCTION OPTIMIZED

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const options = {
            // Connection pool settings for production
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            
            // Retry settings
            retryWrites: true,
            retryReads: true,
            
            // Compression for better performance
            compressors: ['zlib'],
            zlibCompressionLevel: 6
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log('✓ MongoDB connected');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        console.log(`🌍 Host: ${mongoose.connection.host}`);
        
        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✓ MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('✗ MongoDB connection failed:', error.message);
        
        // Retry connection after 5 seconds in production
        if (process.env.NODE_ENV === 'production') {
            console.log('⏳ Retrying connection in 5 seconds...');
            setTimeout(connectDB, 5000);
        } else {
            process.exit(1);
        }
    }
};

export default connectDB;