const IssueType = require('../models/IssueType');

function fallbackAnalyze(description = '') {
  const text = description.toLowerCase();
  let issueType = 'Other';
  if (/(pothole|potholes)/.test(text)) issueType = 'Pothole';
  else if (/(garbage|trash|waste|dump)/.test(text)) issueType = 'Garbage';
  else if (/(streetlight|street light|lamp|dark road)/.test(text)) issueType = 'Streetlight';
  else if (/(water leak|leak|burst pipe|waterlogging)/.test(text)) issueType = 'Water Leak';
  else if (/(road damage|damaged road|crack|collapsed road)/.test(text)) issueType = 'Road Damage';

  const priority = /(accident|danger|emergency|injur|hospital|fire|flood)/.test(text) ? 'high'
    : /(large|major|many|school|traffic|blocked)/.test(text) ? 'medium' : 'low';
  return { issueType, priority, summary: description.trim().slice(0, 180) || 'Civic complaint submitted.', confidence: 0.5 };
}

async function analyzeComplaint(description) {
  const result = fallbackAnalyze(description);
  const exists = await IssueType.exists({ name: result.issueType });
  if (!exists) result.issueType = 'Other';
  return result;
}

module.exports = { analyzeComplaint, fallbackAnalyze };
