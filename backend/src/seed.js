const connectDB = require('./config/db');
const Department = require('./models/Department');
const IssueType = require('./models/IssueType');
const { slugify } = require('./utils/validators');

const departments = [
  'Roads Department', 'Sanitation Department', 'Electrical Department',
  'Water Department', 'General Civic Department',
];
const issueTypes = ['Pothole', 'Road Damage', 'Garbage', 'Streetlight', 'Water Leak', 'Other'];

async function seed() {
  await connectDB();
  for (const name of departments) {
    await Department.updateOne({ slug: slugify(name) }, { $setOnInsert: { name, slug: slugify(name) } }, { upsert: true });
  }
  for (const name of issueTypes) {
    await IssueType.updateOne({ name }, { $setOnInsert: { name, category: 'Civic' } }, { upsert: true });
  }
  console.log('Seed data is ready.');
  process.exit(0);
}

seed().catch(() => {
  console.error('Seed failed.');
  process.exit(1);
});
