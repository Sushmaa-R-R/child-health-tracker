/**
 * Child Health Tracker - Main React Component
 * 
 * Features:
 * - User authentication (register/login)
 * - Multi-child support
 * - Vaccine tracking with reminders
 * - Health log management
 * - Medicine consolidation
 * - Growth charts
 * - Cloud sync across devices
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  onAuthChange,
  syncAllDataToCloud,
  loadAllDataFromCloud
} from './firebase';

// ============================================
// ICON COMPONENTS (Material Design)
// ============================================

const AddIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
    <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
);

const CancelIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2z M11 3L5.5 8.5l1.42 1.41L11 5.83v10.67h2V5.83l4.08 4.08L18.5 8.5 13 3h-2z" />
  </svg>
);

const HomeIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const VaccineIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
  </svg>
);

const HealthIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9.5c0 .83-.67 1.5-1.5 1.5S11 13.33 11 12.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM7 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm10 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-5 8c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z" />
  </svg>
);

const MedicineIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.1-.62l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format date string to YYYY-MM-DD format
 * Used for date input fields
 */
const formatDateForInput = (dateString) => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Calculate child's age from date of birth
 */
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const monthsSince = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
  if (age === 0) {
    return `${monthsSince} months`;
  }
  return `${age} year${age > 1 ? 's' : ''}, ${monthsSince % 12} months`;
};

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function App() {
  // ========== AUTHENTICATION STATE ==========
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ========== APP STATE ==========
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeChild, setActiveChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [syncError, setSyncError] = useState('');

  // ========== MODAL STATE ==========
  const [showAddChild, setShowAddChild] = useState(false);
  const [showEditChild, setShowEditChild] = useState(false);
  const [editingChildData, setEditingChildData] = useState(null);
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [showEditVaccine, setShowEditVaccine] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [showAddHealth, setShowAddHealth] = useState(false);
  const [showEditHealth, setShowEditHealth] = useState(false);
  const [editingHealthLog, setEditingHealthLog] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);

  // ========== MEDICINES STATE ==========
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ 
    name: '', 
    dosage: '', 
    frequency: '', 
    duration: '' 
  });

  // ========== FIREBASE INITIALIZATION ==========
  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
        loadDataFromCloud(currentUser.uid);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setChildren([]);
        setVaccines([]);
        setHealthLogs([]);
      }
    });

    return unsubscribe;
  }, []);

  // ========== LOAD DATA FROM CLOUD ==========
  /**
   * Load user's data from Firebase cloud
   */
  const loadDataFromCloud = async (userId) => {
    setDataLoading(true);
    setSyncError('');
    try {
      const data = await loadAllDataFromCloud(userId);
      setChildren(data.children || []);
      setVaccines(data.vaccines || []);
      setHealthLogs(data.healthLogs || []);
      
      // Set first child as active if available
      if (data.children && data.children.length > 0) {
        setActiveChild(data.children[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setSyncError('Failed to load data from cloud. Please refresh the page.');
    } finally {
      setDataLoading(false);
    }
  };

  // ========== SYNC DATA TO CLOUD ==========
  // Sync data whenever it changes
  useEffect(() => {
    if (user && (children.length > 0 || vaccines.length > 0 || healthLogs.length > 0)) {
      const syncData = async () => {
        try {
          await syncAllDataToCloud(user.uid, children, vaccines, healthLogs);
          setSyncError('');
        } catch (error) {
          console.error('Sync error:', error);
          setSyncError('Failed to sync data. Changes may not be saved to cloud.');
        }
      };
      
      syncData();
    }
  }, [children, vaccines, healthLogs, user]);

  useEffect(() => {
  const unsubscribe = onAuthChange((currentUser) => {
    if (currentUser) {
      // User logged in
      setUser(currentUser);
      setIsLoggedIn(true);
      // Clear previous user's data
      setChildren([]);
      setVaccines([]);
      setHealthLogs([]);
      setActiveChild(null);
      // Load new user's data
      loadDataFromCloud(currentUser.uid);
    } else {
      // User logged out
      setUser(null);
      setIsLoggedIn(false);
      // Clear all state
      setChildren([]);
      setVaccines([]);
      setHealthLogs([]);
      setActiveChild(null);
      setMedicines([]);
      setNewMedicine({ name: '', dosage: '', frequency: '', duration: '' });
      // Clear UI state
      setShowLoginForm(false);
      setLoginEmail('');
      setLoginPassword('');
      setAuthError('');
      setSyncError('');
    }
  });

  return unsubscribe;
}, []);

  // ========== AUTHENTICATION HANDLERS ==========

  /**
   * Handle user login
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    try {
      await loginUser(loginEmail, loginPassword);
      setShowLoginForm(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user registration
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    try {
      // Validate password strength
      if (loginPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      await registerUser(loginEmail, loginPassword);
      setIsRegistering(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logoutUser();
      setShowLoginForm(false);
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
    }
  };

  // ========== CHILD MANAGEMENT ==========

  /**
   * Add new child
   */
  const handleAddChild = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Validate input
    const childName = formData.get('childName')?.trim();
    if (!childName) {
      alert('Please enter child name');
      return;
    }

    const newChild = {
      id: `child_${Date.now()}`,
      name: childName,
      dob: formData.get('dob'),
      createdAt: new Date().toISOString()
    };

    const updatedChildren = [...children, newChild];
    setChildren(updatedChildren);
    setActiveChild(newChild);
    setShowAddChild(false);
    e.target.reset();
  };

  /**
   * Edit existing child
   */
  const handleEditChild = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const childName = formData.get('childName')?.trim();
    if (!childName) {
      alert('Please enter child name');
      return;
    }

    const updatedChild = {
      ...editingChildData,
      name: childName,
      dob: formData.get('dob')
    };

    setChildren(children.map(c => c.id === updatedChild.id ? updatedChild : c));
    setActiveChild(updatedChild);
    setShowEditChild(false);
  };

  /**
   * Remove child and all related data
   */
  const handleRemoveChild = async (childId) => {
    if (window.confirm('Are you sure? This will delete all data for this child.')) {
      const updatedChildren = children.filter(c => c.id !== childId);
      const updatedVaccines = vaccines.filter(v => v.childId !== childId);
      const updatedLogs = healthLogs.filter(l => l.childId !== childId);
      const updatedMedicines = healthLogs.filter(l => l.childId !== childId);
      
      setChildren(updatedChildren);
      setVaccines(updatedVaccines);
      setHealthLogs(updatedLogs);
      setMedicines(updatedMedicines);
      
      if (activeChild?.id === childId) {
        setActiveChild(updatedChildren.length > 0 ? updatedChildren[0] : null);
      }
    }
  };

  // ========== VACCINE MANAGEMENT ==========

  /**
   * Add new vaccine
   */
  const handleAddVaccine = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Validate input
    const vaccineName = formData.get('vaccineName')?.trim();
    if (!vaccineName || !activeChild) {
      alert('Please fill in required fields');
      return;
    }

    const vaccine = {
      id: `vac_${Date.now()}`,
      childId: activeChild.id,
      name: vaccineName,
      dateGiven: formData.get('dateGiven'),
      nextDueDate: formData.get('nextDueDate'),
      clinic: formData.get('clinic')?.trim() || '',
      notes: formData.get('notes')?.trim() || '',
      createdAt: new Date().toISOString()
    };

    setVaccines([...vaccines, vaccine]);
    setShowAddVaccine(false);
    e.target.reset();
  };

  /**
   * Edit existing vaccine
   */
  const handleEditVaccine = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const vaccineName = formData.get('vaccineName')?.trim();
    if (!vaccineName) {
      alert('Please fill in required fields');
      return;
    }

    const updatedVaccine = {
      ...editingVaccine,
      name: vaccineName,
      dateGiven: formData.get('dateGiven'),
      nextDueDate: formData.get('nextDueDate'),
      clinic: formData.get('clinic')?.trim() || '',
      notes: formData.get('notes')?.trim() || ''
    };

    setVaccines(vaccines.map(v => v.id === updatedVaccine.id ? updatedVaccine : v));
    setShowEditVaccine(false);
  };

  /**
   * Delete vaccine
   */
  const handleDeleteVaccine = async (vaccineId) => {
    if (window.confirm('Delete this vaccine record?')) {
      setVaccines(vaccines.filter(v => v.id !== vaccineId));
    }
  };

  // ========== HEALTH LOG MANAGEMENT ==========

  /**
   * Add new health log
   */
  const handleAddHealthLog = async (e) => {
    e.preventDefault();


    const formData = new FormData(e.target);
    
    // Validate inputs
    const weight = parseFloat(formData.get('weight'));
    const height = parseFloat(formData.get('height'));
    
    if (weight <= 0 || height <= 0) {
      alert('Weight and height must be greater than 0');
      return;
    }

    const log = {
      id: `log_${Date.now()}`,
      childId: activeChild.id,
      date: formData.get('date'),
      weight: weight,
      height: height,
      ailment: formData.get('ailment')?.trim(),
      medicines: [...medicines],
      notes: formData.get('notes')?.trim() || '',
      createdAt: new Date().toISOString()
    };

    const updatedLogs = [log, ...healthLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    setHealthLogs(updatedLogs);
    setShowAddHealth(false);
    setMedicines([]);
    setNewMedicine({ name: '', dosage: '', frequency: '', duration: '' });
    e.target.reset();
  };

  /**
   * Edit existing health log
   */
  const handleEditHealthLog = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    const weight = parseFloat(formData.get('weight'));
    const height = parseFloat(formData.get('height'));
    
    if (weight <= 0 || height <= 0) {
      alert('Weight and height must be greater than 0');
      return;
    }

    const updatedLog = {
      ...editingHealthLog,
      date: formData.get('date'),
      weight: weight,
      height: height,
      ailment: formData.get('ailment')?.trim(),
      medicines: [...medicines],
      notes: formData.get('notes')?.trim() || ''
    };

    setHealthLogs(healthLogs.map(l => l.id === updatedLog.id ? updatedLog : l));
    setShowEditHealth(false);
    setMedicines([]);
    setNewMedicine({ name: '', dosage: '', frequency: '', duration: '' });
  };

  /**
   * Delete health log
   */
  const handleDeleteHealthLog = async (logId) => {
    if (window.confirm('Delete this health log?')) {
      setHealthLogs(healthLogs.filter(l => l.id !== logId));
    }
  };

  // ========== MEDICINE HANDLERS ==========

  /**
   * Add medicine to current log being edited/created
   */
  const addMedicine = () => {


    setMedicines([...medicines, {
      name: newMedicine.name.trim(),
      dosage: newMedicine.dosage.trim(),
      frequency: newMedicine.frequency.trim() || 'Not specified',
      duration: newMedicine.duration.trim() || 'Not specified'
    }]);
    
    setNewMedicine({ name: '', dosage: '', frequency: '', duration: '' });
  };

  /**
   * Remove medicine from current list
   */
  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  // ========== DATA AGGREGATION FUNCTIONS ==========

  /**
   * Get consolidated medicines from all health logs
   */
  const getConsolidatedMedicines = () => {
    const medicineMap = {};
    const childLogs = healthLogs.filter(l => l.childId === activeChild?.id);
    childLogs.forEach(log => {
      log.medicines?.forEach(med => {
        if (!medicineMap[med.name]) {
          medicineMap[med.name] = {
            name: med.name,
            dosages: new Set(),
            usedFor: new Set(),
            frequencies: new Set(),
            totalUses: 0,
            lastUsed: log.date
          };
        }
        medicineMap[med.name].dosages.add(med.dosage);
        medicineMap[med.name].usedFor.add(log.ailment);
        medicineMap[med.name].frequencies.add(med.frequency);
        medicineMap[med.name].totalUses++;
        
        if (new Date(log.date) > new Date(medicineMap[med.name].lastUsed)) {
          medicineMap[med.name].lastUsed = log.date;
        }
      });
    });

    return Object.values(medicineMap).sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
  };

  /**
   * Get growth data for charts
   */
  const getGrowthData = () => {
    const childLogs = healthLogs.filter(log => log.childId === activeChild?.id);
    return childLogs
      .filter(log => log.weight && log.height)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: log.weight,
        height: log.height,
        fullDate: log.date
      }));
  };

  /**
   * Get upcoming vaccines with days remaining
   */
const getUpcomingVaccines = () => {
  const childVaccines = vaccines.filter(v => v.childId === activeChild?.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for fair comparison
  
  return childVaccines
    .filter(v => v.nextDueDate && new Date(v.nextDueDate) > today)  // ✅ Only future dates
    .map(v => ({
      ...v,
      daysLeft: Math.ceil((new Date(v.nextDueDate) - today) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);
};

  /**
   * Download health data as CSV
   */
  const downloadCSV = () => {
    let csv = 'Type,Date,Item,Details,Notes\n';
    
    const childVaccines = vaccines.filter(v => v.childId === activeChild?.id);
    const childLogs = healthLogs.filter(l => l.childId === activeChild?.id);
    
    childVaccines.forEach(v => {
      csv += `Vaccine,${v.dateGiven},${v.name},"Next: ${v.nextDueDate}",${v.clinic || 'N/A'}\n`;
    });

    childLogs.forEach(log => {
      const meds = log.medicines?.map(m => `${m.name} (${m.dosage})`).join(' | ') || 'None';
      csv += `Health Log,${log.date},${log.ailment},"Weight: ${log.weight}kg, Height: ${log.height}cm, Medicines: ${meds}",${log.notes || 'N/A'}\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `Health_Report_${activeChild?.name}_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // ========== RENDER LOGIN SCREEN ==========
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto text-center py-20">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Child Health Tracker</h1>
          <p className="text-lg text-gray-600 mb-8">Sign in to access your child's health records</p>
          
          <button
            onClick={() => {
              setShowLoginForm(true);
              setIsRegistering(false);
              setAuthError('');
            }}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-xl text-lg flex items-center justify-center gap-2 mx-auto"
          >
            <AddIcon /> Sign In
          </button>

          {/* LOGIN FORM MODAL */}
          {showLoginForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </h2>
                
                {authError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded">
                    <p className="text-sm text-red-700">{authError}</p>
                  </div>
                )}
                
                <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      disabled={isLoading}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      required
                      minLength="6"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    {isRegistering && (
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <SaveIcon /> {isLoading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
                  </button>
                </form>

                <div className="mt-4 text-sm text-center">
                  {isRegistering ? (
                    <>
                      Already have an account?{' '}
                      <button
                        onClick={() => {
                          setIsRegistering(false);
                          setAuthError('');
                        }}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 font-semibold disabled:text-gray-400"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{' '}
                      <button
                        onClick={() => {
                          setIsRegistering(true);
                          setAuthError('');
                        }}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 font-semibold disabled:text-gray-400"
                      >
                        Create One
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowLoginForm(false);
                    setAuthError('');
                  }}
                  disabled={isLoading}
                  className="w-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg transition mt-4 flex items-center justify-center gap-2"
                >
                  <CancelIcon /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== NO CHILD SCREEN ==========
  if (!activeChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Child Health Tracker</h1>
            <div>
              <p className="text-sm text-gray-600 mb-2">Signed in: {user?.email}</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>

          <p className="text-lg text-gray-600 mb-8">Start by adding your child's information</p>
          <button
            onClick={() => setShowAddChild(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg flex items-center justify-center gap-2 mx-auto"
          >
            <AddIcon /> Add Your First Child
          </button>

          {/* ADD CHILD MODAL */}
          {showAddChild && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Child</h2>
                <form onSubmit={handleAddChild} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Child's Name *</label>
                    <input
                      type="text"
                      name="childName"
                      placeholder="e.g., Vihan"
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      name="dob"
                      required
                      defaultValue={formatDateForInput(new Date())}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddChild(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <CancelIcon /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <SaveIcon /> Add Child
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== MAIN APP RENDER ==========
  const upcomingVaccines = getUpcomingVaccines();
  const consolidatedMedicines = getConsolidatedMedicines();
  const growthData = getGrowthData();
  const childVaccines = vaccines.filter(v => v.childId === activeChild?.id);
  const childLogs = healthLogs.filter(l => l.childId === activeChild?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 font-sans pb-24">
      {/* ========== HEADER ========== */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-2xl font-bold">Child Health Tracker</h1>
          <div className="text-sm">
            <p className="mb-1">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* ERROR MESSAGE */}
        {syncError && (
          <div className="bg-red-500 bg-opacity-20 border-l-2 border-red-300 p-2 rounded mb-3 text-sm">
            {syncError}
          </div>
        )}
        
        {/* CHILD SELECTOR */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setActiveChild(child)}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap text-sm transition ${
                activeChild.id === child.id
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-400 hover:bg-blue-300 text-white'
              }`}
            >
              {child.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddChild(true)}
            className="px-3 py-1.5 rounded-full font-semibold whitespace-nowrap text-sm bg-green-400 hover:bg-green-300 text-white transition flex items-center gap-1"
          >
            <AddIcon /> Add
          </button>
        </div>

        {/* CHILD ACTIONS */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              setEditingChildData(activeChild);
              setShowEditChild(true);
            }}
            className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition flex items-center gap-1"
          >
            <EditIcon /> Edit
          </button>
          {children.length > 1 && (
            <button
              onClick={() => handleRemoveChild(activeChild.id)}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition flex items-center gap-1"
            >
              <DeleteIcon /> Remove
            </button>
          )}
        </div>
      </div>

      {/* ========== CONTENT AREA - DASHBOARD TAB ========== */}
      <div className="max-w-2xl mx-auto p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* LOADING STATE */}
            {dataLoading && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-700">Loading your data...</p>
              </div>
            )}

            {/* CHILD PROFILE */}
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
              <h2 className="text-lg font-bold text-gray-800 mb-3">👶 Child Profile</h2>
              <div className="space-y-1 text-sm">
                <p className="text-gray-800"><strong>{activeChild.name}</strong></p>
                <p className="text-gray-600">DOB: {new Date(activeChild.dob).toLocaleDateString()}</p>
                <p className="text-gray-600">Age: {calculateAge(activeChild.dob)}</p>
              </div>
            </div>

            {/* LATEST MEASUREMENTS */}
            {childLogs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
                <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Latest Measurements</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="text-2xl font-bold text-blue-600">{childLogs[0].weight} kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Height</p>
                    <p className="text-2xl font-bold text-green-600">{childLogs[0].height} cm</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Last Check</p>
                    <p className="text-sm font-semibold text-gray-700">{new Date(childLogs[0].date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* GROWTH CHART */}
            {growthData.length >= 2 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">📈 Growth Trend</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} name="Weight (kg)" />
                    <Line type="monotone" dataKey="height" stroke="#10b981" strokeWidth={2} name="Height (cm)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* UPCOMING VACCINES */}
            {upcomingVaccines.length > 0 && (
              <div className="bg-gradient-to-r from-orange-100 to-red-50 rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
                <h2 className="text-lg font-bold text-gray-800 mb-3">⚠️ Upcoming Vaccines</h2>
                <div className="space-y-2">
                  {upcomingVaccines.slice(0, 3).map(vaccine => (
                    <div key={vaccine.id} className="bg-white rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{vaccine.name}</p>
                        <p className="text-sm text-gray-600">{vaccine.nextDueDate}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        vaccine.daysLeft <= 0 ? 'bg-red-200 text-red-800' :
                        vaccine.daysLeft <= 7 ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {vaccine.daysLeft <= 0 ? 'Overdue' : `${vaccine.daysLeft}d`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUICK ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingVaccine(null);
                  setShowAddVaccine(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
              >
                <AddIcon /> Add Vaccine
              </button>
              <button
                onClick={() => {
                  setEditingHealthLog(null);
                  setMedicines([]);
                  setShowAddHealth(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
              >
                <AddIcon /> Log Health
              </button>
            </div>
          </div>
        )}

        {/* ========== VACCINES TAB ========== */}
        {activeTab === 'vaccines' && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setEditingVaccine(null);
                setShowAddVaccine(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg mb-4"
            >
              <AddIcon /> Add New Vaccine
            </button>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Vaccine History</h2>
              {childVaccines.length === 0 ? (
                <p className="text-gray-600 text-center py-6">No vaccines recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {childVaccines.map((vaccine) => (
                    <div key={vaccine.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{vaccine.name}</h3>
                          <p className="text-sm text-gray-600">📅 Given: {vaccine.dateGiven}</p>
                          <p className="text-sm text-gray-600">📌 Next Due: {vaccine.nextDueDate}</p>
                          {vaccine.clinic && <p className="text-sm text-gray-600">🏥 {vaccine.clinic}</p>}
                          {vaccine.notes && <p className="text-sm text-gray-600 mt-1">{vaccine.notes}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingVaccine(vaccine);
                              setShowEditVaccine(true);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteVaccine(vaccine.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== HEALTH RECORDS TAB ========== */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setEditingHealthLog(null);
                setMedicines([]);
                setShowAddHealth(true);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg mb-4"
            >
              <AddIcon /> Add Health Log
            </button>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Health Log Timeline</h2>
              {!childLogs || childLogs.length === 0 ? (
                <p className="text-gray-600 text-center py-6">No health logs recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {childLogs.map((log) => (
                    <div key={log.id}>
                      <button
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className="w-full bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-l-4 border-green-400 text-left hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-gray-600">{new Date(log.date).toLocaleDateString()}</p>
                            <p className="text-gray-800 font-medium">{log.ailment}</p>
                            <div className="mt-2 flex gap-4 text-sm">
                              <span className="text-gray-600">W: <strong>{log.weight}</strong> kg</span>
                              <span className="text-gray-600">H: <strong>{log.height}</strong> cm</span>
                            </div>
                          </div>
                          <svg className={`w-5 h-5 text-gray-600 transition ${expandedLog === log.id ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z" />
                          </svg>
                        </div>
                      </button>

                      {expandedLog === log.id && (
                        <div className="bg-white rounded-b-lg p-4 border border-t-0 border-gray-200 space-y-3">
                          {log.medicines != null && (
                            <div>
                              <h4 className="font-bold text-gray-800 mb-2">💊 Medicines:</h4>
                              <div className="space-y-2">
                                {log.medicines.map((med, medIdx) => (
                                  <div key={medIdx} className="bg-blue-50 rounded p-3 border-l-2 border-blue-400">
                                    <p className="font-semibold text-gray-800">{med.name}</p>
                                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                                      <p>💊 Dosage: {med.dosage}</p>
                                      <p>⏰ Frequency: {med.frequency}</p>
                                      <p>📅 Duration: {med.duration}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {log.notes && (
                            <div>
                              <h4 className="font-bold text-gray-800 mb-1">Notes:</h4>
                              <p className="text-gray-600">{log.notes}</p>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <button
                              onClick={() => {
                                setEditingHealthLog(log);
                                setMedicines(log.medicines);
                                setShowEditHealth(true);
                                setExpandedLog(null);
                              }}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded flex items-center justify-center gap-1 text-sm"
                            >
                              <EditIcon /> Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteHealthLog(log.id);
                                setExpandedLog(null);
                              }}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded flex items-center justify-center gap-1 text-sm"
                            >
                              <DeleteIcon /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== MEDICINES TAB ========== */}
        {activeTab === 'medicines' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MedicineIcon /> Medicine Library
              </h2>
              <p className="text-sm text-gray-600 mb-4">All medicines used with dosages and frequency</p>
              {consolidatedMedicines.length === 0 ? (
                <p className="text-gray-600 text-center py-6">No medicines recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {consolidatedMedicines.map((med, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-400">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 text-lg">{med.name}</h3>
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                          Used {med.totalUses}x
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-700 mt-3">
                        <div>
                          <p className="text-gray-600 font-semibold">Used for:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.from(med.usedFor).map((use, i) => (
                              <span key={i} className="bg-white text-gray-700 px-2 py-1 rounded text-xs">
                                {use}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-600 font-semibold">Dosages used:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.from(med.dosages).map((dose, i) => (
                              <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                {dose}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-600 font-semibold">Frequency: <span className="font-normal">{Array.from(med.frequencies)[0] || 'N/A'}</span></p>
                        </div>

                        <div>
                          <p className="text-gray-600 font-semibold">Last used: <span className="font-normal text-gray-700">{new Date(med.lastUsed).toLocaleDateString()}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>

      {/* ========== MODALS - ADD/EDIT CHILD ========== */}
      {showAddChild && !showEditChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Child</h2>
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Child's Name *</label>
                <input
                  type="text"
                  name="childName"
                  placeholder="e.g., Vihan"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  required
                  defaultValue={formatDateForInput(new Date())}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddChild(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <CancelIcon /> Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <SaveIcon /> Add Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditChild && editingChildData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Child</h2>
            <form onSubmit={handleEditChild} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Child's Name *</label>
                <input
                  type="text"
                  name="childName"
                  defaultValue={editingChildData.name}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  defaultValue={formatDateForInput(editingChildData.dob)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditChild(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <CancelIcon /> Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <SaveIcon /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODALS - ADD/EDIT VACCINE ========== */}
      {showAddVaccine && !showEditVaccine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Add Vaccine</h3>
            <form onSubmit={handleAddVaccine} className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vaccine Name *</label>
                <input
                  type="text"
                  name="vaccineName"
                  placeholder="e.g., MMR"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Given </label>
                <input
                  type="date"
                  name="dateGiven"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Next Due Date</label>
                <input
                  type="date"
                  name="nextDueDate"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic/Provider Name (Optional)</label>
                <input
                  type="text"
                  name="clinic"
                  placeholder="e.g., City Hospital"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  placeholder="e.g., Side effects, arm used"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddVaccine(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <CancelIcon /> Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <SaveIcon /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditVaccine && editingVaccine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Edit Vaccine</h3>
            <form onSubmit={handleEditVaccine} className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vaccine Name *</label>
                <input
                  type="text"
                  name="vaccineName"
                  defaultValue={editingVaccine.name}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Given </label>
                <input
                  type="date"
                  name="dateGiven"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Next Due Date</label>
                <input
                  type="date"
                  name="nextDueDate"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic/Provider Name (Optional)</label>
                <input
                  type="text"
                  name="clinic"
                  defaultValue={editingVaccine.clinic || ''}
                  placeholder="e.g., City Hospital"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  defaultValue={editingVaccine.notes || ''}
                  placeholder="e.g., Side effects, arm used"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditVaccine(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <CancelIcon /> Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <SaveIcon /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODALS - ADD/EDIT HEALTH LOG ========== */}
      {showAddHealth && !showEditHealth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Log Health</h3>
            <form onSubmit={handleAddHealthLog} className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  defaultValue={formatDateForInput(new Date())}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg) *</label>
                <input type="number" step="0.1" placeholder="e.g., 15.5" name="weight" required className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm) *</label>
                <input type="number" step="0.1" placeholder="e.g., 95" name="height" required className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ailment/Symptoms *</label>
                <input type="text" placeholder="e.g., Fever, Cough" name="ailment" required className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* MEDICINES SECTION */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="font-bold text-gray-800 mb-3 text-sm">💊 Medicines Used *</p>
                
                {medicines.map((med, idx) => (
                  <div key={idx} className="bg-white rounded p-2 mb-2 flex justify-between items-start gap-2">
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-gray-800">{med.name}</p>
                      <p className="text-gray-600 text-xs">{med.dosage}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedicine(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                ))}

                <div className="space-y-2 mt-3 border-t pt-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Medicine Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Paracetamol"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g., 5ml"
                      value={newMedicine.dosage}
                      onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency</label>
                    <input
                      type="text"
                      placeholder="e.g., Every 6 hours"
                      value={newMedicine.frequency}
                      onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 2 days"
                      value={newMedicine.duration}
                      onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded font-semibold transition flex items-center justify-center gap-1"
                  >
                    <AddIcon /> Add Medicine
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea placeholder="e.g., Doctor's advice" name="notes" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" rows="2"></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddHealth(false);
                    setMedicines([]);
                    setNewMedicine({ name: '', dosage: '', frequency: '', duration: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <CancelIcon /> Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <SaveIcon /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditHealth && editingHealthLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Edit Health Log</h3>
            <form onSubmit={handleEditHealthLog} className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  defaultValue={formatDateForInput(editingHealthLog.date)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg) *</label>
                <input type="number" step="0.1" defaultValue={editingHealthLog.weight} name="weight" required className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm) *</label>
                <input type="number" step="0.1" defaultValue={editingHealthLog.height} name="height" required className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ailment/Symptoms *</label>
                <input type="text" defaultValue={editingHealthLog.ailment} name="ailment" required className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* MEDICINES SECTION */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="font-bold text-gray-800 mb-3 text-sm">💊 Medicines Used *</p>
                
                {medicines.map((med, idx) => (
                  <div key={idx} className="bg-white rounded p-2 mb-2 flex justify-between items-start gap-2">
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-gray-800">{med.name}</p>
                      <p className="text-gray-600 text-xs">{med.dosage}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedicine(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                ))}

                <div className="space-y-2 mt-3 border-t pt-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Medicine Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Paracetamol"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g., 5ml"
                      value={newMedicine.dosage}
                      onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency</label>
                    <input
                      type="text"
                      placeholder="e.g., Every 6 hours"
                      value={newMedicine.frequency}
                      onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 2 days"
                      value={newMedicine.duration}
                      onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded font-semibold transition flex items-center justify-center gap-1"
                  >
                    <AddIcon /> Add Medicine
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea defaultValue={editingHealthLog.notes || ''} name="notes" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" rows="2"></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditHealth(false);
                    setMedicines([]);
                    setNewMedicine({ name: '', dosage: '', frequency: '', duration: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <CancelIcon /> Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <SaveIcon /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== BOTTOM NAVIGATION ========== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto grid grid-cols-5 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Home', icon: HomeIcon },
            { id: 'vaccines', label: 'Vaccines', icon: VaccineIcon },
            { id: 'health', label: 'Health', icon: HealthIcon },
            { id: 'medicines', label: 'Medicines', icon: MedicineIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 transition flex flex-col items-center justify-center ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600 border-t-2 border-blue-600' : 'text-gray-600'
                }`}
                title={tab.label}
              >
                <Icon />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
