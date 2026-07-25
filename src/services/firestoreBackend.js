import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// ---------- Auth ----------

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) return cb(null);
    cb({ uid: user.uid, email: user.email, displayName: user.displayName || user.email.split('@')[0] });
  });
}

export async function signUp(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return { uid: cred.user.uid, email: cred.user.email, displayName };
}

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName };
}

export async function signOutUser() {
  await signOut(auth);
}

// ---------- Firestore CRUD ----------


const TASKS_COLLECTION = 'tasks';

export function subscribeTasks(uidFilter, cb) {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('uid', '==', uidFilter),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
        };
      });
      cb(rows);
    },
    (err) => console.error('subscribeTasks error', err)
  );
}

export async function addTask(uidOwner, data) {
  await addDoc(collection(db, TASKS_COLLECTION), {
    uid: uidOwner,
    title: data.title,
    category: data.category,
    status: data.status || 'todo',
    dueDate: data.dueDate || null,
    createdAt: serverTimestamp(),
  });
}

export async function updateTask(uidOwner, id, patch) {
  
  await updateDoc(doc(db, TASKS_COLLECTION, id), patch);
}

export async function deleteTask(uidOwner, id) {
  await deleteDoc(doc(db, TASKS_COLLECTION, id));
}
