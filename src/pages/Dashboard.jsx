import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { subscribeTasks, addTask, updateTask, deleteTask, isFirebaseConfigured } from '../services/backend';
import Layout from '../components/Layout';
import CadenceBar from '../components/CadenceBar';
import TaskForm from '../components/TaskForm';
import TaskTable from '../components/TaskTable';
import TableSkeleton from '../components/TableSkeleton';
import EditModal from '../components/EditModal';
import DeleteConfirm from '../components/DeleteConfirm';
import AiSubtasksModal from '../components/AiSubtasksModal';
import { summaryStats } from '../utils/aggregations';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [aiTask, setAiTask] = useState(null);

  
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeTasks(user.uid, (rows) => {
      setTasks(rows);
      setLoaded(true);
    });
    return unsub;
  }, [user]);

  async function handleCreate(data) {
    
    try {
      await addTask(user.uid, data);
      toast.success('Task added.');
    } catch (err) {
      toast.error(err.message || 'Could not add the task.');
      throw err;
    }
  }

  async function handleToggleDone(task) {
    const next = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in-progress' : 'done';
    const patch = { status: next };
    if (next === 'done') patch.completedAt = Date.now();
    try {
      await updateTask(user.uid, task.id, patch);
    } catch (err) {
      toast.error(err.message || 'Could not update the task.');
    }
  }

  async function handleSaveEdit(id, patch) {
    await updateTask(user.uid, id, patch);
    toast.success('Task updated.');
  }

  async function handleDelete(id) {
    await deleteTask(user.uid, id);
    toast.success('Task deleted.');
  }

  async function handleSaveSubtasks(id, patch) {
    await updateTask(user.uid, id, patch);
  }

  const stats = summaryStats(tasks);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Your tasks</h1>
          <p className="page-sub">Signed in as {user.email}</p>
        </div>
      </div>

      {!isFirebaseConfigured && (
        <div className="demo-banner">
          Running in demo mode — data is stored in this browser only. Add your Firebase
          keys to .env to connect a real Firestore backend (see README).
        </div>
      )}

      <CadenceBar tasks={tasks} />

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-num">{stats.total}</div>
          <div className="stat-label">Total tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.inProgress}</div>
          <div className="stat-label">In progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.completionRate}%</div>
          <div className="stat-label">Completion rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: stats.overdue ? 'var(--red)' : undefined }}>
            {stats.overdue}
          </div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="panel" id="add-task-panel">
        <h2 className="panel-title">Add a task</h2>
        <TaskForm onCreate={handleCreate} />
      </div>

      <div className="panel">
        <h2 className="panel-title">All tasks</h2>
        {loaded ? (
          <TaskTable
            tasks={tasks}
            onEdit={setEditing}
            onDelete={setDeleting}
            onToggleDone={handleToggleDone}
            onAiSteps={setAiTask}
          />
        ) : (
          <TableSkeleton />
        )}
      </div>

      {editing && (
        <EditModal
          task={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deleting && (
        <DeleteConfirm
          task={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}

      {aiTask && (
        <AiSubtasksModal
          task={aiTask}
          onClose={() => setAiTask(null)}
          onSave={handleSaveSubtasks}
        />
      )}
    </Layout>
  );
}
