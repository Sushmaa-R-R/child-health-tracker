import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// IndexedDB Setup
const DB_NAME = 'ChildHealthTracker';
const DB_VERSION = 1;
const STORE_NAMES = {
  CHILDREN: 'children',
  VACCINES: 'vaccines',
  HEALTH_LOGS: 'healthLogs',
  APP_STATE: 'appState'
};

class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(STORE_NAMES.CHILDREN)) {
          db.createObjectStore(STORE_NAMES.CHILDREN, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_NAMES.VACCINES)) {
          db.createObjectStore(STORE_NAMES.VACCINES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_NAMES.HEALTH_LOGS)) {
          db.createObjectStore(STORE_NAMES.HEALTH_LOGS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_NAMES.APP_STATE)) {
          db.createObjectStore(STORE_NAMES.APP_STATE, { keyPath: 'key' });
        }
      };
    });
  }

  async addChild(child) {
    const transaction = this.db.transaction([STORE_NAMES.CHILDREN], 'readwrite');
    return new Promise((resolve, reject) => {
      transaction.objectStore(STORE_NAMES.CHILDREN).add(child);
      transaction.oncomplete = () => resolve(child);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getChildren() {
    const transaction = this.db.transaction([STORE_NAMES.CHILDREN], 'readonly');
    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(STORE_NAMES.CHILDREN).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateChild(child) {
    const transaction = this.db.transaction([STORE_NAMES.CHILDREN], 'readwrite');
    return new Promise((resolve, reject) => {
      transaction.objectStore(STORE_NAMES.CHILDREN).put(child);
      transaction.oncomplete = () => resolve(child);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async deleteChild(childId) {
    const transaction = this.db.transaction([STORE_NAMES.CHILDREN], 'readwrite');
    return new Promise((resolve, reject) => {
      transaction.objectStore(STORE_NAMES.CHILDREN).delete(childId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async addVaccine(vaccine) {
    const transaction = this.db.transaction([STORE_NAMES.VACCINES], 'readwrite');
    return new Promise((resolve, reject) => {
      transaction.objectStore(STORE_NAMES.VACCINES).add(vaccine);
      transaction.oncomplete = () => resolve(vaccine);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getVaccines(childId) {
    const transaction = this.db.transaction([STORE_NAMES.VACCINES], 'readonly');
    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(STORE_NAMES.VACCINES).getAll();
      request.onsuccess = () => {
        const vaccines = request.result.filter(v => v.childId === childId);
        resolve(vaccines);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVaccine(vaccineId) {
    const transaction = this.db.transaction([STORE_NAMES.VACCINES], 'readwrite');
    return new Promise((resolve, reject) => {
      transaction.objectStore(STORE_NAMES.VACCINES).delete(vaccineId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async addHealthLog(log) {
    const transaction = this.db.transaction([STORE_NAMES.HEALTH_LOGS], 'readwrite');
    return new Promise((resolve, reject) => {
      transaction.objectStore(STORE_NAMES.HEALTH_LOGS).add(log);
      transaction.oncomplete = () => resolve(log);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getHealthLogs(childId) {
    const transaction = this.db.transaction([STORE_NAMES.HEALTH_LOGS], 'readonly');
    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(STORE_NAMES.HEALTH_LOGS).getAll();
      request.onsuccess = () => {
        const logs = request.result.filter(l => l.childId === childId).sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteHealthLog(logId) {
    const transaction = this.db.transaction([STORE_NAMES.HEALTH_LOGS], 'readwrite');
    return new Promise((resolve, reject) => {
      transaction.objectStore(STORE_NAMES.HEALTH_LOGS).delete(logId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async saveState(key, value) {
    const transaction = this.db.transaction([STORE_NAMES.APP_STATE], 'readwrite');
    return new Promise((resolve, reject) => {
      transaction.objectStore(STORE_NAMES.APP_STATE).put({ key, value });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getState(key) {
    const transaction = this.db.transaction([STORE_NAMES.APP_STATE], 'readonly');
    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(STORE_NAMES.APP_STATE).get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }
}

// Helper function to format date for input
const formatDateForInput = (dateString) => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Material Design Icon Components
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
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
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

// Main App Component
export default function ChildHealthTracker() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeChild, setActiveChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showEditChild, setShowEditChild] = useState(false);
  const [editingChildData, setEditingChildData] = useState(null);
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [showAddHealth, setShowAddHealth] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', frequency: '', duration: '' });
  const dbRef = useRef(null);

  // Initialize
  useEffect(() => {
    const initDB = async () => {
      const dbManager = new IndexedDBManager();
      await dbManager.init();
      dbRef.current = dbManager;

      const savedChildren = await dbManager.getChildren();
      setChildren(savedChildren);

      if (savedChildren.length > 0) {
        const lastChild = await dbManager.getState('lastActiveChild');
        const childToLoad = lastChild ? savedChildren.find(c => c.id === lastChild) : savedChildren[0];
        
        if (childToLoad) {
          setActiveChild(childToLoad);
          await loadChildData(childToLoad.id, dbManager);
        }
      }
    };

    initDB();
  }, []);

  const loadChildData = async (childId, dbManager) => {
    const logs = await dbManager.getHealthLogs(childId);
    const vacs = await dbManager.getVaccines(childId);
    setHealthLogs(logs);
    setVaccines(vacs);
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newChild = {
      id: `child_${Date.now()}`,
      name: formData.get('childName'),
      dob: formData.get('dob'),
      createdAt: new Date().toISOString()
    };

    await dbRef.current.addChild(newChild);
    setChildren([...children, newChild]);
    setActiveChild(newChild);
    await dbRef.current.saveState('lastActiveChild', newChild.id);
    setShowAddChild(false);
    e.target.reset();
    
    await loadChildData(newChild.id, dbRef.current);
  };

  const handleEditChild = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedChild = {
      ...editingChildData,
      name: formData.get('childName'),
      dob: formData.get('dob')
    };

    await dbRef.current.updateChild(updatedChild);
    
    setChildren(children.map(c => c.id === updatedChild.id ? updatedChild : c));
    setActiveChild(updatedChild);
    setShowEditChild(false);
    e.target.reset();
  };

  const handleRemoveChild = async (childId) => {
    if (window.confirm('Are you sure you want to remove this child? All data will be deleted.')) {
      await dbRef.current.deleteChild(childId);
      
      const vaccines = await dbRef.current.getVaccines(childId);
      for (const vac of vaccines) {
        await dbRef.current.deleteVaccine(vac.id);
      }
      
      const logs = await dbRef.current.getHealthLogs(childId);
      for (const log of logs) {
        await dbRef.current.deleteHealthLog(log.id);
      }

      const updatedChildren = children.filter(c => c.id !== childId);
      setChildren(updatedChildren);
      
      if (activeChild?.id === childId) {
        if (updatedChildren.length > 0) {
          setActiveChild(updatedChildren[0]);
          await loadChildData(updatedChildren[0].id, dbRef.current);
        } else {
          setActiveChild(null);
          setVaccines([]);
          setHealthLogs([]);
        }
      }
    }
  };

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const vaccine = {
      id: `vac_${Date.now()}`,
      childId: activeChild.id,
      name: formData.get('vaccineName'),
      dateGiven: formData.get('dateGiven'),
      nextDueDate: formData.get('nextDueDate'),
      clinic: formData.get('clinic'),
      notes: formData.get('notes'),
      createdAt: new Date().toISOString()
    };

    await dbRef.current.addVaccine(vaccine);
    setVaccines([...vaccines, vaccine]);
    setShowAddVaccine(false);
    e.target.reset();
  };

  const handleDeleteVaccine = async (vaccineId) => {
    if (window.confirm('Delete this vaccine record?')) {
      await dbRef.current.deleteVaccine(vaccineId);
      setVaccines(vaccines.filter(v => v.id !== vaccineId));
    }
  };

  const handleAddHealthLog = async (e) => {
    e.preventDefault();
    // if (medicines.length === 0) {
    //   alert('Please add at least one medicine');
    //   return;
    // }

    const formData = new FormData(e.target);
    const log = {
      id: `log_${Date.now()}`,
      childId: activeChild.id,
      date: formData.get('date'),
      weight: parseFloat(formData.get('weight')),
      height: parseFloat(formData.get('height')),
      ailment: formData.get('ailment'),
      medicines: medicines,
      notes: formData.get('notes'),
      createdAt: new Date().toISOString()
    };

    await dbRef.current.addHealthLog(log);
    const updatedLogs = [log, ...healthLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    setHealthLogs(updatedLogs);
    setShowAddHealth(false);
    setMedicines([]);
    e.target.reset();
  };

  const handleDeleteHealthLog = async (logId) => {
    if (window.confirm('Delete this health log?')) {
      await dbRef.current.deleteHealthLog(logId);
      setHealthLogs(healthLogs.filter(l => l.id !== logId));
    }
  };

  const addMedicine = () => {
    if (newMedicine.name && newMedicine.dosage) {
      setMedicines([...medicines, newMedicine]);
      setNewMedicine({ name: '', dosage: '', frequency: '', duration: '' });
    }
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const getConsolidatedMedicines = () => {
    const medicineMap = {};
    healthLogs.forEach(log => {
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

  const getGrowthData = () => {
    return healthLogs
      .filter(log => log.weight && log.height)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: log.weight,
        height: log.height,
        fullDate: log.date
      }));
  };

  const getUpcomingVaccines = () => {
    return vaccines
      .filter(v => v.nextDueDate)
      .map(v => ({
        ...v,
        daysLeft: Math.ceil((new Date(v.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const downloadCSV = () => {
    let csv = 'Type,Date,Item,Details,Notes\n';
    
    vaccines.forEach(v => {
      csv += `Vaccine,${v.dateGiven},${v.name},"Next: ${v.nextDueDate}",${v.clinic || 'N/A'}\n`;
    });

    healthLogs.forEach(log => {
      const meds = log.medicines?.map(m => `${m.name} (${m.dosage})`).join(' | ') || 'None';
      csv += `Health Log,${log.date},${log.ailment},"Weight: ${log.weight}kg, Height: ${log.height}cm, Medicines: ${meds}",${log.notes || 'N/A'}\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `Health_Report_${activeChild.name}_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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

  if (!activeChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Child Health Tracker</h1>
          <p className="text-lg text-gray-600 mb-8">Start by adding your child's information</p>
          <button
            onClick={() => setShowAddChild(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg flex items-center justify-center gap-2 mx-auto"
          >
            <AddIcon /> Add Your First Child
          </button>

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

  const upcomingVaccines = getUpcomingVaccines();
  const consolidatedMedicines = getConsolidatedMedicines();
  const growthData = getGrowthData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 shadow-lg sticky top-0 z-40">
        <h1 className="text-2xl font-bold mb-3">Child Health Tracker</h1>
        
        {/* Child Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => {
                setActiveChild(child);
                loadChildData(child.id, dbRef.current);
                dbRef.current.saveState('lastActiveChild', child.id);
              }}
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

        {/* Child Actions */}
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

      {/* Edit Child Modal */}
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

      {/* Content Area */}
      <div className="max-w-2xl mx-auto p-4">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Child Info */}
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
              <h2 className="text-lg font-bold text-gray-800 mb-3">👶 Child Profile</h2>
              <div className="space-y-1 text-sm">
                <p className="text-gray-800"><strong>{activeChild.name}</strong></p>
                <p className="text-gray-600">DOB: {new Date(activeChild.dob).toLocaleDateString()}</p>
                <p className="text-gray-600">Age: {calculateAge(activeChild.dob)}</p>
              </div>
            </div>

            {/* Quick Stats */}
            {healthLogs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
                <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Latest Measurements</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="text-2xl font-bold text-blue-600">{healthLogs[0].weight} kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Height</p>
                    <p className="text-2xl font-bold text-green-600">{healthLogs[0].height} cm</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Last Check</p>
                    <p className="text-sm font-semibold text-gray-700">{new Date(healthLogs[0].date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Growth Chart */}
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

            {/* Upcoming Vaccines */}
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

            {/* Recent Health Logs */}
            {healthLogs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
                <h2 className="text-lg font-bold text-gray-800 mb-4">❤️ Recent Health Logs</h2>
                <div className="space-y-3">
                  {healthLogs.slice(0, 3).map((log, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-2 border-purple-400">
                      <p className="text-sm font-semibold text-gray-600">{new Date(log.date).toLocaleDateString()}</p>
                      <p className="text-gray-800 font-medium">{log.ailment}</p>
                      {log.medicines.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">💊 {log.medicines.map(m => m.name).join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowAddVaccine(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
              >
                <AddIcon /> Add Vaccine
              </button>
              <button
                onClick={() => setShowAddHealth(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
              >
                <AddIcon /> Log Health
              </button>
            </div>
          </div>
        )}

        {/* VACCINES TAB */}
        {activeTab === 'vaccines' && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAddVaccine(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg mb-4"
            >
              <AddIcon /> Add New Vaccine
            </button>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Vaccine History</h2>
              {vaccines.length === 0 ? (
                <p className="text-gray-600 text-center py-6">No vaccines recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {vaccines.map((vaccine) => (
                    <div key={vaccine.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">{vaccine.name}</h3>
                          <p className="text-sm text-gray-600">📅 Given: {vaccine.dateGiven}</p>
                          <p className="text-sm text-gray-600">📌 Next Due: {vaccine.nextDueDate}</p>
                          {vaccine.clinic && <p className="text-sm text-gray-600">🏥 {vaccine.clinic}</p>}
                          {vaccine.notes && <p className="text-sm text-gray-600 mt-1">{vaccine.notes}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteVaccine(vaccine.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HEALTH RECORDS TAB */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAddHealth(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg mb-4"
            >
              <AddIcon /> Add Health Log
            </button>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Health Log Timeline</h2>
              {healthLogs.length === 0 ? (
                <p className="text-gray-600 text-center py-6">No health logs recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {healthLogs.map((log, idx) => (
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
                          <div className="flex gap-2">
                            <svg className={`w-5 h-5 text-gray-600 transition ${expandedLog === log.id ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7 10l5 5 5-5z" />
                            </svg>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHealthLog(log.id);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      </button>

                      {expandedLog === log.id && (
                        <div className="bg-white rounded-b-lg p-4 border border-t-0 border-gray-200 space-y-3">
                          {log.medicines.length > 0 && (
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MEDICINES TAB */}
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

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Settings & Options</h2>
              <div className="space-y-3">
                <button
                  onClick={downloadCSV}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <DownloadIcon /> Download Health Report (CSV)
                </button>
                <button
                  onClick={() => setShowAddChild(true)}
                  className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <AddIcon /> Add Another Child
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
              <h3 className="font-bold text-gray-800 mb-3">🔔 Notifications</h3>
              <p className="text-sm text-gray-600 mb-3">
                When you set up AWS Lambda and EventBridge, the app will automatically send health reports every 2 months to rrsushmaa@gmail.com at 9 AM.
              </p>
              <p className="text-xs text-gray-500">
                Setup guides available in documentation for later configuration.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-md p-6 border-l-4 border-green-500">
              <h3 className="font-bold text-gray-800 mb-3">📱 Data Storage</h3>
              <p className="text-sm text-gray-600 mb-2">
                ✓ All data stored locally on your device (IndexedDB)
              </p>
              <p className="text-sm text-gray-600 mb-2">
                ✓ No cloud sync (your privacy)
              </p>
              <p className="text-sm text-gray-600">
                ✓ Export to CSV anytime using the button above
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
              <h3 className="font-bold text-gray-800 mb-3">✨ Features Included</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Multi-child support with edit/delete</li>
                <li>✓ Vaccine tracking with reminders</li>
                <li>✓ Health logs with multiple medicines</li>
                <li>✓ Growth charts (weight & height)</li>
                <li>✓ Consolidated medicines view</li>
                <li>✓ CSV export</li>
                <li>✓ Auto-email (AWS Lambda - setup later)</li>
                <li>✓ Push notifications (setup later)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Add Vaccine Modal */}
      {showAddVaccine && (
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
                  defaultValue={formatDateForInput(new Date())}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Next Due Date</label>
                <input
                  type="date"
                  name="nextDueDate"
                  defaultValue={formatDateForInput(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))}
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

      {/* Add Health Log Modal */}
      {showAddHealth && (
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

              {/* Medicines Section */}
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto grid grid-cols-5 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Home', icon: HomeIcon },
            { id: 'vaccines', label: 'Vaccines', icon: VaccineIcon },
            { id: 'health', label: 'Health', icon: HealthIcon },
            { id: 'medicines', label: 'Medicines', icon: MedicineIcon },
            { id: 'settings', label: 'Settings', icon: SettingsIcon }
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
