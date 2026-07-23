import { useState } from 'react';
import { toast } from 'sonner';

export default function DeleteConfirm({ task, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      await onConfirm(task.id);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not delete the task.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2 className="modal-title">Delete this task?</h2>
        <p style={{ color: 'var(--paper-dim)', fontSize: 14, margin: 0 }}>
          "{task.title}" will be permanently removed. This can't be undone.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete task'}
          </button>
        </div>
      </div>
    </div>
  );
}
