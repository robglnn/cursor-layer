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
import { AgentOrchestrator } from './agent-orchestrator.js';
import type {
  RequestApprovalParams,
  ListApprovalsParams,
  ApproveParams,
  DenyParams,
  SpawnAgentParams,
  GetAgentStatusParams,
  GetAgentResultsParams,
  ListAgentTasksParams,
} from './types.js';

export class MCPServer {
  private server: Server;
  private store: Store;
  private approvalHandler: ApprovalHandler;
  private agentOrchestrator: AgentOrchestrator;

  constructor(store: Store) {
    this.store = store;
    this.approvalHandler = new ApprovalHandler(store);
    this.agentOrchestrator = new AgentOrchestrator(store);
    
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
        {
          name: 'spawn_agent',
          description: 'Spawn a specialized agent to perform a task. Returns task_id and prompt instruction for agent execution.',
          inputSchema: {
            type: 'object',
            properties: {
              agent_type: {
                type: 'string',
                enum: ['codebase-locator', 'codebase-analyzer', 'codebase-pattern-finder', 'thoughts-locator', 'thoughts-analyzer', 'web-search-researcher'],
                description: 'Type of agent to spawn',
              },
              task: {
                type: 'string',
                description: 'Task description for the agent',
              },
              context: {
                type: 'object',
                description: 'Optional context object for the agent',
              },
              session_id: {
                type: 'string',
                description: 'Optional session ID for tracking',
              },
            },
            required: ['agent_type', 'task'],
          },
        },
        {
          name: 'get_agent_status',
          description: 'Get the status of an agent task',
          inputSchema: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: 'Task ID from spawn_agent',
              },
            },
            required: ['task_id'],
          },
        },
        {
          name: 'get_agent_results',
          description: 'Get the results from a completed agent task',
          inputSchema: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: 'Task ID from spawn_agent',
              },
            },
            required: ['task_id'],
          },
        },
        {
          name: 'update_agent_task',
          description: 'Update an agent task with results or status. Use this after executing an agent to record its results.',
          inputSchema: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: 'Task ID from spawn_agent',
              },
              status: {
                type: 'string',
                enum: ['running', 'completed', 'failed'],
                description: 'New status for the task',
              },
              results: {
                type: 'object',
                description: 'Agent results (will be JSON stringified)',
              },
              error: {
                type: 'string',
                description: 'Error message if task failed',
              },
            },
            required: ['task_id', 'status'],
          },
        },
        {
          name: 'list_agent_tasks',
          description: 'List agent tasks, optionally filtered by session_id or status',
          inputSchema: {
            type: 'object',
            properties: {
              session_id: {
                type: 'string',
                description: 'Optional session ID to filter by',
              },
              status: {
                type: 'string',
                enum: ['pending', 'running', 'completed', 'failed'],
                description: 'Optional status filter',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of tasks to return (default: 100)',
              },
            },
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

          case 'spawn_agent': {
            const params = args as unknown as SpawnAgentParams;
            const result = this.agentOrchestrator.spawnAgent(params);
            // Generate prompt instruction for the agent
            const prompt = this.agentOrchestrator.generateAgentPrompt(
              params.agent_type,
              params.task,
              params.context
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    task_id: result.task_id,
                    status: result.status,
                    prompt_instruction: prompt,
                    message: `Agent task created. Use the prompt instruction below to execute the agent, then call update_agent_task with the results.`,
                  }),
                },
              ],
            };
          }

          case 'get_agent_status': {
            const { task_id } = args as unknown as GetAgentStatusParams;
            const task = this.agentOrchestrator.getTaskStatus(task_id);
            if (!task) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({ error: 'Task not found' }),
                  },
                ],
                isError: true,
              };
            }
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    task_id: task.id,
                    agent_type: task.agentType,
                    task: task.task,
                    status: task.status,
                    created_at: task.createdAt.toISOString(),
                    completed_at: task.completedAt?.toISOString(),
                    error: task.error,
                  }),
                },
              ],
            };
          }

          case 'get_agent_results': {
            const { task_id } = args as unknown as GetAgentResultsParams;
            const results = this.agentOrchestrator.getTaskResults(task_id);
            if (!results) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({ error: 'Task not found' }),
                  },
                ],
                isError: true,
              };
            }
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results),
                },
              ],
            };
          }

          case 'update_agent_task': {
            const { task_id, status, results, error } = args as any;
            this.agentOrchestrator.updateTaskStatus(task_id, status, results, error);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ success: true, task_id }),
                },
              ],
            };
          }

          case 'list_agent_tasks': {
            const params = args as unknown as ListAgentTasksParams;
            const tasks = this.agentOrchestrator.listTasks(
              params.session_id,
              params.status,
              params.limit || 100
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    tasks: tasks.map(t => ({
                      task_id: t.id,
                      agent_type: t.agentType,
                      task: t.task,
                      status: t.status,
                      created_at: t.createdAt.toISOString(),
                      completed_at: t.completedAt?.toISOString(),
                    })),
                  }),
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

