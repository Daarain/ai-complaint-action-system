const { PRIORITIES } = require('../utils/validators');

function calculatePriority({ issueType, description = '', area = '', aiPriority }) {
  const text = `${description} ${area}`.toLowerCase();
  let priority = ['Water Leak', 'Road Damage'].includes(issueType) ? 'medium' : 'low';
  if (/(accident|immediate danger|emergency|injur|fire|flood|collapsed)/.test(text)) priority = 'critical';
  else if (/(danger|school|hospital|traffic|blocked|major|large)/.test(text)) priority = 'high';
  else if (aiPriority === 'high' && priority === 'low') priority = 'medium';
  return PRIORITIES.includes(priority) ? priority : 'medium';
}

module.exports = { calculatePriority };
