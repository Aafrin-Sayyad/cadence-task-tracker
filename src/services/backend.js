import { isFirebaseConfigured } from '../firebase';
import * as firestoreBackend from './firestoreBackend';
import * as localBackend from './localBackend';

// Single import point for the rest of the app. Swaps implementations
// based on whether real Firebase project keys were provided in .env.
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
