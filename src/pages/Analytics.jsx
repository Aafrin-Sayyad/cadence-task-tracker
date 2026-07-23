import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { subscribeTasks } from '../services/backend';
import Layout from '../components/Layout';
import { tasksCompletedByDay, tasksByCategory, tasksByStatus } from '../utils/aggregations';

const COLORS = ['#f2a93b', '#9089d6', '#55c793', '#e2685f', '#6fa8dc'];

export default function Analytics() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeTasks(user.uid, setTasks);
    return unsub;
  }, [user]);

  const byDay = tasksCompletedByDay(tasks, 14);
  const byCategory = tasksByCategory(tasks);
  const byStatus = tasksByStatus(tasks);

  const chartTextStyle = { fill: '#9a9ba3', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Aggregated from your live task data</p>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Tasks completed — last 14 days</h2>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--paper-dim)' }}>Add and complete some tasks to see this chart fill in.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={byDay}>
              <CartesianGrid stroke="#2b2f3d" vertical={false} />
              <XAxis dataKey="label" tick={chartTextStyle} axisLine={{ stroke: '#2b2f3d' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={chartTextStyle} axisLine={{ stroke: '#2b2f3d' }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1f2330', border: '1px solid #2b2f3d', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: '#e8e6e1' }}
              />
              <Line type="monotone" dataKey="completed" stroke="#f2a93b" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-grid">
        <div className="panel">
          <h2 className="panel-title">By category</h2>
          {byCategory.length === 0 ? (
            <p style={{ color: 'var(--paper-dim)' }}>No tasks yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byCategory}>
                <CartesianGrid stroke="#2b2f3d" vertical={false} />
                <XAxis dataKey="category" tick={chartTextStyle} axisLine={{ stroke: '#2b2f3d' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={chartTextStyle} axisLine={{ stroke: '#2b2f3d' }} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1f2330', border: '1px solid #2b2f3d', borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="count" fill="#9089d6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel">
          <h2 className="panel-title">By status</h2>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--paper-dim)' }}>No tasks yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={byStatus} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {byStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2330', border: '1px solid #2b2f3d', borderRadius: 8, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Layout>
  );
}
