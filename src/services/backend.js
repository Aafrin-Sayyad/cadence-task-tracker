import { isFirebaseConfigured } from '../firebase';
import * as firestoreBackend from './firestoreBackend';
import * as localBackend from './localBackend';


const backend = isFirebaseConfigured ? firestoreBackend : localBackend;

export const {
  onAuthChange,
  signUp,
  signIn,
  signOutUser,
  subscribeTasks,
  addTask,
  updateTask,
  deleteTask,
} = backend;

export { isFirebaseConfigured };
