import connectDB from './mongodb.js';
import Log from '../models/Log.js';

export async function createLog(type, user, action, details, metadata = {}) {
  try {
    await connectDB();
    await Log.create({
      type,
      user,
      action,
      details,
      metadata
    });
  } catch (error) {
    console.error('Failed to create log:', error);
  }
}

export async function logLogin(email) {
  await createLog('INFO', email, 'Login', `User ${email} logged in`);
}

export async function logEmailSent(to, subject) {
  await createLog('SUCCESS', 'System', 'Email', `Email sent to ${to}: ${subject}`);
}

export async function logError(action, error, user = 'System') {
  await createLog('ERROR', user, action, error.message, { stack: error.stack });
}
