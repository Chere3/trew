/* eslint-disable camelcase */
'use strict';

module.exports.up = function (pgm) {
  // Create chat table
  pgm.createTable('chat', {
    id: { type: 'text', primaryKey: true },
    userId: { type: 'text', notNull: true },
    title: { type: 'text' },
    summary: { type: 'text' },
    createdAt: { type: 'bigint' },
    updatedAt: { type: 'bigint' },
    archivedAt: { type: 'bigint' },
    deletedAt: { type: 'bigint' },
  });

  // Add foreign key constraint for chat.userId -> user.id
  pgm.addConstraint('chat', 'chat_userId_fkey', {
    foreignKeys: {
      columns: 'userId',
      references: '"user"(id)',
      onDelete: 'CASCADE',
    },
  });

  // Create message table
  pgm.createTable('message', {
    id: { type: 'text', primaryKey: true },
    chatId: { type: 'text', notNull: true },
    role: { type: 'text', notNull: true },
    content: { type: 'text', notNull: true },
    model: { type: 'text' },
    attachments: { type: 'text' },
    createdAt: { type: 'bigint' },
  });

  // Add foreign key constraint for message.chatId -> chat.id
  pgm.addConstraint('message', 'message_chatId_fkey', {
    foreignKeys: {
      columns: 'chatId',
      references: 'chat(id)',
      onDelete: 'CASCADE',
    },
  });

  // Create token_usage table
  pgm.createTable('token_usage', {
    id: { type: 'text', primaryKey: true },
    messageId: { type: 'text', notNull: true },
    chatId: { type: 'text', notNull: true },
    userId: { type: 'text', notNull: true },
    model: { type: 'text', notNull: true },
    provider: { type: 'text', notNull: true },
    promptTokens: { type: 'integer', notNull: true, default: 0 },
    completionTokens: { type: 'integer', notNull: true, default: 0 },
    totalTokens: { type: 'integer', notNull: true, default: 0 },
    cachedTokens: { type: 'integer', default: 0 },
    reasoningTokens: { type: 'integer', default: 0 },
    cost: { type: 'real', default: 0 },
    latency: { type: 'integer' },
    createdAt: { type: 'bigint', notNull: true },
  });

  // Add foreign key constraints for token_usage
  pgm.addConstraint('token_usage', 'token_usage_messageId_fkey', {
    foreignKeys: {
      columns: 'messageId',
      references: 'message(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('token_usage', 'token_usage_chatId_fkey', {
    foreignKeys: {
      columns: 'chatId',
      references: 'chat(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('token_usage', 'token_usage_userId_fkey', {
    foreignKeys: {
      columns: 'userId',
      references: '"user"(id)',
      onDelete: 'CASCADE',
    },
  });

  // Create user_semantic_memory table
  pgm.createTable('user_semantic_memory', {
    userId: { type: 'text', primaryKey: true },
    facts: { type: 'text', notNull: true },
    updatedAt: { type: 'bigint', notNull: true },
  });

  // Add foreign key constraint for user_semantic_memory.userId -> user.id
  pgm.addConstraint('user_semantic_memory', 'user_semantic_memory_userId_fkey', {
    foreignKeys: {
      columns: 'userId',
      references: '"user"(id)',
      onDelete: 'CASCADE',
    },
  });

  // Create indexes for token_usage
  pgm.createIndex('token_usage', 'userId', { name: 'idx_token_usage_userId' });
  pgm.createIndex('token_usage', 'chatId', { name: 'idx_token_usage_chatId' });
  pgm.createIndex('token_usage', 'messageId', { name: 'idx_token_usage_messageId' });
  pgm.createIndex('token_usage', 'model', { name: 'idx_token_usage_model' });
  pgm.createIndex('token_usage', 'createdAt', { name: 'idx_token_usage_createdAt' });
  pgm.createIndex('token_usage', ['userId', 'createdAt'], { name: 'idx_token_usage_userId_createdAt' });
  pgm.createIndex('token_usage', ['chatId', 'createdAt'], { name: 'idx_token_usage_chatId_createdAt' });
};

module.exports.down = function (pgm) {
  pgm.dropTable('user_semantic_memory');
  pgm.dropTable('token_usage');
  pgm.dropTable('message');
  pgm.dropTable('chat');
};
