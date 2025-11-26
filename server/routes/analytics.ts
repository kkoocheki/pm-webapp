/**
 * Analytics API Routes
 * Critical Path Method (CPM) analysis
 */

import { Hono } from 'hono';
import { sparqlSelect } from '../lib/sparql';
import { PREFIX_STRING } from '../types';
import type { CriticalPathAnalysis, TaskTiming } from '../types';

const app = new Hono();

/**
 * GET /api/analytics/critical-path/:slug
 * Calculate the critical path for a project
 */
app.get('/critical-path/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');

    // Get all tasks with dependencies
    const query = `
      ${PREFIX_STRING}
      SELECT ?task ?token ?text ?duration ?dep ?depToken
      WHERE {
        ?project pm:slug "${slug}" .
        ?task pm:belongsToProject ?project ;
              pm:token ?token .
        OPTIONAL { ?task pm:title ?text }
        OPTIONAL { ?task pm:duration ?duration }
        OPTIONAL {
          ?link pm:target ?task ;
                pm:source ?dep .
          ?dep pm:token ?depToken .
        }
      }
    `;

    const results = await sparqlSelect(query);

    // Build task map
    const tasks = new Map<string, any>();
    const dependencies = new Map<string, string[]>();

    for (const row of results) {
      if (!tasks.has(row.token)) {
        tasks.set(row.token, {
          token: row.token,
          text: row.text || 'Untitled',
          duration: parseInt(row.duration || '1'),
        });
        dependencies.set(row.token, []);
      }

      if (row.depToken) {
        dependencies.get(row.token)!.push(row.depToken);
      }
    }

    // Calculate CPM
    const timing = new Map<string, TaskTiming>();
    const taskArray = Array.from(tasks.values());

    // Forward pass (calculate early start and early finish)
    for (const task of taskArray) {
      const deps = dependencies.get(task.token) || [];
      let maxEarlyFinish = 0;

      for (const depToken of deps) {
        const depTiming = timing.get(depToken);
        if (depTiming) {
          maxEarlyFinish = Math.max(maxEarlyFinish, depTiming.early_finish);
        }
      }

      const earlyStart = maxEarlyFinish;
      const earlyFinish = earlyStart + task.duration;

      timing.set(task.token, {
        task_token: task.token,
        task_name: task.text,
        duration: task.duration,
        early_start: earlyStart,
        early_finish: earlyFinish,
        late_start: 0,
        late_finish: 0,
        total_float: 0,
        is_critical: false,
      });
    }

    // Find project duration
    const projectDuration = Math.max(...Array.from(timing.values()).map(t => t.early_finish));

    // Backward pass (calculate late start and late finish)
    const reversedTasks = [...taskArray].reverse();

    for (const task of reversedTasks) {
      const taskTiming = timing.get(task.token)!;

      // Find successors
      const successors: string[] = [];
      for (const [token, deps] of dependencies.entries()) {
        if (deps.includes(task.token)) {
          successors.push(token);
        }
      }

      let minLateStart = projectDuration;
      if (successors.length === 0) {
        minLateStart = taskTiming.early_finish;
      } else {
        for (const succToken of successors) {
          const succTiming = timing.get(succToken);
          if (succTiming) {
            minLateStart = Math.min(minLateStart, succTiming.late_start);
          }
        }
      }

      taskTiming.late_finish = minLateStart;
      taskTiming.late_start = minLateStart - task.duration;
      taskTiming.total_float = taskTiming.late_start - taskTiming.early_start;
      taskTiming.is_critical = taskTiming.total_float === 0;
    }

    // Find critical path
    const criticalPath = taskArray
      .filter(t => timing.get(t.token)!.is_critical)
      .sort((a, b) => timing.get(a.token)!.early_start - timing.get(b.token)!.early_start)
      .map(t => t.token);

    const analysis: CriticalPathAnalysis = {
      critical_path: criticalPath,
      critical_path_duration: projectDuration,
      task_timing: Array.from(timing.values()).sort((a, b) => a.early_start - b.early_start),
      has_cycles: false, // Simplified - not checking for cycles
    };

    return c.json(analysis);
  } catch (error) {
    console.error('Error calculating critical path:', error);
    return c.json({ error: 'Failed to calculate critical path' }, 500);
  }
});

export default app;
