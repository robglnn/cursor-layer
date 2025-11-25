/**
 * File Watcher with .gitignore support
 * 
 * Automatically excludes:
 * - node_modules/
 * - dist/
 * - .git/
 * - build/
 * - Any patterns in .gitignore
 */

import chokidar from 'chokidar';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
// Simple gitignore parser - no external dependency needed
// For MVP, we'll use a basic implementation

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  relativePath: string;
  timestamp: Date;
}

export interface FileWatcherOptions {
  rootDir: string;
  respectGitignore?: boolean;
  onFileChange?: (event: FileChangeEvent) => void;
  ignored?: string[];
}

const DEFAULT_IGNORED = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.git/**',
  '**/build/**',
  '**/.next/**',
  '**/.cache/**',
  '**/coverage/**',
  '**/*.log',
  '**/*.db',
  '**/*.db-shm',
  '**/*.db-wal',
];

interface GitIgnorePattern {
  pattern: RegExp;
  negate: boolean;
}

export class FileWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private gitignorePatterns: GitIgnorePattern[] = [];
  private rootDir: string;
  private respectGitignore: boolean;
  private onFileChange?: (event: FileChangeEvent) => void;

  constructor(options: FileWatcherOptions) {
    this.rootDir = options.rootDir;
    this.respectGitignore = options.respectGitignore ?? true;
    this.onFileChange = options.onFileChange;

    if (this.respectGitignore) {
      this.loadGitignore();
    }
  }

  private loadGitignore(): void {
    const gitignorePath = join(this.rootDir, '.gitignore');
    if (existsSync(gitignorePath)) {
      try {
        const content = readFileSync(gitignorePath, 'utf-8');
        this.gitignorePatterns = this.parseGitignore(content);
      } catch (error) {
        console.warn('Failed to load .gitignore:', error);
      }
    }
  }

  private parseGitignore(content: string): GitIgnorePattern[] {
    const patterns: GitIgnorePattern[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const negate = trimmed.startsWith('!');
      const pattern = negate ? trimmed.slice(1) : trimmed;
      
      // Convert gitignore pattern to regex
      const regex = this.gitignoreToRegex(pattern);
      if (regex) {
        patterns.push({ pattern: regex, negate });
      }
    }

    return patterns;
  }

  private gitignoreToRegex(pattern: string): RegExp | null {
    // Convert gitignore pattern to regex
    // Handles: *, **, ?, [abc], !, etc.
    let regexStr = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '___DOUBLE_STAR___')
      .replace(/\*/g, '[^/]*')
      .replace(/___DOUBLE_STAR___/g, '.*')
      .replace(/\?/g, '[^/]')
      .replace(/\[([^\]]+)\]/g, '[$1]');

    // Anchor to start if pattern doesn't start with /
    if (!pattern.startsWith('/')) {
      regexStr = '.*' + regexStr;
    }

    try {
      return new RegExp('^' + regexStr + '$');
    } catch {
      return null;
    }
  }

  private shouldIgnore(path: string): boolean {
    const relativePath = relative(this.rootDir, path).replace(/\\/g, '/');
    
    // Check hardcoded ignores first
    for (const pattern of DEFAULT_IGNORED) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }

    // Check .gitignore patterns
    if (this.respectGitignore && this.gitignorePatterns.length > 0) {
      let ignored = false;
      for (const { pattern, negate } of this.gitignorePatterns) {
        if (pattern.test(relativePath)) {
          if (negate) {
            ignored = false; // Negation overrides previous ignores
          } else {
            ignored = true;
          }
        }
      }
      if (ignored) {
        return true;
      }
    }

    return false;
  }

  private matchesPattern(path: string, pattern: string): boolean {
    // Simple glob matching for common patterns
    const regex = new RegExp(
      pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.')
    );
    return regex.test(path);
  }

  start(): void {
    if (this.watcher) {
      return; // Already watching
    }

    this.watcher = chokidar.watch(this.rootDir, {
      ignored: (path) => this.shouldIgnore(path),
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false,
    });

    this.watcher
      .on('add', (path) => this.handleChange('add', path))
      .on('change', (path) => this.handleChange('change', path))
      .on('unlink', (path) => this.handleChange('unlink', path))
      .on('error', (error) => {
        console.error('File watcher error:', error);
      });
  }

  private handleChange(type: 'add' | 'change' | 'unlink', path: string): void {
    if (this.shouldIgnore(path)) {
      return;
    }

    const relativePath = relative(this.rootDir, path);
    const event: FileChangeEvent = {
      type,
      path,
      relativePath,
      timestamp: new Date(),
    };

    this.onFileChange?.(event);
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  isWatching(): boolean {
    return this.watcher !== null;
  }
}

