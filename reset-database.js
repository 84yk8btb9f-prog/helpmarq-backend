import 'dotenv/config';
import mongoose from 'mongoose';
import Project from './models/Project.js';
import Reviewer from './models/Reviewer.js';
import Application from './models/Application.js';
import Feedback from './models/Feedback.js';

async function resetDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        console.log('⚠️  WARNING: This will delete ALL data!');
        console.log('\nCollections to be cleared:');
        console.log('  - Projects');
        console.log('  - Reviewers');
        console.log('  - Applications');
        console.log('  - Feedback');
        console.log('  - Users (Better Auth)');
        console.log('  - Sessions (Better Auth)');
        console.log('  - Accounts (Better Auth)');
        console.log('\nStarting deletion in 3 seconds...\n');

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Delete helpmarq data
        console.log('🗑️  Deleting Projects...');
        const projectsDeleted = await Project.deleteMany({});
        console.log(`✓ Deleted ${projectsDeleted.deletedCount} projects`);

        console.log('🗑️  Deleting Reviewers...');
        const reviewersDeleted = await Reviewer.deleteMany({});
        console.log(`✓ Deleted ${reviewersDeleted.deletedCount} reviewers`);

        console.log('🗑️  Deleting Applications...');
        const applicationsDeleted = await Application.deleteMany({});
        console.log(`✓ Deleted ${applicationsDeleted.deletedCount} applications`);

        console.log('🗑️  Deleting Feedback...');
        const feedbackDeleted = await Feedback.deleteMany({});
        console.log(`✓ Deleted ${feedbackDeleted.deletedCount} feedback entries`);

        // Delete Better Auth data
        console.log('\n🗑️  Deleting Better Auth users...');
        const usersDeleted = await mongoose.connection.db.collection('user').deleteMany({});
        console.log(`✓ Deleted ${usersDeleted.deletedCount} users`);

        console.log('🗑️  Deleting Better Auth sessions...');
        const sessionsDeleted = await mongoose.connection.db.collection('session').deleteMany({});
        console.log(`✓ Deleted ${sessionsDeleted.deletedCount} sessions`);

        console.log('🗑️  Deleting Better Auth accounts...');
        const accountsDeleted = await mongoose.connection.db.collection('account').deleteMany({});
        console.log(`✓ Deleted ${accountsDeleted.deletedCount} accounts`);

        console.log('\n✅ Database completely reset!');
        console.log('\nSummary:');
        console.log(`  Projects: ${projectsDeleted.deletedCount}`);
        console.log(`  Reviewers: ${reviewersDeleted.deletedCount}`);
        console.log(`  Applications: ${applicationsDeleted.deletedCount}`);
        console.log(`  Feedback: ${feedbackDeleted.deletedCount}`);
        console.log(`  Users: ${usersDeleted.deletedCount}`);
        console.log(`  Sessions: ${sessionsDeleted.deletedCount}`);
        console.log(`  Accounts: ${accountsDeleted.deletedCount}`);
        console.log('\n⚠️  IMPORTANT: Clear browser localStorage and cookies!');
        console.log('   Run in browser console: localStorage.clear(); sessionStorage.clear();\n');

        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error resetting database:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

resetDatabase();