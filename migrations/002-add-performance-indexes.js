/* eslint-disable camelcase */
'use strict';

module.exports.up = function (pgm) {
  // Index for chat table - optimize user chat list queries
  // Covers: WHERE userId = ? AND deletedAt IS NULL AND archivedAt IS ? ORDER BY updatedAt DESC
  pgm.createIndex('chat', ['userId', 'deletedAt', 'archivedAt', 'updatedAt'], {
    name: 'idx_chat_user_deleted_archived_updated',
    where: '"deletedAt" IS NULL',
  });

  // Index for message table - optimize message queries by chat
  // Covers: WHERE chatId = ? ORDER BY createdAt DESC/ASC
  pgm.createIndex('message', ['chatId', 'createdAt'], {
    name: 'idx_message_chat_created',
  });

  // Index for message table - optimize queries filtering by role
  // Covers: WHERE chatId = ? AND role = ? ORDER BY createdAt DESC
  pgm.createIndex('message', ['chatId', 'role', 'createdAt'], {
    name: 'idx_message_chat_role_created',
  });

  // Index for token_usage table - optimize stats aggregations by chat
  // Covers: WHERE chatId = ? AND createdAt >= ? AND createdAt <= ?
  pgm.createIndex('token_usage', ['chatId', 'createdAt'], {
    name: 'idx_token_usage_chat_created',
  });

  // Index for token_usage table - optimize stats aggregations by user
  // Covers: WHERE userId = ? AND createdAt >= ? AND createdAt <= ?
  pgm.createIndex('token_usage', ['userId', 'createdAt'], {
    name: 'idx_token_usage_user_created',
  });

  // Index for token_usage table - optimize stats aggregations by model
  // Covers: WHERE model = ? AND createdAt >= ? AND createdAt <= ?
  pgm.createIndex('token_usage', ['model', 'createdAt'], {
    name: 'idx_token_usage_model_created',
  });

  // Note: messageId index already exists from initial migration
  // This migration focuses on composite indexes for better query performance

  // Index for user_semantic_memory table - optimize user memory lookup
  // Covers: WHERE userId = ?
  pgm.createIndex('user_semantic_memory', ['userId'], {
    name: 'idx_user_semantic_memory_user',
    unique: true,
  });
};

module.exports.down = function (pgm) {
  pgm.dropIndex('chat', 'idx_chat_user_deleted_archived_updated');
  pgm.dropIndex('message', 'idx_message_chat_created');
  pgm.dropIndex('message', 'idx_message_chat_role_created');
  pgm.dropIndex('token_usage', 'idx_token_usage_chat_created');
  pgm.dropIndex('token_usage', 'idx_token_usage_user_created');
  pgm.dropIndex('token_usage', 'idx_token_usage_model_created');
  pgm.dropIndex('token_usage', 'idx_token_usage_message');
  pgm.dropIndex('user_semantic_memory', 'idx_user_semantic_memory_user');
};
