import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update,
  remove, 
  onValue,
  off 
} from 'firebase/database';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';

// ============================================
// FIREBASE CONFIGURATION
// ============================================
// These credentials are for your Child Health Tracker project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Register a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password (min 6 characters)
 * @returns {Promise} - Firebase user credential
 */
export async function registerUser(email, password) {
  // Password validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Login user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} - Firebase user credential
 */
export async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Logout current user
 * @returns {Promise} - Void promise
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Function called when auth state changes
 * @returns {Function} - Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ============================================
// DATA CONVERSION HELPERS
// ============================================

/**
 * Convert Firebase object to array
 * Converts: { id1: {data}, id2: {data} } to [{data}, {data}]
 * @param {Object} obj - Firebase object
 * @returns {Array} - Array of objects
 */
function objectToArray(obj) {
  if (!obj || typeof obj !== 'object') {
    return [];
  }
  return Object.values(obj);
}

/**
 * Convert array to Firebase object for storage
 * Converts: [{id: '1', ...}, {id: '2', ...}] to { 1: {...}, 2: {...} }
 * @param {Array} arr - Array of objects with 'id' property
 * @returns {Object} - Firebase-compatible object
 */
function arrayToObject(arr) {
  if (!Array.isArray(arr)) {
    return {};
  }
  
  const obj = {};
  arr.forEach(item => {
    if (item.id) {
      obj[item.id] = item;
    }
  });
  return obj;
}

// ============================================
// CHILDREN DATA OPERATIONS
// ============================================

/**
 * Save all children to Firebase
 * @param {string} userId - User's UID
 * @param {Array} children - Array of child objects
 * @returns {Promise} - Void promise
 */
export async function saveChildren(userId, children) {
  try {
    const childrenObj = arrayToObject(children);
    return await set(ref(database, `users/${userId}/children`), childrenObj);
  } catch (error) {
    console.error('Error saving children:', error);
    throw error;
  }
}

/**
 * Get all children for a user
 * @param {string} userId - User's UID
 * @returns {Promise<Array>} - Array of children
 */
export async function getChildren(userId) {
  try {
    const snapshot = await get(ref(database, `users/${userId}/children`));
    if (snapshot.exists()) {
      return objectToArray(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error('Error getting children:', error);
    return [];
  }
}

/**
 * Delete a specific child and all related data
 * @param {string} userId - User's UID
 * @param {string} childId - Child's ID
 * @returns {Promise} - Void promise
 */
export async function deleteChild(userId, childId) {
  try {
    await remove(ref(database, `users/${userId}/children/${childId}`));
  } catch (error) {
    console.error('Error deleting child:', error);
    throw error;
  }
}

// ============================================
// VACCINES DATA OPERATIONS
// ============================================

/**
 * Save all vaccines to Firebase
 * @param {string} userId - User's UID
 * @param {Array} vaccines - Array of vaccine objects
 * @returns {Promise} - Void promise
 */
export async function saveVaccines(userId, vaccines) {
  try {
    const vaccinesObj = arrayToObject(vaccines);
    return await set(ref(database, `users/${userId}/vaccines`), vaccinesObj);
  } catch (error) {
    console.error('Error saving vaccines:', error);
    throw error;
  }
}

/**
 * Get all vaccines for a user
 * @param {string} userId - User's UID
 * @returns {Promise<Array>} - Array of vaccines
 */
export async function getVaccines(userId) {
  try {
    const snapshot = await get(ref(database, `users/${userId}/vaccines`));
    if (snapshot.exists()) {
      return objectToArray(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error('Error getting vaccines:', error);
    return [];
  }
}

// ============================================
// HEALTH LOGS DATA OPERATIONS
// ============================================

/**
 * Save all health logs to Firebase
 * @param {string} userId - User's UID
 * @param {Array} logs - Array of health log objects
 * @returns {Promise} - Void promise
 */
export async function saveHealthLogs(userId, logs) {
  try {
    const logsObj = arrayToObject(logs);
    return await set(ref(database, `users/${userId}/healthLogs`), logsObj);
  } catch (error) {
    console.error('Error saving health logs:', error);
    throw error;
  }
}

/**
 * Get all health logs for a user
 * @param {string} userId - User's UID
 * @returns {Promise<Array>} - Array of health logs
 */
export async function getHealthLogs(userId) {
  try {
    const snapshot = await get(ref(database, `users/${userId}/healthLogs`));
    if (snapshot.exists()) {
      return objectToArray(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error('Error getting health logs:', error);
    return [];
  }
}

// ============================================
// BULK SYNC OPERATIONS
// ============================================

/**
 * Sync all data to Firebase at once
 * Called when data changes to keep cloud updated
 * @param {string} userId - User's UID
 * @param {Array} children - Array of children
 * @param {Array} vaccines - Array of vaccines
 * @param {Array} healthLogs - Array of health logs
 * @returns {Promise} - Void promise
 */
export async function syncAllDataToCloud(userId, children, vaccines, healthLogs) {
  try {
    const updates = {};
    
    // Convert arrays to objects and add to updates
    updates[`users/${userId}/children`] = arrayToObject(children);
    updates[`users/${userId}/vaccines`] = arrayToObject(vaccines);
    updates[`users/${userId}/healthLogs`] = arrayToObject(healthLogs);
    
    // Update all at once for efficiency
    await update(ref(database), updates);
    console.log('✓ Data synced to cloud successfully');
  } catch (error) {
    console.error('Error syncing data to cloud:', error);
    throw error;
  }
}

/**
 * Load all data from Firebase
 * Called when user logs in
 * @param {string} userId - User's UID
 * @returns {Promise<Object>} - Object with children, vaccines, healthLogs arrays
 */
export async function loadAllDataFromCloud(userId) {
  try {
    const [children, vaccines, healthLogs] = await Promise.all([
      getChildren(userId),
      getVaccines(userId),
      getHealthLogs(userId)
    ]);
    
    console.log('✓ Data loaded from cloud successfully');
    return { children, vaccines, healthLogs };
  } catch (error) {
    console.error('Error loading data from cloud:', error);
    // Return empty data instead of crashing
    return { children: [], vaccines: [], healthLogs: [] };
  }
}

// ============================================
// REAL-TIME LISTENERS (Optional - For future use)
// ============================================

/**
 * Listen to real-time changes in children data
 * This allows automatic UI updates when data changes
 * @param {string} userId - User's UID
 * @param {Function} callback - Function called with updated data
 * @returns {Function} - Unsubscribe function to stop listening
 */
export function onChildrenChange(userId, callback) {
  try {
    return onValue(
      ref(database, `users/${userId}/children`),
      (snapshot) => {
        const data = snapshot.exists() ? objectToArray(snapshot.val()) : [];
        callback(data);
      },
      (error) => {
        console.error('Error listening to children changes:', error);
      }
    );
  } catch (error) {
    console.error('Error setting up children listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
}

/**
 * Listen to real-time changes in vaccines data
 * @param {string} userId - User's UID
 * @param {Function} callback - Function called with updated data
 * @returns {Function} - Unsubscribe function
 */
export function onVaccinesChange(userId, callback) {
  try {
    return onValue(
      ref(database, `users/${userId}/vaccines`),
      (snapshot) => {
        const data = snapshot.exists() ? objectToArray(snapshot.val()) : [];
        callback(data);
      },
      (error) => {
        console.error('Error listening to vaccines changes:', error);
      }
    );
  } catch (error) {
    console.error('Error setting up vaccines listener:', error);
    return () => {};
  }
}

/**
 * Listen to real-time changes in health logs data
 * @param {string} userId - User's UID
 * @param {Function} callback - Function called with updated data
 * @returns {Function} - Unsubscribe function
 */
export function onHealthLogsChange(userId, callback) {
  try {
    return onValue(
      ref(database, `users/${userId}/healthLogs`),
      (snapshot) => {
        const data = snapshot.exists() ? objectToArray(snapshot.val()) : [];
        callback(data);
      },
      (error) => {
        console.error('Error listening to health logs changes:', error);
      }
    );
  } catch (error) {
    console.error('Error setting up health logs listener:', error);
    return () => {};
  }
}

/**
 * Stop listening to children changes
 * Prevents memory leaks
 * @param {string} userId - User's UID
 */
export function offChildrenListener(userId) {
  off(ref(database, `users/${userId}/children`));
}

/**
 * Stop listening to vaccines changes
 * Prevents memory leaks
 * @param {string} userId - User's UID
 */
export function offVaccinesListener(userId) {
  off(ref(database, `users/${userId}/vaccines`));
}

/**
 * Stop listening to health logs changes
 * Prevents memory leaks
 * @param {string} userId - User's UID
 */
export function offHealthLogsListener(userId) {
  off(ref(database, `users/${userId}/healthLogs`));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if user has any data in cloud
 * @param {string} userId - User's UID
 * @returns {Promise<boolean>} - True if user has data
 */
export async function hasCloudData(userId) {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking cloud data:', error);
    return false;
  }
}

/**
 * Delete all user data from cloud
 * WARNING: This cannot be undone!
 * @param {string} userId - User's UID
 * @returns {Promise} - Void promise
 */
export async function deleteAllUserData(userId) {
  try {
    await remove(ref(database, `users/${userId}`));
    console.log('⚠️ All user data deleted');
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

/**
 * Get user data size/usage
 * Useful for monitoring storage
 * @param {string} userId - User's UID
 * @returns {Promise<Object>} - Object with hasData and sizeKB
 */
export async function getUserDataInfo(userId) {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    if (snapshot.exists()) {
      const dataStr = JSON.stringify(snapshot.val());
      const sizeKB = new Blob([dataStr]).size / 1024;
      return {
        hasData: true,
        sizeKB: parseFloat(sizeKB.toFixed(2))
      };
    }
    return { hasData: false, sizeKB: 0 };
  } catch (error) {
    console.error('Error getting user data info:', error);
    return { hasData: false, sizeKB: 0 };
  }
}
