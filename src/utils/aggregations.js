// Pure functions that turn raw task documents into chart-ready metrics.
// Kept separate from components so they're easy to unit test.

const DAY_MS = 24 * 60 * 60 * 1000;

// Builds a YYYY-MM-DD key from LOCAL date parts (not toISOString, which
// converts to UTC and silently shifts the date by a day in timezones ahead
// of UTC, e.g. IST). Keeping this consistent on both the bucket keys and
// the completion-timestamp keys is what keeps the chart in sync.
function localDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Tasks completed per day, over the trailing `days` days. */
export function tasksCompletedByDay(tasks, days = 14) {
  const buckets = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = localDateKey(d);
    buckets[key] = { date: key, label: d.toLocaleDateString(undefined, { weekday: 'short' }), completed: 0 };
  }

  tasks
    .filter((t) => t.status === 'done')
    .forEach((t) => {
      const ts = t.completedAt || t.createdAt;
      if (!ts) return;
      const key = localDateKey(new Date(ts));
      if (buckets[key]) buckets[key].completed += 1;
    });

  return Object.values(buckets);
}

/** Count of tasks grouped by category, for a bar/pie chart. */
export function tasksByCategory(tasks) {
  const counts = tasks.reduce((acc, t) => {
    const key = t.category || 'Uncategorized';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([category, count]) => ({ category, count }));
}

/** Count of tasks grouped by status, for a donut/bar chart. */
export function tasksByStatus(tasks) {
  const order = ['todo', 'in-progress', 'done'];
  const labels = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };
  const counts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  return order.map((key) => ({ status: labels[key], count: counts[key] || 0 }));
}

/** High-level stats for the top stat cards. */
export function summaryStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const overdue = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;
  const completionRate = total ? Math.round((done / total) * 100) : 0;
  return { total, done, inProgress, overdue, completionRate };
}

/** Last N days as a boolean "was anything completed" activity map, for the cadence bar. */
export function activityRhythm(tasks, days = 14) {
  const byDay = tasksCompletedByDay(tasks, days);
  return byDay.map((d) => ({ ...d, active: d.completed > 0, intensity: Math.min(d.completed, 4) }));
}