const AuditLog = require('../models/AuditLog');

const logAction = async (userId, action, entity, entityId, oldValue = null, newValue = null, req = null) => {
  try {
    const ipAddress = req ? req.ip : null;
    const userAgent = req ? req.get('User-Agent') : null;

    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

module.exports = { logAction };
