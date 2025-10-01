import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [activeSection, setActiveSection] = useState('personal');
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ personal: [], banking: [], family: [] });
  const [personalList, setPersonalList] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/${activeSection}`);
      setData(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch data');
    }
  }, [activeSection]);

  const fetchPersonalList = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/personal`);
      setPersonalList(response.data);
    } catch (error) {
      console.error('Failed to fetch personal list');
    }
  }, []);

  const handleSearch = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/search?q=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed');
    }
  }, [searchTerm]);

  // Fetch data based on active section
  useEffect(() => {
    fetchData();
    fetchPersonalList();
  }, [fetchData, fetchPersonalList]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        setSearchResults({ personal: [], banking: [], family: [] });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData(getEmptyFormData());
  };

  const handleEdit = (item) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData(item);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/${activeSection}/${id}`);
        showMessage('success', 'Deleted successfully');
        fetchData();
      } catch (error) {
        showMessage('error', 'Failed to delete');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${activeSection}/${editingId}`, formData);
        showMessage('success', 'Updated successfully');
      } else {
        await axios.post(`${API_URL}/${activeSection}`, formData);
        showMessage('success', 'Added successfully');
      }
      setShowForm(false);
      setFormData({});
      fetchData();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Operation failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  const getEmptyFormData = () => {
    switch (activeSection) {
      case 'personal':
        return { first_name: '', last_name: '', email: '', phone: '', address: '', date_of_birth: '' };
      case 'banking':
        return { personal_id: '', bank_name: '', account_number: '', account_type: '', ifsc_code: '', branch_name: '' };
      case 'family':
        return { personal_id: '', relation: '', name: '', age: '', occupation: '' };
      default:
        return {};
    }
  };

  const renderForm = () => {
    if (!showForm) return null;

    switch (activeSection) {
      case 'personal':
        return (
          <div className="form-container">
            <h2>{editingId ? 'Edit' : 'Add'} Personal Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth ? formData.date_of_birth.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div className="action-buttons">
                <button type="submit" className="btn btn-success">
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );

      case 'banking':
        return (
          <div className="form-container">
            <h2>{editingId ? 'Edit' : 'Add'} Banking Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Person *</label>
                <select
                  value={formData.personal_id || ''}
                  onChange={(e) => setFormData({ ...formData, personal_id: e.target.value })}
                  required
                >
                  <option value="">Select Person</option>
                  {personalList.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.first_name} {person.last_name} ({person.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Bank Name *</label>
                <input
                  type="text"
                  value={formData.bank_name || ''}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  value={formData.account_number || ''}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Type</label>
                <select
                  value={formData.account_type || ''}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                >
                  <option value="">Select Type</option>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                </select>
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifsc_code || ''}
                  onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Branch Name</label>
                <input
                  type="text"
                  value={formData.branch_name || ''}
                  onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                />
              </div>
              <div className="action-buttons">
                <button type="submit" className="btn btn-success">
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );

      case 'family':
        return (
          <div className="form-container">
            <h2>{editingId ? 'Edit' : 'Add'} Family Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Person *</label>
                <select
                  value={formData.personal_id || ''}
                  onChange={(e) => setFormData({ ...formData, personal_id: e.target.value })}
                  required
                >
                  <option value="">Select Person</option>
                  {personalList.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.first_name} {person.last_name} ({person.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Relation *</label>
                <select
                  value={formData.relation || ''}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  required
                >
                  <option value="">Select Relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  value={formData.occupation || ''}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                />
              </div>
              <div className="action-buttons">
                <button type="submit" className="btn btn-success">
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  const renderTable = () => {
    if (data.length === 0) {
      return <p className="no-results">No data available. Click "Add New" to create a record.</p>;
    }

    switch (activeSection) {
      case 'personal':
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Date of Birth</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.first_name} {item.last_name}</td>
                  <td>{item.email}</td>
                  <td>{item.phone || '-'}</td>
                  <td>{item.address || '-'}</td>
                  <td>{item.date_of_birth ? new Date(item.date_of_birth).toLocaleDateString() : '-'}</td>
                  <td className="actions">
                    <button className="btn btn-primary" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'banking':
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Person</th>
                <th>Bank Name</th>
                <th>Account Number</th>
                <th>Account Type</th>
                <th>IFSC Code</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.first_name} {item.last_name}</td>
                  <td>{item.bank_name}</td>
                  <td>{item.account_number}</td>
                  <td>{item.account_type || '-'}</td>
                  <td>{item.ifsc_code || '-'}</td>
                  <td>{item.branch_name || '-'}</td>
                  <td className="actions">
                    <button className="btn btn-primary" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'family':
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Person</th>
                <th>Relation</th>
                <th>Name</th>
                <th>Age</th>
                <th>Occupation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.first_name} {item.last_name}</td>
                  <td>{item.relation}</td>
                  <td>{item.name}</td>
                  <td>{item.age || '-'}</td>
                  <td>{item.occupation || '-'}</td>
                  <td className="actions">
                    <button className="btn btn-primary" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>PERN Dashboard</h1>
      </div>

      <div className="dashboard">
        {/* Left Panel - Navigation */}
        <div className="left-panel">
          <h2>Navigation</h2>
          <ul className="nav-menu">
            <li
              className={`nav-item ${activeSection === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveSection('personal')}
            >
              Personal Details
            </li>
            <li
              className={`nav-item ${activeSection === 'banking' ? 'active' : ''}`}
              onClick={() => setActiveSection('banking')}
            >
              Banking Details
            </li>
            <li
              className={`nav-item ${activeSection === 'family' ? 'active' : ''}`}
              onClick={() => setActiveSection('family')}
            >
              Family Details
            </li>
          </ul>
        </div>

        {/* Center Panel - Forms and Data */}
        <div className="center-panel">
          <h2>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Management</h2>

          {message.text && (
            <div className={message.type === 'error' ? 'error' : 'success'}>
              {message.text}
            </div>
          )}

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleAdd}>
              + Add New
            </button>
            <button className="btn btn-secondary" onClick={fetchData}>
              Refresh
            </button>
          </div>

          {renderForm()}
          {renderTable()}
        </div>

        {/* Right Panel - Search */}
        <div className="right-panel">
          <h2>Search</h2>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search across all data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="search-results">
            {searchTerm && (
              <>
                {searchResults.personal.length > 0 && (
                  <div className="search-category">
                    <h3>Personal ({searchResults.personal.length})</h3>
                    {searchResults.personal.map(item => (
                      <div key={item.id} className="search-item" onClick={() => {
                        setActiveSection('personal');
                        handleEdit(item);
                      }}>
                        <strong>{item.first_name} {item.last_name}</strong>
                        <small>{item.email}</small>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.banking.length > 0 && (
                  <div className="search-category">
                    <h3>Banking ({searchResults.banking.length})</h3>
                    {searchResults.banking.map(item => (
                      <div key={item.id} className="search-item" onClick={() => {
                        setActiveSection('banking');
                        handleEdit(item);
                      }}>
                        <strong>{item.bank_name}</strong>
                        <small>{item.account_number} - {item.first_name} {item.last_name}</small>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.family.length > 0 && (
                  <div className="search-category">
                    <h3>Family ({searchResults.family.length})</h3>
                    {searchResults.family.map(item => (
                      <div key={item.id} className="search-item" onClick={() => {
                        setActiveSection('family');
                        handleEdit(item);
                      }}>
                        <strong>{item.name}</strong>
                        <small>{item.relation} - {item.first_name} {item.last_name}</small>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.personal.length === 0 &&
                 searchResults.banking.length === 0 &&
                 searchResults.family.length === 0 && (
                  <p className="no-results">No results found</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
