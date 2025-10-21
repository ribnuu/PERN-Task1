import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [activeSection, setActiveSection] = useState('personal');
  const [activePropertiesTab, setActivePropertiesTab] = useState('currentlyInPossession');
  const [activePersonalTab, setActivePersonalTab] = useState('basicInfo');
  const [showGangDetails, setShowGangDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    personal: { 
      firstName: '', 
      lastName: '', 
      fullName: '',
      aliases: '',
      passport: '',
      nic: '', 
      height: '',
      religion: '',
      gender: '',
      dateOfBirth: '',
      address: '' 
    },
    gangDetails: [],
    bank: { accountNumber: '', bankName: '', branch: '', balance: 0 },
    family: [],
    vehicles: [],
    bodyMarks: [],
    usedDevices: [],
    callHistory: [],
    weapons: [],
    phones: [],
    properties: {
      currentlyInPossession: [],
      sold: [],
      intendedToBuy: []
    }
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

  // Phone number validation function
  const validatePhoneNumber = (value) => {
    // Remove spaces and hyphens from input
    return value.replace(/[\s-]/g, '');
  };

  // Function to find contact name by phone number
  const getContactNameByPhone = (phoneNumber) => {
    // Search through current form data family members
    if (formData.family) {
      const contact = formData.family.find(member => 
        member.phoneNumber === phoneNumber
      );
      if (contact) {
        return `${contact.firstName} ${contact.lastName}`.trim();
      }
    }
    
    // Search through search results (if available)
    for (const person of searchResults) {
      // Note: In a real implementation, we'd need to load full person data
      // For now, we'll only check current form data
    }
    
    return null;
  };

  // Function to display call with contact name or phone number
  const getCallDisplayText = (call) => {
    const contactName = getContactNameByPhone(call.number);
    return contactName ? `Call: ${contactName}` : `Call: ${call.number}`;
  };

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
      console.log('Loading person with ID:', id);
      const response = await axios.get(`${API_URL}/person/${id}`);
      const data = response.data;
      console.log('Received person data:', data);
      console.log('Properties from API:', data.properties);
      
      setSelectedPerson(id);
      setFormData({
        personal: {
          firstName: data.personal.first_name || '',
          lastName: data.personal.last_name || '',
          fullName: data.personal.full_name || '',
          aliases: data.personal.aliases || '',
          passport: data.personal.passport || '',
          nic: data.personal.nic || '',
          height: data.personal.height || '',
          religion: data.personal.religion || '',
          gender: data.personal.gender || '',
          dateOfBirth: data.personal.date_of_birth ? data.personal.date_of_birth.split('T')[0] : '',
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
        })) : [],
        weapons: data.weapons ? data.weapons.map(w => ({
          manufacturer: w.manufacturer || '',
          model: w.model || '',
          caliber_marking: w.caliber_marking || '',
          country_origin: w.country_origin || '',
          serial_number: w.serial_number || ''
        })) : [],
        phones: data.secondPhone ? [
          ...(data.secondPhone.whatsapp ? [{ type: 'WhatsApp', number: data.secondPhone.whatsapp, customType: '' }] : []),
          ...(data.secondPhone.telegram ? [{ type: 'Telegram', number: data.secondPhone.telegram, customType: '' }] : []),
          ...(data.secondPhone.viber ? [{ type: 'Viber', number: data.secondPhone.viber, customType: '' }] : []),
          ...(data.secondPhone.mobile ? [{ type: 'Mobile', number: data.secondPhone.mobile, customType: '' }] : []),
          ...(data.secondPhone.landline ? [{ type: 'Landline', number: data.secondPhone.landline, customType: '' }] : []),
          ...(data.secondPhone.other ? [{ type: 'Other', number: data.secondPhone.other.split(': ').pop(), customType: data.secondPhone.other.includes(': ') ? data.secondPhone.other.split(': ')[0] : '' }] : [])
        ] : [],
        properties: {
          currentlyInPossession: data.properties ? data.properties.filter(p => p.status === 'currently_in_possession').map(p => ({
            propertyType: p.property_type || '',
            description: p.description || '',
            value: p.value || 0,
            purchaseDate: p.purchase_date ? p.purchase_date.split('T')[0] : '',
            location: p.location || '',
            documents: p.documents || '',
            buyerName: p.buyer_name || '',
            buyerNIC: p.buyer_nic || '',
            buyerPassport: p.buyer_passport || '',
            saleDate: p.sale_date ? p.sale_date.split('T')[0] : ''
          })) : [],
          sold: data.properties ? data.properties.filter(p => p.status === 'sold').map(p => ({
            propertyType: p.property_type || '',
            description: p.description || '',
            value: p.value || 0,
            purchaseDate: p.purchase_date ? p.purchase_date.split('T')[0] : '',
            location: p.location || '',
            documents: p.documents || '',
            buyerName: p.buyer_name || '',
            buyerNIC: p.buyer_nic || '',
            buyerPassport: p.buyer_passport || '',
            saleDate: p.sale_date ? p.sale_date.split('T')[0] : ''
          })) : [],
          intendedToBuy: (() => {
            const intendedProps = data.properties ? data.properties.filter(p => p.status === 'intended_to_buy').map(p => ({
              propertyType: p.property_type || '',
              description: p.description || '',
              value: p.value || 0,
              purchaseDate: p.purchase_date ? p.purchase_date.split('T')[0] : '',
              location: p.location || '',
              documents: p.documents || '',
              buyerName: p.buyer_name || '',
              buyerNIC: p.buyer_nic || '',
              buyerPassport: p.buyer_passport || '',
              saleDate: p.sale_date ? p.sale_date.split('T')[0] : ''
            })) : [];
            console.log('Processed intendedToBuy properties:', intendedProps);
            return intendedProps;
          })()
        },
        gangDetails: data.gangDetails ? data.gangDetails.map(g => ({
          gangName: g.gang_name || '',
          position: g.position_in_gang || '',
          fromDate: g.from_date ? g.from_date.split('T')[0] : '',
          toDate: g.to_date ? g.to_date.split('T')[0] : '',
          currentlyActive: g.currently_active || false
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
      callHistory: [],
      weapons: [],
      phones: [],
      properties: {
        currentlyInPossession: [],
        sold: [],
        intendedToBuy: []
      }
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
      // Transform phones data back to second_phone format for backend compatibility
      const secondPhone = {
        whatsapp: '',
        telegram: '',
        viber: '',
        mobile: '',
        landline: '',
        other: ''
      };

      formData.phones.forEach(phone => {
        if (phone.type === 'WhatsApp' && phone.number) secondPhone.whatsapp = phone.number;
        else if (phone.type === 'Telegram' && phone.number) secondPhone.telegram = phone.number;
        else if (phone.type === 'Viber' && phone.number) secondPhone.viber = phone.number;
        else if (phone.type === 'Mobile' && phone.number) secondPhone.mobile = phone.number;
        else if (phone.type === 'Landline' && phone.number) secondPhone.landline = phone.number;
        else if (phone.type === 'Other' && phone.number) {
          secondPhone.other = phone.customType ? `${phone.customType}: ${phone.number}` : phone.number;
        }
      });

      // Transform properties data for backend
      const allProperties = [
        ...formData.properties.currentlyInPossession.map(p => ({ ...p, status: 'currently_in_possession' })),
        ...formData.properties.sold.map(p => ({ ...p, status: 'sold' })),
        ...formData.properties.intendedToBuy.map(p => ({ ...p, status: 'intended_to_buy' }))
      ];

      const updateData = {
        ...formData,
        secondPhone,
        properties: allProperties
      };
      delete updateData.phones; // Remove the phones field since backend expects secondPhone
      
      console.log('Updating person with data:', updateData);

      await axios.put(`${API_URL}/person/${selectedPerson}`, updateData);
      alert('Updated successfully');
      setIsEditing(false);
      // Reload the person data to show updated properties
      await loadPerson(selectedPerson);
    } catch (error) {
      console.error('Update error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to update person';
      alert(message);
    }
  };

  const handleCreate = async () => {
    try {
      // Transform phones data back to second_phone format for backend compatibility
      const secondPhone = {
        whatsapp: '',
        telegram: '',
        viber: '',
        mobile: '',
        landline: '',
        other: ''
      };

      formData.phones.forEach(phone => {
        if (phone.type === 'WhatsApp' && phone.number) secondPhone.whatsapp = phone.number;
        else if (phone.type === 'Telegram' && phone.number) secondPhone.telegram = phone.number;
        else if (phone.type === 'Viber' && phone.number) secondPhone.viber = phone.number;
        else if (phone.type === 'Mobile' && phone.number) secondPhone.mobile = phone.number;
        else if (phone.type === 'Landline' && phone.number) secondPhone.landline = phone.number;
        else if (phone.type === 'Other' && phone.number) {
          secondPhone.other = phone.customType ? `${phone.customType}: ${phone.number}` : phone.number;
        }
      });

      // Transform properties data for backend
      const allProperties = [
        ...formData.properties.currentlyInPossession.map(p => ({ ...p, status: 'currently_in_possession' })),
        ...formData.properties.sold.map(p => ({ ...p, status: 'sold' })),
        ...formData.properties.intendedToBuy.map(p => ({ ...p, status: 'intended_to_buy' }))
      ];

      const createData = {
        ...formData,
        secondPhone,
        properties: allProperties
      };
      delete createData.phones; // Remove the phones field since backend expects secondPhone

      const response = await axios.post(`${API_URL}/person`, createData);
      alert('Created successfully');
      setSelectedPerson(response.data.id);
      setIsEditing(false);
      loadPerson(response.data.id);
    } catch (error) {
      console.error('Create error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to create person';
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

  // Gang details handlers
  const addGangDetail = () => {
    setFormData(prev => ({
      ...prev,
      gangDetails: [...prev.gangDetails, { 
        gangName: '', 
        position: '', 
        fromDate: '', 
        toDate: '', 
        currentlyActive: false 
      }]
    }));
  };

  const updateGangDetail = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      gangDetails: prev.gangDetails.map((gang, i) => 
        i === index ? { ...gang, [field]: value } : gang
      )
    }));
  };

  const removeGangDetail = (index) => {
    setFormData(prev => ({
      ...prev,
      gangDetails: prev.gangDetails.filter((_, i) => i !== index)
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

  // Used Weapons functions
  const addWeapon = () => {
    setFormData(prev => ({
      ...prev,
      weapons: [...prev.weapons, {
        manufacturer: '',
        model: '',
        caliber_marking: '',
        country_origin: '',
        serial_number: ''
      }]
    }));
  };

  const updateWeapon = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      weapons: prev.weapons.map((weapon, i) => 
        i === index ? { ...weapon, [field]: value } : weapon
      )
    }));
  };

  const removeWeapon = (index) => {
    setFormData(prev => ({
      ...prev,
      weapons: prev.weapons.filter((_, i) => i !== index)
    }));
  };

  // Phone functions
  const addPhone = () => {
    setFormData(prev => ({
      ...prev,
      phones: [...prev.phones, { type: 'WhatsApp', number: '', customType: '' }]
    }));
  };

  const updatePhone = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.map((phone, i) => 
        i === index ? { ...phone, [field]: value } : phone
      )
    }));
  };

  const removePhone = (index) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index)
    }));
  };

  // Properties functions
  const addProperty = (section) => {
    setFormData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [section]: [...prev.properties[section], {
          propertyType: '',
          description: '',
          value: 0,
          purchaseDate: '',
          location: '',
          documents: '',
          buyerName: '',
          buyerNIC: '',
          buyerPassport: '',
          saleDate: ''
        }]
      }
    }));
  };

  const updateProperty = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [section]: prev.properties[section].map((property, i) => 
          i === index ? { ...property, [field]: value } : property
        )
      }
    }));
  };

  const removeProperty = (section, index) => {
    setFormData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [section]: prev.properties[section].filter((_, i) => i !== index)
      }
    }));
  };

  // Property document upload handler
  const handlePropertyDocumentUpload = async (section, index, event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Create FormData for file upload
        const uploadFormData = new FormData();
        uploadFormData.append('document', file);
        uploadFormData.append('section', section);
        uploadFormData.append('propertyIndex', index);
        
        // Upload to server (only if person is already saved)
        if (selectedPerson) {
          const uploadResponse = await axios.post(
            `${API_URL}/person/${selectedPerson}/properties/upload`,
            uploadFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          // Update the property with the uploaded file name
          updateProperty(section, index, 'documents', uploadResponse.data.filename);
          alert('Document uploaded successfully!');
        } else {
          // For new persons, just store the file name temporarily
          updateProperty(section, index, 'documents', file.name);
          alert('Document will be uploaded when person is saved.');
        }
      } catch (error) {
        console.error('Document upload error:', error);
        alert('Failed to upload document. Please try again.');
      }
    }
  };

  // Image upload handler for body marks
  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateBodyMark(index, 'picture', e.target.result);
      };
      reader.readAsDataURL(file);
    }
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
          <button
            onClick={() => setActiveSection('weapons')}
            style={{
              padding: '12px',
              backgroundColor: activeSection === 'weapons' ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Used Weapons
          </button>
          <button
            onClick={() => setActiveSection('phone')}
            style={{
              padding: '12px',
              backgroundColor: activeSection === 'phone' ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Phone
          </button>
          <button
            onClick={() => setActiveSection('properties')}
            style={{
              padding: '12px',
              backgroundColor: activeSection === 'properties' ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Assets or Properties
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
            {activeSection === 'weapons' && 'USED WEAPONS Details'}
            {activeSection === 'phone' && 'PHONE Details'}
            {activeSection === 'properties' && 'ASSETS OR PROPERTIES Details'}
          </h2>

          {activeSection === 'personal' && (
            <div>
              {/* Personal Details Tabs */}
              <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #e9ecef' }}>
                <button
                  onClick={() => setActivePersonalTab('basicInfo')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: activePersonalTab === 'basicInfo' ? '#3498db' : '#f8f9fa',
                    color: activePersonalTab === 'basicInfo' ? 'white' : '#2c3e50',
                    border: 'none',
                    borderRadius: '5px 5px 0 0',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginRight: '5px'
                  }}
                >
                  Basic Information
                </button>
                <button
                  onClick={() => setActivePersonalTab('gangDetails')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: activePersonalTab === 'gangDetails' ? '#e74c3c' : '#f8f9fa',
                    color: activePersonalTab === 'gangDetails' ? 'white' : '#2c3e50',
                    border: 'none',
                    borderRadius: '5px 5px 0 0',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Gang Details
                </button>
              </div>

              {/* Basic Information Section */}
              {activePersonalTab === 'basicInfo' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>First Name *</label>
                    <input
                      type="text"
                      value={formData.personal.firstName}
                      onChange={(e) => updatePersonalField('firstName', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Last Name *</label>
                    <input
                      type="text"
                      value={formData.personal.lastName}
                      onChange={(e) => updatePersonalField('lastName', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name</label>
                    <input
                      type="text"
                      value={formData.personal.fullName}
                      onChange={(e) => updatePersonalField('fullName', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      placeholder="Complete full name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Aliases</label>
                    <input
                      type="text"
                      value={formData.personal.aliases}
                      onChange={(e) => updatePersonalField('aliases', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      placeholder="Known aliases (comma separated)"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>NIC Number *</label>
                    <input
                      type="text"
                      value={formData.personal.nic}
                      onChange={(e) => updatePersonalField('nic', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Passport Number</label>
                    <input
                      type="text"
                      value={formData.personal.passport}
                      onChange={(e) => updatePersonalField('passport', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Gender</label>
                    <select
                      value={formData.personal.gender}
                      onChange={(e) => updatePersonalField('gender', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date of Birth</label>
                    <input
                      type="date"
                      value={formData.personal.dateOfBirth}
                      onChange={(e) => updatePersonalField('dateOfBirth', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.personal.height}
                      onChange={(e) => updatePersonalField('height', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      placeholder="Height in centimeters"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Religion</label>
                    <input
                      type="text"
                      value={formData.personal.religion}
                      onChange={(e) => updatePersonalField('religion', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
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

              {/* Gang Details Section */}
              {activePersonalTab === 'gangDetails' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: '#e74c3c', margin: 0 }}>Gang Affiliations</h3>
                    <button
                      onClick={addGangDetail}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      + Add Gang Detail
                    </button>
                  </div>

                  {formData.gangDetails.length === 0 && (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      backgroundColor: '#fff5f5',
                      borderRadius: '8px',
                      border: '2px dashed #f5c6cb',
                      color: '#6c757d'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>No Gang Details</h4>
                      <p style={{ margin: 0 }}>Click "Add Gang Detail" to start recording gang affiliations</p>
                    </div>
                  )}

                  {formData.gangDetails.map((gang, index) => (
                    <div key={index} style={{
                      marginBottom: '25px',
                      padding: '20px',
                      backgroundColor: '#fff5f5',
                      borderRadius: '8px',
                      border: '1px solid #f5c6cb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, color: '#e74c3c' }}>
                          Gang Detail {index + 1}
                        </h4>
                        <button
                          onClick={() => removeGangDetail(index)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#dc3545',
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

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Gang Name *
                          </label>
                          <input
                            type="text"
                            value={gang.gangName}
                            onChange={(e) => updateGangDetail(index, 'gangName', e.target.value)}
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
                            Position in Gang *
                          </label>
                          <input
                            type="text"
                            value={gang.position}
                            onChange={(e) => updateGangDetail(index, 'position', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                            placeholder="Leader, Member, Lieutenant, etc."
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            From Date *
                          </label>
                          <input
                            type="date"
                            value={gang.fromDate}
                            onChange={(e) => updateGangDetail(index, 'fromDate', e.target.value)}
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
                            To Date
                          </label>
                          <input
                            type="date"
                            value={gang.toDate}
                            onChange={(e) => updateGangDetail(index, 'toDate', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            disabled={gang.currentlyActive}
                          />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <input
                              type="checkbox"
                              id={`currently-active-${index}`}
                              checked={gang.currentlyActive}
                              onChange={(e) => {
                                updateGangDetail(index, 'currentlyActive', e.target.checked);
                                if (e.target.checked) {
                                  updateGangDetail(index, 'toDate', '');
                                }
                              }}
                              style={{ marginRight: '5px' }}
                            />
                            <label htmlFor={`currently-active-${index}`} style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                              Currently Active in Gang
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}> (spaces and hyphens will be removed automatically)</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number (no spaces or hyphens)"
                        value={member.phoneNumber}
                        onChange={(e) => {
                          const cleanedNumber = validatePhoneNumber(e.target.value);
                          updateFamilyMember(index, 'phoneNumber', cleanedNumber);
                        }}
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

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Picture Upload
                      </label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                          style={{
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '14px'
                          }}
                        />
                        {mark.picture && (
                          <button
                            onClick={() => updateBodyMark(index, 'picture', '')}
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
                            Remove Picture
                          </button>
                        )}
                      </div>
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
                      {call.number ? getCallDisplayText(call) : `Call Record ${index + 1}`}
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
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}> (spaces and hyphens will be removed automatically)</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number (no spaces or hyphens)"
                        value={call.number}
                        onChange={(e) => {
                          const cleanedNumber = validatePhoneNumber(e.target.value);
                          updateCallHistory(index, 'number', cleanedNumber);
                        }}
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

          {activeSection === 'weapons' && (
            <div>
              <button
                onClick={addWeapon}
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
                + Add Weapon
              </button>

              {formData.weapons.map((weapon, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50' }}>
                      {weapon.manufacturer ? `${weapon.manufacturer} ${weapon.model}` : `Weapon ${index + 1}`}
                    </h4>
                    <button
                      onClick={() => removeWeapon(index)}
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
                        Manufacturer Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter manufacturer name"
                        value={weapon.manufacturer}
                        onChange={(e) => updateWeapon(index, 'manufacturer', e.target.value)}
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
                        placeholder="Enter model"
                        value={weapon.model}
                        onChange={(e) => updateWeapon(index, 'model', e.target.value)}
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
                        Caliber Marking *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter caliber marking"
                        value={weapon.caliber_marking}
                        onChange={(e) => updateWeapon(index, 'caliber_marking', e.target.value)}
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
                        Country of Origin *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter country of origin"
                        value={weapon.country_origin}
                        onChange={(e) => updateWeapon(index, 'country_origin', e.target.value)}
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
                        Serial Number *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter serial number"
                        value={weapon.serial_number}
                        onChange={(e) => updateWeapon(index, 'serial_number', e.target.value)}
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

              {formData.weapons.length === 0 && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                  color: '#6c757d'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Weapons Added</h4>
                  <p style={{ margin: 0 }}>Click "Add Weapon" to start recording weapon information</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'phone' && (
            <div>
              <button
                onClick={addPhone}
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
                + Add Phone Number
              </button>

              {formData.phones.map((phone, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50' }}>
                      {phone.number ? `${phone.type === 'Other' && phone.customType ? phone.customType : phone.type}: ${phone.number}` : `Phone ${index + 1}`}
                    </h4>
                    <button
                      onClick={() => removePhone(index)}
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
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '15px', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Type *
                      </label>
                      <select
                        value={phone.type}
                        onChange={(e) => updatePhone(index, 'type', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        required
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Telegram">Telegram</option>
                        <option value="Viber">Viber</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Landline">Landline</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {phone.type === 'Other' && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                          Custom Type *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter custom type"
                          value={phone.customType}
                          onChange={(e) => updatePhone(index, 'customType', e.target.value)}
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

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Phone Number *
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}> (spaces and hyphens will be removed automatically)</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={phone.number}
                        onChange={(e) => updatePhone(index, 'number', validatePhoneNumber(e.target.value))}
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

              {formData.phones.length === 0 && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                  color: '#6c757d'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Phone Numbers Added</h4>
                  <p style={{ margin: 0 }}>Click "Add Phone Number" to start adding phone numbers</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'properties' && (
            <div>
              {/* Saved Properties List Section */}
              {(() => {
                const allProperties = [
                  ...formData.properties.currentlyInPossession.map(p => ({ ...p, section: 'currentlyInPossession', sectionName: 'Currently in Possession' })),
                  ...formData.properties.sold.map(p => ({ ...p, section: 'sold', sectionName: 'Sold' })),
                  ...formData.properties.intendedToBuy.map(p => ({ ...p, section: 'intendedToBuy', sectionName: 'Intended to Buy' }))
                ];
                
                return allProperties.length > 0 && (
                  <div style={{ 
                    marginBottom: '30px', 
                    padding: '20px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    <h3 style={{ color: '#2c3e50', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                      📋 Saved Properties ({allProperties.length})
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                      gap: '15px' 
                    }}>
                      {allProperties.map((property, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setActivePropertiesTab(property.section);
                            // Scroll to the property section after a brief delay
                            setTimeout(() => {
                              const element = document.querySelector(`[data-property-section="${property.section}"]`);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
                          }}
                          style={{
                            padding: '15px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '16px' }}>
                              {property.propertyType || 'Property'}
                            </h4>
                            <span style={{ 
                              fontSize: '11px', 
                              padding: '2px 8px', 
                              borderRadius: '12px',
                              backgroundColor: property.section === 'currentlyInPossession' ? '#27ae60' : 
                                             property.section === 'sold' ? '#e74c3c' : '#f39c12',
                              color: 'white',
                              fontWeight: 'bold'
                            }}>
                              {property.sectionName.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>
                            <strong>Value:</strong> LKR {property.value ? Number(property.value).toLocaleString() : 'N/A'}
                          </div>
                          {property.location && (
                            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>
                              <strong>Location:</strong> {property.location}
                            </div>
                          )}
                          {property.description && (
                            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>
                              <strong>Description:</strong> {property.description.length > 50 ? property.description.substring(0, 50) + '...' : property.description}
                            </div>
                          )}
                          {property.documents && (
                            <div style={{ fontSize: '12px', color: '#007bff', marginTop: '8px' }}>
                              📎 Document attached
                            </div>
                          )}
                          <div style={{ fontSize: '12px', color: '#28a745', marginTop: '8px', fontWeight: 'bold' }}>
                            🖱️ Click to view details
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Properties Tabs */}
              <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #e9ecef' }}>
                {['currentlyInPossession', 'sold', 'intendedToBuy'].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActivePropertiesTab(section)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: activePropertiesTab === section ? '#3498db' : '#f8f9fa',
                      color: activePropertiesTab === section ? 'white' : '#2c3e50',
                      border: 'none',
                      borderRadius: '5px 5px 0 0',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginRight: '5px'
                    }}
                  >
                    {section === 'currentlyInPossession' ? 'Currently in Possession' :
                     section === 'sold' ? 'Sold' : 'Intended to Buy'}
                  </button>
                ))}
              </div>

              {/* Currently in Possession Section */}
              {activePropertiesTab === 'currentlyInPossession' && (
                <div data-property-section="currentlyInPossession">
                  <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>Currently in Possession</h3>
                  <button
                    onClick={() => addProperty('currentlyInPossession')}
                    style={{
                      padding: '12px 24px',
                      marginBottom: '20px',
                      backgroundColor: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    + Add Property in Possession
                  </button>

                  {formData.properties.currentlyInPossession.map((property, index) => (
                    <div key={index} style={{
                      marginBottom: '25px',
                      padding: '20px',
                      backgroundColor: '#f8fff8',
                      borderRadius: '8px',
                      border: '1px solid #d4edda'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, color: '#27ae60' }}>
                          {property.propertyType ? `${property.propertyType}` : `Property ${index + 1}`}
                        </h4>
                        <button
                          onClick={() => removeProperty('currentlyInPossession', index)}
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
                            Property Type *
                          </label>
                          <select
                            value={property.propertyType}
                            onChange={(e) => updateProperty('currentlyInPossession', index, 'propertyType', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                          >
                            <option value="">Select Property Type</option>
                            <option value="House">House</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Land">Land</option>
                            <option value="Commercial Building">Commercial Building</option>
                            <option value="Vehicle">Vehicle</option>
                            <option value="Jewelry">Jewelry</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Artwork">Artwork</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Estimated Value (LKR) *
                          </label>
                          <input
                            type="number"
                            placeholder="Enter estimated value"
                            value={property.value}
                            onChange={(e) => updateProperty('currentlyInPossession', index, 'value', parseFloat(e.target.value) || 0)}
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
                            Purchase Date *
                          </label>
                          <input
                            type="date"
                            value={property.purchaseDate}
                            onChange={(e) => updateProperty('currentlyInPossession', index, 'purchaseDate', e.target.value)}
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
                            Location/Address
                          </label>
                          <input
                            type="text"
                            placeholder="Enter property location"
                            value={property.location}
                            onChange={(e) => updateProperty('currentlyInPossession', index, 'location', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                          />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Description
                          </label>
                          <textarea
                            placeholder="Describe the property details"
                            value={property.description}
                            onChange={(e) => updateProperty('currentlyInPossession', index, 'description', e.target.value)}
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

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Property Documents Upload
                          </label>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                              onChange={(e) => handlePropertyDocumentUpload('currentlyInPossession', index, e)}
                              style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '14px'
                              }}
                            />
                            {property.documents && (
                              <span style={{ color: '#27ae60', fontSize: '12px' }}>
                                📁 {property.documents}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.properties.currentlyInPossession.length === 0 && (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      backgroundColor: '#f8fff8',
                      borderRadius: '8px',
                      border: '2px dashed #d4edda',
                      color: '#6c757d'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>No Properties in Possession</h4>
                      <p style={{ margin: 0 }}>Click "Add Property in Possession" to start adding properties you currently own</p>
                    </div>
                  )}
                </div>
              )}

              {/* Sold Section */}
              {activePropertiesTab === 'sold' && (
                <div data-property-section="sold">
                  <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>Sold Properties</h3>
                  <button
                    onClick={() => addProperty('sold')}
                    style={{
                      padding: '12px 24px',
                      marginBottom: '20px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    + Add Sold Property
                  </button>

                  {formData.properties.sold.map((property, index) => (
                    <div key={index} style={{
                      marginBottom: '25px',
                      padding: '20px',
                      backgroundColor: '#fff5f5',
                      borderRadius: '8px',
                      border: '1px solid #f5c6cb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, color: '#e74c3c' }}>
                          {property.propertyType ? `${property.propertyType} (SOLD)` : `Sold Property ${index + 1}`}
                        </h4>
                        <button
                          onClick={() => removeProperty('sold', index)}
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
                            Property Type *
                          </label>
                          <select
                            value={property.propertyType}
                            onChange={(e) => updateProperty('sold', index, 'propertyType', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                          >
                            <option value="">Select Property Type</option>
                            <option value="House">House</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Land">Land</option>
                            <option value="Commercial Building">Commercial Building</option>
                            <option value="Vehicle">Vehicle</option>
                            <option value="Jewelry">Jewelry</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Artwork">Artwork</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Sale Value (LKR) *
                          </label>
                          <input
                            type="number"
                            placeholder="Enter sale value"
                            value={property.value}
                            onChange={(e) => updateProperty('sold', index, 'value', parseFloat(e.target.value) || 0)}
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
                            Purchase Date *
                          </label>
                          <input
                            type="date"
                            value={property.purchaseDate}
                            onChange={(e) => updateProperty('sold', index, 'purchaseDate', e.target.value)}
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
                            Sale Date *
                          </label>
                          <input
                            type="date"
                            value={property.saleDate}
                            onChange={(e) => updateProperty('sold', index, 'saleDate', e.target.value)}
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
                            Location/Address
                          </label>
                          <input
                            type="text"
                            placeholder="Enter property location"
                            value={property.location}
                            onChange={(e) => updateProperty('sold', index, 'location', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                          />
                        </div>

                        {/* Buyer Information Section */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '20px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                          <h5 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>Buyer Information</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                                Buyer's Full Name *
                              </label>
                              <input
                                type="text"
                                placeholder="Enter buyer's full name"
                                value={property.buyerName}
                                onChange={(e) => updateProperty('sold', index, 'buyerName', e.target.value)}
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
                                Buyer's NIC Number *
                              </label>
                              <input
                                type="text"
                                placeholder="Enter buyer's NIC number"
                                value={property.buyerNIC}
                                onChange={(e) => updateProperty('sold', index, 'buyerNIC', e.target.value)}
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
                                Buyer's Passport Number
                              </label>
                              <input
                                type="text"
                                placeholder="Enter buyer's passport number"
                                value={property.buyerPassport}
                                onChange={(e) => updateProperty('sold', index, 'buyerPassport', e.target.value)}
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

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Description
                          </label>
                          <textarea
                            placeholder="Describe the property details"
                            value={property.description}
                            onChange={(e) => updateProperty('sold', index, 'description', e.target.value)}
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

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Property Documents Upload
                          </label>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                              onChange={(e) => handlePropertyDocumentUpload('sold', index, e)}
                              style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '14px'
                              }}
                            />
                            {property.documents && (
                              <span style={{ color: '#e74c3c', fontSize: '12px' }}>
                                📁 {property.documents}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.properties.sold.length === 0 && (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      backgroundColor: '#fff5f5',
                      borderRadius: '8px',
                      border: '2px dashed #f5c6cb',
                      color: '#6c757d'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>No Sold Properties</h4>
                      <p style={{ margin: 0 }}>Click "Add Sold Property" to start adding properties you have sold</p>
                    </div>
                  )}
                </div>
              )}

              {/* Intended to Buy Section */}
              {activePropertiesTab === 'intendedToBuy' && (
                <div data-property-section="intendedToBuy">
                  <h3 style={{ color: '#f39c12', marginBottom: '15px' }}>Intended to Buy</h3>
                  {console.log('Rendering intendedToBuy section. Properties:', formData.properties.intendedToBuy)}
                  <button
                    onClick={() => addProperty('intendedToBuy')}
                    style={{
                      padding: '12px 24px',
                      marginBottom: '20px',
                      backgroundColor: '#f39c12',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    + Add Property to Buy
                  </button>

                  {formData.properties.intendedToBuy.map((property, index) => (
                    <div key={index} style={{
                      marginBottom: '25px',
                      padding: '20px',
                      backgroundColor: '#fffbf0',
                      borderRadius: '8px',
                      border: '1px solid #ffeeba'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, color: '#f39c12' }}>
                          {property.propertyType ? `${property.propertyType} (INTENDED)` : `Intended Property ${index + 1}`}
                        </h4>
                        <button
                          onClick={() => removeProperty('intendedToBuy', index)}
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
                            Property Type *
                          </label>
                          <select
                            value={property.propertyType}
                            onChange={(e) => updateProperty('intendedToBuy', index, 'propertyType', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                          >
                            <option value="">Select Property Type</option>
                            <option value="House">House</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Land">Land</option>
                            <option value="Commercial Building">Commercial Building</option>
                            <option value="Vehicle">Vehicle</option>
                            <option value="Jewelry">Jewelry</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Artwork">Artwork</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Expected Value (LKR) *
                          </label>
                          <input
                            type="number"
                            placeholder="Enter expected value"
                            value={property.value}
                            onChange={(e) => updateProperty('intendedToBuy', index, 'value', parseFloat(e.target.value) || 0)}
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
                            Intended Purchase Date
                          </label>
                          <input
                            type="date"
                            value={property.purchaseDate}
                            onChange={(e) => updateProperty('intendedToBuy', index, 'purchaseDate', e.target.value)}
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
                            Location/Address
                          </label>
                          <input
                            type="text"
                            placeholder="Enter property location"
                            value={property.location}
                            onChange={(e) => updateProperty('intendedToBuy', index, 'location', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                          />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Description
                          </label>
                          <textarea
                            placeholder="Describe the property details and reasons for wanting to buy"
                            value={property.description}
                            onChange={(e) => updateProperty('intendedToBuy', index, 'description', e.target.value)}
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

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Property Documents Upload
                          </label>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                              onChange={(e) => handlePropertyDocumentUpload('intendedToBuy', index, e)}
                              style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '14px'
                              }}
                            />
                            {property.documents && (
                              <span style={{ color: '#f39c12', fontSize: '12px' }}>
                                📁 {property.documents}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.properties.intendedToBuy.length === 0 && (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      backgroundColor: '#fffbf0',
                      borderRadius: '8px',
                      border: '2px dashed #ffeeba',
                      color: '#6c757d'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>No Properties to Buy</h4>
                      <p style={{ margin: 0 }}>Click "Add Property to Buy" to start adding properties you intend to purchase</p>
                    </div>
                  )}
                </div>
              )}
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