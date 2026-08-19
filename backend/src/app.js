const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { success } = require('./utils/response');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/api/health', (req, res) => success(res, {
  api: 'running',
  mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
}, 'API is running'));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/issue-types', require('./routes/issueType.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/status', require('./routes/status.routes'));
app.use('/api/media', require('./routes/media.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
