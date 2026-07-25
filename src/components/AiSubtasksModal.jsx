import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AiSubtasksModal({ task, onClose, onSave }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    generate();
    
  }, []);

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, category: task.category }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Could not generate sub-steps.');
      }
      setSubtasks(data.subtasks || []);
    } catch (err) {
      setError(err.message || 'Something went wrong talking to the AI.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(task.id, { subtasks });
      toast.success('Sub-steps saved to task.');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not save sub-steps.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2 className="modal-title">✨ AI sub-steps</h2>
        <p style={{ color: 'var(--paper-dim)', fontSize: 14, margin: '0 0 16px' }}>
          For &ldquo;{task.title}&rdquo;
        </p>

        {loading && (
          <div className="ai-loading">
            <span className="spinner" /> Generating with Gemini…
          </div>
        )}

        {!loading && error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <ul className="ai-subtask-list">
            {subtasks.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}

        <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={generate} disabled={loading}>
            Regenerate
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading || saving || !!error || subtasks.length === 0}
              onClick={handleSave}
            >
              {saving ? 'Saving…' : 'Save to task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
