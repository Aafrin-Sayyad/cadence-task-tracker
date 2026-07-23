import { useState } from 'react';

const CATEGORIES = ['Coursework', 'Reading', 'Project', 'Admin', 'Other'];

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give the task a title.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await onCreate({ title: title.trim(), category, dueDate: dueDate || null, status: 'todo' });
      setTitle('');
      setDueDate('');
    } catch (err) {
      setError(err.message || 'Could not create the task.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="title">Task</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Finish reading response for Ch. 4"
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="dueDate">Due</label>
          <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Adding…' : 'Add task'}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
