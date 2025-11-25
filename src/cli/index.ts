#!/usr/bin/env node
/**
 * Cursor Layer CLI
 * 
 * Usage:
 *   cursor-layer mcp serve    - Start MCP server
 *   cursor-layer approvals list - List pending approvals
 *   cursor-layer approvals approve <id> - Approve an approval
 *   cursor-layer approvals deny <id> <reason> - Deny an approval
 *   cursor-layer sessions list - List sessions
 */

import { Command } from 'commander';
import { Store } from '../storage/index.js';
import { MCPServer } from '../mcp-server/server.js';
import { ApprovalHandler } from '../mcp-server/approval-handler.js';

const program = new Command();

program
  .name('cursor-layer')
  .description('AI orchestration tools for Cursor IDE')
  .version('0.1.0');

// MCP server command
program
  .command('mcp')
  .argument('<action>', 'Action: serve')
  .description('MCP server commands')
  .action(async (action: string) => {
    if (action === 'serve') {
      const store = new Store();
      const server = new MCPServer(store);
      await server.start();
    } else {
      console.error(`Unknown action: ${action}`);
      process.exit(1);
    }
  });

// Approvals list command
program
  .command('approvals:list')
  .alias('approvals list')
  .description('List pending approvals')
  .option('-s, --session-id <id>', 'Filter by session ID')
  .action((options: { sessionId?: string }) => {
    const store = new Store();
    const handler = new ApprovalHandler(store);
    const approvals = handler.listApprovals(options.sessionId);
    
    if (approvals.length === 0) {
      console.log('No pending approvals');
      return;
    }

    console.log(`\n${approvals.length} pending approval(s):\n`);
    approvals.forEach((approval) => {
      console.log(`  ID: ${approval.id}`);
      console.log(`  Tool: ${approval.toolName}`);
      console.log(`  Session: ${approval.sessionId}`);
      console.log(`  Created: ${approval.createdAt.toISOString()}`);
      console.log('');
    });
  });

// Approvals approve command
program
  .command('approvals:approve')
  .alias('approvals approve')
  .argument('<id>', 'Approval ID')
  .description('Approve an approval request')
  .option('-c, --comment <text>', 'Optional comment')
  .action((id: string, options: { comment?: string }) => {
    const store = new Store();
    const handler = new ApprovalHandler(store);
    try {
      const response = handler.approve(id, options.comment);
      console.log('Approved:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Approvals deny command
program
  .command('approvals:deny')
  .alias('approvals deny')
  .argument('<id>', 'Approval ID')
  .argument('<reason>', 'Reason for denial')
  .description('Deny an approval request')
  .action((id: string, reason: string) => {
    const store = new Store();
    const handler = new ApprovalHandler(store);
    try {
      const response = handler.deny(id, reason);
      console.log('Denied:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Sessions list command
program
  .command('sessions:list')
  .alias('sessions list')
  .description('List recent sessions')
  .option('-l, --limit <number>', 'Limit results', '10')
  .action((options: { limit: string }) => {
    const store = new Store();
    const limit = parseInt(options.limit, 10);
    const sessions = store.listSessions(limit);
    
    if (sessions.length === 0) {
      console.log('No sessions found');
      return;
    }

    console.log(`\n${sessions.length} session(s):\n`);
    sessions.forEach((session) => {
      console.log(`  ID: ${session.id}`);
      const queryPreview = session.query.length > 60 
        ? session.query.substring(0, 60) + '...' 
        : session.query;
      console.log(`  Query: ${queryPreview}`);
      console.log(`  Status: ${session.status}`);
      console.log(`  Created: ${session.createdAt.toISOString()}`);
      if (session.costUSD) {
        console.log(`  Cost: $${session.costUSD.toFixed(4)}`);
      }
      console.log('');
    });
  });

program.parse();