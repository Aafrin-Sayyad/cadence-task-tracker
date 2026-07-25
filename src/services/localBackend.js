
const USERS_KEY = 'cadence_demo_users';
const SESSION_KEY = 'cadence_demo_session';
const TASKS_KEY = 'cadence_demo_tasks';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---------- Auth ----------

const listeners = new Set();

function currentUser() {
  return readJSON(SESSION_KEY, null);
}

function notify() {
  const user = currentUser();
  listeners.forEach((cb) => cb(user));
}

export function onAuthChange(cb) {
  listeners.add(cb);
  cb(currentUser());
  return () => listeners.delete(cb);
}

export async function signUp(email, password, displayName) {
  const users = readJSON(USERS_KEY, {});
  if (users[email]) {
    throw new Error('An account with that email already exists.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  const user = { uid: uid(), email, password, displayName: displayName || email.split('@')[0] };
  users[email] = user;
  writeJSON(USERS_KEY, users);
  const session = { uid: user.uid, email: user.email, displayName: user.displayName };
  writeJSON(SESSION_KEY, session);
  notify();
  return session;
}

export async function signIn(email, password) {
  const users = readJSON(USERS_KEY, {});
  const user = users[email];
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }
  const session = { uid: user.uid, email: user.email, displayName: user.displayName };
  writeJSON(SESSION_KEY, session);
  notify();
  return session;
}

export async function signOutUser() {
  localStorage.removeItem(SESSION_KEY);
  notify();
}

// ---------- Firestore-like task store ----------

function allTasks() {
  return readJSON(TASKS_KEY, []);
}

function saveAll(tasks) {
  writeJSON(TASKS_KEY, tasks);
}

const taskListeners = new Set();

function emitTasks(uidFilter) {
  const rows = allTasks()
    .filter((t) => t.uid === uidFilter)
    .sort((a, b) => b.createdAt - a.createdAt);
  taskListeners.forEach(({ uid: u, cb }) => {
    if (u === uidFilter) cb(rows);
  });
}


export function subscribeTasks(uidFilter, cb) {
  const entry = { uid: uidFilter, cb };
  taskListeners.add(entry);
  emitTasks(uidFilter);
  return () => taskListeners.delete(entry);
}

export async function addTask(uidOwner, data) {
  const tasks = allTasks();
  const doc = {
    id: uid(),
    uid: uidOwner,
    title: data.title,
    category: data.category,
    status: data.status || 'todo',
    dueDate: data.dueDate || null,
    createdAt: Date.now(),
  };
  tasks.push(doc);
  saveAll(tasks);
  emitTasks(uidOwner);
  return doc;
}

export async function updateTask(uidOwner, id, patch) {
  const tasks = allTasks();
  const idx = tasks.findIndex((t) => t.id === id && t.uid === uidOwner);
  if (idx === -1) throw new Error('Task not found.');
  tasks[idx] = { ...tasks[idx], ...patch };
  saveAll(tasks);
  emitTasks(uidOwner);
}

export async function deleteTask(uidOwner, id) {
  const tasks = allTasks().filter((t) => !(t.id === id && t.uid === uidOwner));
  saveAll(tasks);
  emitTasks(uidOwner);
}
