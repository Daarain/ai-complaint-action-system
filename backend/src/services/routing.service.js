const Department = require('../models/Department');

const routes = {
  Pothole: 'roads-department',
  'Road Damage': 'roads-department',
  Garbage: 'sanitation-department',
  Streetlight: 'electrical-department',
  'Water Leak': 'water-department',
  Other: 'general-civic-department',
};

async function routeDepartment(issueTypeName) {
  const slug = routes[issueTypeName] || routes.Other;
  return Department.findOne({ slug });
}

module.exports = { routeDepartment, routes };
