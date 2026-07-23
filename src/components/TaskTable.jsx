const STATUS_META = {
  todo: { label: 'To do', className: 'pill-todo' },
  'in-progress': { label: 'In progress', className: 'pill-progress' },
  done: { label: 'Done', className: 'pill-done' },
};

export default function TaskTable({ tasks, onEdit, onDelete, onToggleDone, onAiSteps }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden="true">✓</div>
        <h3>No tasks yet</h3>
        <p>Add your first task to start building a streak.</p>
        <a href="#add-task-panel" className="btn btn-primary btn-sm">Add your first task</a>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Category</th>
            <th>Due</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const meta = STATUS_META[t.status] || STATUS_META.todo;
            return (
              <tr key={t.id}>
                <td>
                  {t.title}
                  {Array.isArray(t.subtasks) && t.subtasks.length > 0 && (
                    <ul className="subtask-preview">
                      {t.subtasks.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td>{t.category}</td>
                <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                <td>
                  <button
                    className={`pill ${meta.className}`}
                    style={{ cursor: 'pointer', background: 'transparent' }}
                    onClick={() => onToggleDone(t)}
                    title="Click to toggle status"
                  >
                    {meta.label}
                  </button>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => onAiSteps(t)}>✨ Steps</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onEdit(t)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(t)}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
