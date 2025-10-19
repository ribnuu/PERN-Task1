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
    family: [],
    vehicles: [],
    bodyMarks: [],
    usedDevices: [],
    callHistory: []
  });

  // Family relationship options
  const familyRelationships = [
    { category: 'Immediate Family', options: ['Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Husband', 'Wife'] },
    { category: 'Extended Family', options: ['Grandfather', 'Grandmother', 'Grandson', 'Granddaughter', 'Uncle', 'Aunt', 'Nephew', 'Niece', 'Cousin', 'Brother-in-law', 'Sister-in-law', 'Father-in-law', 'Mother-in-law', 'Son-in-law', 'Daughter-in-law'] },
    { category: 'Friends & Others', options: ['Friend', 'Close Friend', 'Best Friend', 'Colleague', 'Neighbor', 'Other'] }
  ];

  // Device type options
  const deviceTypes = ['Phone', 'Laptop', 'Desktop', 'Pager'];

  // Call type options
  const callTypes = ['Incoming', 'Outgoing', 'Missed Call'];

  // Body mark type options
  const bodyMarkTypes = ['Tattoo', 'Scar', 'Birthmark', 'Piercing', 'Other'];

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
        family: data.family ? data.family.map(f => ({
          relation: f.relation,
          customRelation: f.custom_relation || '',
          firstName: f.first_name,
          lastName: f.last_name,
          age: f.age || '',
          nic: f.nic || '',
          phoneNumber: f.phone_number || ''
        })) : [],
        vehicles: data.vehicles ? data.vehicles.map(v => ({
          vehicleNumber: v.vehicle_number || '',
          make: v.make || '',
          model: v.model || ''
        })) : [],
        bodyMarks: data.bodyMarks ? data.bodyMarks.map(b => ({
          type: b.type || '',
          location: b.location || '',
          description: b.description || '',
          picture: b.picture || ''
        })) : [],
        usedDevices: data.usedDevices ? data.usedDevices.map(d => ({
          deviceType: d.device_type || '',
          make: d.make || '',
          model: d.model || '',
          serialNumber: d.serial_number || '',
          imeiNumber: d.imei_number || ''
        })) : [],
        callHistory: data.callHistory ? data.callHistory.map(c => ({
          device: c.device || '',
          callType: c.call_type || '',
          number: c.number || '',
          dateTime: c.date_time || ''
        })) : []
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
      family: [],
      vehicles: [],
      bodyMarks: [],
      usedDevices: [],
      callHistory: []
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
      family: [...prev.family, { 
        relation: '', 
        customRelation: '',
        firstName: '', 
        lastName: '', 
        age: '', 
        nic: '', 
        phoneNumber: '' 
      }]
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

  // Vehicle handlers
  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { vehicleNumber: '', make: '', model: '' }]
    }));
  };

  const updateVehicle = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((vehicle, i) => 
        i === index ? { ...vehicle, [field]: value } : vehicle
      )
    }));
  };

  const removeVehicle = (index) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index)
    }));
  };

  // Body marks handlers
  const addBodyMark = () => {
    setFormData(prev => ({
      ...prev,
      bodyMarks: [...prev.bodyMarks, { type: '', location: '', description: '', picture: '' }]
    }));
  };

  const updateBodyMark = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      bodyMarks: prev.bodyMarks.map((mark, i) => 
        i === index ? { ...mark, [field]: value } : mark
      )
    }));
  };

  const removeBodyMark = (index) => {
    setFormData(prev => ({
      ...prev,
      bodyMarks: prev.bodyMarks.filter((_, i) => i !== index)
    }));
  };

  // Used devices handlers
  const addUsedDevice = () => {
    setFormData(prev => ({
      ...prev,
      usedDevices: [...prev.usedDevices, { 
        deviceType: '', 
        make: '', 
        model: '', 
        serialNumber: '', 
        imeiNumber: '' 
      }]
    }));
  };

  const updateUsedDevice = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      usedDevices: prev.usedDevices.map((device, i) => 
        i === index ? { ...device, [field]: value } : device
      )
    }));
  };

  const removeUsedDevice = (index) => {
    setFormData(prev => ({
      ...prev,
      usedDevices: prev.usedDevices.filter((_, i) => i !== index)
    }));
  };

  // Call history handlers
  const addCallHistory = () => {
    setFormData(prev => ({
      ...prev,
      callHistory: [...prev.callHistory, { 
        device: '', 
        callType: '', 
        number: '', 
        dateTime: '' 
      }]
    }));
  };

  const updateCallHistory = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      callHistory: prev.callHistory.map((call, i) => 
        i === index ? { ...call, [field]: value } : call
      )
    }));
  };

  const removeCallHistory = (index) => {
    setFormData(prev => ({
      ...prev,
      callHistory: prev.callHistory.filter((_, i) => i !== index)
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
            Family & Friends
          </button>
          <button
            onClick={() => setActiveSection('vehicles')}
            style={{
              padding: '12px',
              backgroundColor: activeSection === 'vehicles' ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Vehicle Details
          </button>
          <button
            onClick={() => setActiveSection('bodyMarks')}
            style={{
              padding: '12px',
              backgroundColor: activeSection === 'bodyMarks' ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Body Marks
          </button>
          <button
            onClick={() => setActiveSection('usedDevices')}
            style={{
              padding: '12px',
              backgroundColor: activeSection === 'usedDevices' ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Used Devices
          </button>
          <button
            onClick={() => setActiveSection('callHistory')}
            style={{
              padding: '12px',
              backgroundColor: activeSection === 'callHistory' ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Call History
          </button>
        </div>
      </div>

      {/* CENTER PANEL */}
      <div style={{ flex: 1, padding: '30px', backgroundColor: '#ecf0f1', overflowY: 'auto' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            {activeSection === 'personal' && 'Personal Details'}
            {activeSection === 'bank' && 'Bank Details'}
            {activeSection === 'family' && 'Family Members & Friends'}
            {activeSection === 'vehicles' && 'VEHICLES Details'}
            {activeSection === 'bodyMarks' && 'BODY MARKS Details'}
            {activeSection === 'usedDevices' && 'USED DEVICES Details'}
            {activeSection === 'callHistory' && 'CALL HISTORY Details'}
            {!['personal', 'bank', 'family', 'vehicles', 'bodyMarks', 'usedDevices', 'callHistory'].includes(activeSection) && 'Select a section from the left panel'}
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
                  padding: '12px 24px',
                  marginBottom: '20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                + Add Family Member or Friend
              </button>
              {formData.family.map((member, index) => (
                <div key={index} style={{ 
                  marginBottom: '25px', 
                  padding: '20px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50' }}>
                      {member.relation || member.customRelation ? 
                        `${member.relation === 'Other' ? member.customRelation : member.relation}` : 
                        `Person ${index + 1}`
                      }
                    </h4>
                    <button
                      onClick={() => removeFamilyMember(index)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    {/* Relationship Dropdown */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Relationship *
                      </label>
                      <select
                        value={member.relation}
                        onChange={(e) => updateFamilyMember(index, 'relation', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          border: '1px solid #ddd', 
                          borderRadius: '5px',
                          backgroundColor: 'white',
                          fontSize: '14px'
                        }}
                        required
                      >
                        <option value="">Select Relationship</option>
                        {familyRelationships.map((category, catIndex) => (
                          <optgroup key={catIndex} label={category.category}>
                            {category.options.map((option, optIndex) => (
                              <option key={optIndex} value={option}>{option}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Custom Relationship (if Other is selected) */}
                    {member.relation === 'Other' && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                          Custom Relationship *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter custom relationship"
                          value={member.customRelation}
                          onChange={(e) => updateFamilyMember(index, 'customRelation', e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '10px', 
                            border: '1px solid #ddd', 
                            borderRadius: '5px',
                            fontSize: '14px'
                          }}
                          required
                        />
                      </div>
                    )}

                    {/* Name Fields */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={member.firstName}
                        onChange={(e) => updateFamilyMember(index, 'firstName', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          border: '1px solid #ddd', 
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={member.lastName}
                        onChange={(e) => updateFamilyMember(index, 'lastName', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          border: '1px solid #ddd', 
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    {/* Age Field */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Age
                      </label>
                      <input
                        type="number"
                        placeholder="Enter age"
                        value={member.age}
                        min="0"
                        max="150"
                        onChange={(e) => updateFamilyMember(index, 'age', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          border: '1px solid #ddd', 
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    {/* NIC Number */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        NIC Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter NIC number"
                        value={member.nic}
                        onChange={(e) => updateFamilyMember(index, 'nic', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          border: '1px solid #ddd', 
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={member.phoneNumber}
                        onChange={(e) => updateFamilyMember(index, 'phoneNumber', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          border: '1px solid #ddd', 
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.family.length === 0 && (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                  color: '#6c757d'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Family Members or Friends Added</h4>
                  <p style={{ margin: 0 }}>Click "Add Family Member or Friend" to start adding relationships</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'vehicles' && (
            <div>
              <button
                onClick={addVehicle}
                style={{
                  padding: '12px 24px',
                  marginBottom: '20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                + Add Vehicle
              </button>

              {formData.vehicles.map((vehicle, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50' }}>
                      {vehicle.vehicleNumber ? `Vehicle: ${vehicle.vehicleNumber}` : `Vehicle ${index + 1}`}
                    </h4>
                    <button
                      onClick={() => removeVehicle(index)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Vehicle Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., CAG4455"
                        value={vehicle.vehicleNumber}
                        onChange={(e) => updateVehicle(index, 'vehicleNumber', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Make *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., TOYOTA"
                        value={vehicle.make}
                        onChange={(e) => updateVehicle(index, 'make', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Model *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., PRADO 150"
                        value={vehicle.model}
                        onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.vehicles.length === 0 && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                  color: '#6c757d'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Vehicles Added</h4>
                  <p style={{ margin: 0 }}>Click "Add Vehicle" to start adding vehicle details</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'bodyMarks' && (
            <div>
              <button
                onClick={addBodyMark}
                style={{
                  padding: '12px 24px',
                  marginBottom: '20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                + Add Body Mark
              </button>

              {formData.bodyMarks.map((mark, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50' }}>
                      {mark.type ? `${mark.type}` : `Body Mark ${index + 1}`}
                    </h4>
                    <button
                      onClick={() => removeBodyMark(index)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Type *
                      </label>
                      <select
                        value={mark.type}
                        onChange={(e) => updateBodyMark(index, 'type', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          backgroundColor: 'white',
                          fontSize: '14px'
                        }}
                        required
                      >
                        <option value="">Select Type</option>
                        {bodyMarkTypes.map((type, typeIndex) => (
                          <option key={typeIndex} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Location *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., behind the right ear"
                        value={mark.location}
                        onChange={(e) => updateBodyMark(index, 'location', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Description
                      </label>
                      <textarea
                        placeholder="e.g., text says 'gang'"
                        value={mark.description}
                        onChange={(e) => updateBodyMark(index, 'description', e.target.value)}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Picture
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              updateBodyMark(index, 'picture', event.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                      />
                      {mark.picture && (
                        <div style={{ marginTop: '10px' }}>
                          <img 
                            src={mark.picture} 
                            alt="Body mark" 
                            style={{ 
                              maxWidth: '200px', 
                              maxHeight: '200px', 
                              borderRadius: '5px',
                              border: '1px solid #ddd'
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {formData.bodyMarks.length === 0 && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                  color: '#6c757d'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Body Marks Added</h4>
                  <p style={{ margin: 0 }}>Click "Add Body Mark" to start recording identifying marks</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'usedDevices' && (
            <div>
              <button
                onClick={addUsedDevice}
                style={{
                  padding: '12px 24px',
                  marginBottom: '20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                + Add Device
              </button>

              {formData.usedDevices.map((device, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50' }}>
                      {device.deviceType ? `${device.deviceType} - ${device.make || 'Device'}` : `Device ${index + 1}`}
                    </h4>
                    <button
                      onClick={() => removeUsedDevice(index)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Device Type *
                      </label>
                      <select
                        value={device.deviceType}
                        onChange={(e) => updateUsedDevice(index, 'deviceType', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          backgroundColor: 'white',
                          fontSize: '14px'
                        }}
                        required
                      >
                        <option value="">Select Device Type</option>
                        {deviceTypes.map((type, typeIndex) => (
                          <option key={typeIndex} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Make
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Samsung, Apple, HP"
                        value={device.make}
                        onChange={(e) => updateUsedDevice(index, 'make', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Model
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Galaxy S21, iPhone 13, ThinkPad"
                        value={device.model}
                        onChange={(e) => updateUsedDevice(index, 'model', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Serial Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter serial number"
                        value={device.serialNumber}
                        onChange={(e) => updateUsedDevice(index, 'serialNumber', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        IMEI Number
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}> (for mobile devices)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter IMEI number"
                        value={device.imeiNumber}
                        onChange={(e) => updateUsedDevice(index, 'imeiNumber', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.usedDevices.length === 0 && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                  color: '#6c757d'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Devices Added</h4>
                  <p style={{ margin: 0 }}>Click "Add Device" to start recording used devices</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'callHistory' && (
            <div>
              <button
                onClick={addCallHistory}
                style={{
                  padding: '12px 24px',
                  marginBottom: '20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                + Add Call Record
              </button>

              {formData.callHistory.map((call, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50' }}>
                      {call.number ? `Call: ${call.number}` : `Call Record ${index + 1}`}
                    </h4>
                    <button
                      onClick={() => removeCallHistory(index)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Device *
                      </label>
                      <select
                        value={call.device}
                        onChange={(e) => updateCallHistory(index, 'device', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          backgroundColor: 'white',
                          fontSize: '14px'
                        }}
                        required
                      >
                        <option value="">Select Device</option>
                        {formData.usedDevices.map((device, deviceIndex) => (
                          <option key={deviceIndex} value={`${device.deviceType} - ${device.make} ${device.model}`.trim()}>
                            {device.deviceType} - {device.make} {device.model}
                          </option>
                        ))}
                        {formData.usedDevices.length === 0 && (
                          <option disabled>No devices added yet. Add devices in "USED DEVICES Details" section first.</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Call Type *
                      </label>
                      <select
                        value={call.callType}
                        onChange={(e) => updateCallHistory(index, 'callType', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          backgroundColor: 'white',
                          fontSize: '14px'
                        }}
                        required
                      >
                        <option value="">Select Call Type</option>
                        {callTypes.map((type, typeIndex) => (
                          <option key={typeIndex} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={call.number}
                        onChange={(e) => updateCallHistory(index, 'number', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={call.dateTime}
                        onChange={(e) => updateCallHistory(index, 'dateTime', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.callHistory.length === 0 && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                  color: '#6c757d'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Call History Added</h4>
                  <p style={{ margin: 0 }}>Click "Add Call Record" to start recording call history</p>
                </div>
              )}
            </div>
          )}

          {!['personal', 'bank', 'family', 'vehicles', 'bodyMarks', 'usedDevices', 'callHistory'].includes(activeSection) && (
            <div style={{
              padding: '60px 40px',
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6',
              color: '#6c757d'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Welcome to the Dashboard</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '16px' }}>
                Select a section from the left panel to start entering information
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '30px' }}>
                <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>Personal Details</h4>
                  <p style={{ margin: 0, fontSize: '14px' }}>Basic personal information</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#e74c3c' }}>Banking Details</h4>
                  <p style={{ margin: 0, fontSize: '14px' }}>Account and financial information</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#f39c12' }}>Family & Friends</h4>
                  <p style={{ margin: 0, fontSize: '14px' }}>Relationships and contacts</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#9b59b6' }}>Vehicles</h4>
                  <p style={{ margin: 0, fontSize: '14px' }}>Vehicle registration details</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1abc9c' }}>Body Marks</h4>
                  <p style={{ margin: 0, fontSize: '14px' }}>Identifying marks and features</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#34495e' }}>Used Devices</h4>
                  <p style={{ margin: 0, fontSize: '14px' }}>Electronic devices and equipment</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#e67e22' }}>Call History</h4>
                  <p style={{ margin: 0, fontSize: '14px' }}>Communication records</p>
                </div>
              </div>
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