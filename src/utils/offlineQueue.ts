import type { IdeaContextInput } from '../types/project';

const QUEUE_KEY = 'ideaforge_pending_generate_v1';
const MAX_QUEUED = 10;

function isValidInput(val: unknown): val is IdeaContextInput {
  if (typeof val !== 'object' || val === null) return false;
  const v = val as Record<string, unknown>;
  return (
    typeof v.idea === 'string' &&
    v.idea.trim().length >= 10 &&
    typeof v.budget === 'string' &&
    typeof v.projectType === 'string'
  );
}

function readQueue(): IdeaContextInput[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidInput);
  } catch {
    return [];
  }
}

function writeQueue(queue: IdeaContextInput[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // quota exceeded — ignorovať, front sa neuloží
  }
}

export function getPendingGenerations(): IdeaContextInput[] {
  return readQueue();
}

export function enqueuePendingGeneration(input: IdeaContextInput): IdeaContextInput[] {
  const queue = readQueue().filter((item) => item.idea !== input.idea);
  queue.unshift(input);
  const capped = queue.slice(0, MAX_QUEUED);
  writeQueue(capped);
  return capped;
}

export function removePendingGeneration(idea: string): IdeaContextInput[] {
  const queue = readQueue().filter((item) => item.idea !== idea);
  writeQueue(queue);
  return queue;
}

export function clearPendingGenerations(): void {
  writeQueue([]);
}
