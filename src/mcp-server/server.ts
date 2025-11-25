/**
 * MCP Server for Cursor
 * 
 * Provides approval and session tracking tools via MCP protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Store } from '../storage/index.js';
import { ApprovalHandler } from './approval-handler.js';
import type {
  RequestApprovalParams,
  ListApprovalsParams,
  ApproveParams,
  DenyParams,
} from './types.js';

export class MCPServer {
  private server: Server;
  private store: Store;
  private approvalHandler: ApprovalHandler;

  constructor(store: Store) {
    this.store = store;
    this.approvalHandler = new ApprovalHandler(store);
    
    this.server = new Server(
      {
        name: 'cursor-layer',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'request_approval',
          description: 'Request approval to execute a tool. Returns approval ID that can be used with approve/deny tools.',
          inputSchema: {
            type: 'object',
            properties: {
              tool_name: {
                type: 'string',
                description: 'The name of the tool requesting permission',
              },
              tool_input: {
                type: 'object',
                description: 'The input to the tool',
              },
              tool_use_id: {
                type: 'string',
                description: 'Unique identifier for this tool use',
              },
              session_id: {
                type: 'string',
                description: 'Optional session ID for tracking',
              },
            },
            required: ['tool_name', 'tool_input', 'tool_use_id'],
          },
        },
        {
          name: 'list_approvals',
          description: 'List pending approvals. Optionally filter by session_id or status.',
          inputSchema: {
            type: 'object',
            properties: {
              session_id: {
                type: 'string',
                description: 'Optional session ID to filter by',
              },
              status: {
                type: 'string',
                enum: ['pending', 'approved', 'denied'],
                description: 'Optional status filter',
              },
            },
          },
        },
        {
          name: 'approve',
          description: 'Approve a pending approval request.',
          inputSchema: {
            type: 'object',
            properties: {
              approval_id: {
                type: 'string',
                description: 'The approval ID from request_approval',
              },
              comment: {
                type: 'string',
                description: 'Optional comment for the approval',
              },
            },
            required: ['approval_id'],
          },
        },
        {
          name: 'deny',
          description: 'Deny a pending approval request. Comment is required.',
          inputSchema: {
            type: 'object',
            properties: {
              approval_id: {
                type: 'string',
                description: 'The approval ID from request_approval',
              },
              comment: {
                type: 'string',
                description: 'Required reason for denial',
              },
            },
            required: ['approval_id', 'comment'],
          },
        },
        {
          name: 'log_session_start',
          description: 'Start tracking a new AI coding session',
          inputSchema: {
            type: 'object',
            properties: {
              session_id: {
                type: 'string',
                description: 'Unique session identifier',
              },
              run_id: {
                type: 'string',
                description: 'Unique run identifier',
              },
              query: {
                type: 'string',
                description: 'Initial user query',
              },
              working_dir: {
                type: 'string',
                description: 'Working directory for the session',
              },
            },
            required: ['session_id', 'run_id', 'query'],
          },
        },
        {
          name: 'log_session_end',
          description: 'End tracking a session',
          inputSchema: {
            type: 'object',
            properties: {
              session_id: {
                type: 'string',
                description: 'Session identifier',
              },
              cost_usd: {
                type: 'number',
                description: 'Estimated cost in USD',
              },
              duration_ms: {
                type: 'number',
                description: 'Session duration in milliseconds',
              },
            },
            required: ['session_id'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'request_approval': {
            const params = args as unknown as RequestApprovalParams;
            const response = await this.approvalHandler.requestApproval(
              params,
              params.session_id
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response, null, 2),
                },
              ],
            };
          }

          case 'list_approvals': {
            const params = args as ListApprovalsParams;
            const approvals = this.approvalHandler.listApprovals(params.session_id);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(approvals, null, 2),
                },
              ],
            };
          }

          case 'approve': {
            const params = args as unknown as ApproveParams;
            const response = this.approvalHandler.approve(params.approval_id, params.comment);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response, null, 2),
                },
              ],
            };
          }

          case 'deny': {
            const params = args as unknown as DenyParams;
            const response = this.approvalHandler.deny(params.approval_id, params.comment);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response, null, 2),
                },
              ],
            };
          }

          case 'log_session_start': {
            const { session_id, run_id, query, working_dir } = args as any;
            this.store.createSession({
              id: session_id,
              runId: run_id,
              query,
              status: 'starting',
              workingDir: working_dir,
              createdAt: new Date(),
              lastActivityAt: new Date(),
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ success: true, session_id }),
                },
              ],
            };
          }

          case 'log_session_end': {
            const { session_id, cost_usd, duration_ms } = args as any;
            this.store.updateSession(session_id, {
              status: 'completed',
              completedAt: new Date(),
              costUSD: cost_usd,
              durationMs: duration_ms,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ success: true, session_id }),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
          isError: true,
        };
      }
    });

    // Resources (empty for now)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [],
    }));
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Cursor Layer MCP server started');
  }
}

