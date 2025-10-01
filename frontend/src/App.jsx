import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function App() {
  const [activeSection, setActiveSection] = useState('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    personal: { firstName: '', lastName: '', nic: '', address: '' },
    bank: { accountNumber: '', bankName: '', branch: '', balance: 0 },
    family: []
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await axios.get(`${API_URL}/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to search. Please check if the backend is running.';
      alert(message);
    }
  };

  const loadPerson = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/person/${id}`);
      const data = response.data;
      
      setSelectedPerson(id);
      setFormData({
        personal: {
          firstName: data.personal.first_name || '',
          lastName: data.personal.last_name || '',
          nic: data.personal.nic || '',
          address: data.personal.address || ''
        },
        bank: data.bank ? {
          accountNumber: data.bank.account_number || '',
          bankName: data.bank.bank_name || '',
          branch: data.bank.branch || '',
          balance: data.bank.balance || 0
        } : { accountNumber: '', bankName: '', branch: '', balance: 0 },
        family: data.family.map(f => ({
          relation: f.relation,
          firstName: f.first_name,
          lastName: f.last_name,
          nic: f.nic || ''
        }))
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Load person error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to load person details';
      alert(message);
    }
  };

  const handleAddNew = () => {
    setSelectedPerson(null);
    setFormData({
      personal: { firstName: '', lastName: '', nic: '', address: '' },
      bank: { accountNumber: '', bankName: '', branch: '', balance: 0 },
      family: []
    });
    setIsEditing(true);
    setSearchResults([]);
  };

  const handleUpdate = async () => {
    if (!selectedPerson) {
      await handleCreate();
      return;
    }

    try {
      await axios.put(`${API_URL}/person/${selectedPerson}`, formData);
      alert('Updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to update';
      alert(message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await axios.post(`${API_URL}/person`, formData);
      alert('Created successfully');
      setSelectedPerson(response.data.id);
      setIsEditing(false);
      loadPerson(response.data.id);
    } catch (error) {
      console.error('Create error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to create';
      alert(message);
    }
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;
    if (!confirm('Are you sure you want to delete this person?')) return;

    try {
      await axios.delete(`${API_URL}/person/${selectedPerson}`);
      alert('Deleted successfully');
      handleAddNew();
    } catch (error) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to delete';
      alert(message);
    }
  };

  const updatePersonalField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const updateBankField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bank: { ...prev.bank, [field]: value }
    }));
  };

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      family: [...prev.family, { relation: '', firstName: '', lastName: '', nic: '' }]
    }));
  };

  const updateFamilyMember = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      family: prev.family.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const removeFamilyMember = (index) => {
    setFormData(prev => ({
      ...prev,
      family: prev.family.filter((_, i) => i !== index)
    }));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* LEFT PANEL */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px' }}>Dashboard</h2>
        <button
          onClick={handleAddNew}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          + Add New Person
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => setActiveSection('personal')}
            style={{
              padding: '12px',
              backgroundColor: activeSection === 'personal' ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveSection('bank')}
            style={{
              padding: '12px',
              backgroundColor: activeSection === 'bank' ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Banking Details
          </button>
          <button
            onClick={() => setActiveSection('family')}
            style={{
              padding: '12px',
              backgroundColor: activeSection === 'family' ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Family Details
          </button>
        </div>
      </div>

      {/* CENTER PANEL */}
      <div style={{ flex: 1, padding: '30px', backgroundColor: '#ecf0f1', overflowY: 'auto' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            {activeSection === 'personal' && 'Personal Details'}
            {activeSection === 'bank' && 'Banking Details'}
            {activeSection === 'family' && 'Family Details'}
          </h2>

          {activeSection === 'personal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>First Name</label>
                <input
                  type="text"
                  value={formData.personal.firstName}
                  onChange={(e) => updatePersonalField('firstName', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Last Name</label>
                <input
                  type="text"
                  value={formData.personal.lastName}
                  onChange={(e) => updatePersonalField('lastName', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>NIC Number</label>
                <input
                  type="text"
                  value={formData.personal.nic}
                  onChange={(e) => updatePersonalField('nic', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Address</label>
                <textarea
                  value={formData.personal.address}
                  onChange={(e) => updatePersonalField('address', e.target.value)}
                  rows="3"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
            </div>
          )}

          {activeSection === 'bank' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Account Number</label>
                <input
                  type="text"
                  value={formData.bank.accountNumber}
                  onChange={(e) => updateBankField('accountNumber', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bank Name</label>
                <input
                  type="text"
                  value={formData.bank.bankName}
                  onChange={(e) => updateBankField('bankName', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Branch</label>
                <input
                  type="text"
                  value={formData.bank.branch}
                  onChange={(e) => updateBankField('branch', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Balance</label>
                <input
                  type="number"
                  value={formData.bank.balance}
                  onChange={(e) => updateBankField('balance', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
            </div>
          )}

          {activeSection === 'family' && (
            <div>
              <button
                onClick={addFamilyMember}
                style={{
                  padding: '10px 20px',
                  marginBottom: '20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                + Add Family Member
              </button>
              {formData.family.map((member, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4>Family Member {index + 1}</h4>
                    <button
                      onClick={() => removeFamilyMember(index)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Relation"
                      value={member.relation}
                      onChange={(e) => updateFamilyMember(index, 'relation', e.target.value)}
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    <input
                      type="text"
                      placeholder="First Name"
                      value={member.firstName}
                      onChange={(e) => updateFamilyMember(index, 'firstName', e.target.value)}
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={member.lastName}
                      onChange={(e) => updateFamilyMember(index, 'lastName', e.target.value)}
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    <input
                      type="text"
                      placeholder="NIC Number"
                      value={member.nic}
                      onChange={(e) => updateFamilyMember(index, 'nic', e.target.value)}
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button
              onClick={handleUpdate}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {selectedPerson ? 'Update' : 'Create'}
            </button>
            {selectedPerson && (
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: '300px', backgroundColor: '#34495e', color: 'white', padding: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>Search</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or NIC"
            disabled={selectedPerson !== null && !isEditing}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '5px',
              opacity: selectedPerson !== null && !isEditing ? 0.5 : 1
            }}
          />
          <button
            onClick={handleSearch}
            disabled={selectedPerson !== null && !isEditing}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: selectedPerson !== null && !isEditing ? 'not-allowed' : 'pointer',
              opacity: selectedPerson !== null && !isEditing ? 0.5 : 1
            }}
          >
            Search
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {searchResults.map((person) => (
            <div
              key={person.id}
              onClick={() => loadPerson(person.id)}
              style={{
                padding: '15px',
                backgroundColor: '#2c3e50',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a252f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2c3e50'}
            >
              <div style={{ fontWeight: 'bold' }}>
                {person.first_name} {person.last_name}
              </div>
              <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
                NIC: {person.nic}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}