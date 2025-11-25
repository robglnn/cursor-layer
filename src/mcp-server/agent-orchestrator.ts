/**
 * Agent Orchestrator
 * 
 * Manages agent task lifecycle and provides interface for agent execution
 */

import { randomUUID } from 'crypto';
import { Store } from '../storage/index.js';
import type { AgentTask, AgentTaskStatus, AgentType } from '../storage/types.js';
import type { SpawnAgentParams } from './types.js';

export class AgentOrchestrator {
  private store: Store;
  private activeTasks: Map<string, AgentTask>;

  constructor(store: Store) {
    this.store = store;
    this.activeTasks = new Map();
  }

  /**
   * Spawn a new agent task
   * Creates a task record and returns task ID
   * The actual agent execution happens via prompt-based instructions
   */
  spawnAgent(params: SpawnAgentParams): { task_id: string; status: string } {
    const taskId = randomUUID();
    const task: AgentTask = {
      id: taskId,
      sessionId: params.session_id,
      agentType: params.agent_type,
      task: params.task,
      context: params.context ? JSON.stringify(params.context) : undefined,
      status: 'pending',
      createdAt: new Date(),
    };

    this.store.createAgentTask(task);
    this.activeTasks.set(taskId, task);

    return {
      task_id: taskId,
      status: 'pending',
    };
  }

  /**
   * Update agent task status
   */
  updateTaskStatus(taskId: string, status: AgentTaskStatus, results?: unknown, error?: string): void {
    const updates: Partial<AgentTask> = {
      status,
    };

    if (results !== undefined) {
      updates.results = JSON.stringify(results);
    }

    if (error) {
      updates.error = error;
    }

    if (status === 'completed' || status === 'failed') {
      updates.completedAt = new Date();
    }

    this.store.updateAgentTask(taskId, updates);

    const task = this.activeTasks.get(taskId);
    if (task) {
      Object.assign(task, updates);
    }
  }

  /**
   * Get agent task status
   */
  getTaskStatus(taskId: string): AgentTask | null {
    const task = this.store.getAgentTask(taskId);
    if (task) {
      this.activeTasks.set(taskId, task);
    }
    return task;
  }

  /**
   * Get agent task results
   */
  getTaskResults(taskId: string): { results?: unknown; error?: string; status: string } | null {
    const task = this.store.getAgentTask(taskId);
    if (!task) return null;

    return {
      results: task.results ? JSON.parse(task.results) : undefined,
      error: task.error,
      status: task.status,
    };
  }

  /**
   * List agent tasks
   */
  listTasks(sessionId?: string, status?: AgentTaskStatus, limit = 100): AgentTask[] {
    return this.store.listAgentTasks(sessionId, status, limit);
  }

  /**
   * Generate prompt instruction for agent execution
   * This is used as fallback when MCP tools aren't available
   */
  generateAgentPrompt(agentType: AgentType, task: string, context?: Record<string, unknown>): string {
    const agentDescriptions: Record<AgentType, string> = {
      'codebase-locator': 'Find WHERE files and components live in the codebase',
      'codebase-analyzer': 'Understand HOW specific code works',
      'codebase-pattern-finder': 'Find similar implementations and patterns',
      'thoughts-locator': 'Find relevant documents in thoughts/ directory',
      'thoughts-analyzer': 'Extract high-value insights from thoughts documents',
      'web-search-researcher': 'Find external information via web search',
    };

    let prompt = `Act as the ${agentType} agent. ${agentDescriptions[agentType]}\n\n`;
    prompt += `Task: ${task}\n\n`;

    if (context) {
      prompt += `Context:\n`;
      for (const [key, value] of Object.entries(context)) {
        prompt += `- ${key}: ${JSON.stringify(value)}\n`;
      }
      prompt += `\n`;
    }

    prompt += `Refer to .cursor/rules/agents/${agentType}.mdc for your specific instructions.\n`;
    prompt += `Complete the task and return results in the format specified in AGENT_CONTRACTS.md.`;

    return prompt;
  }
}

