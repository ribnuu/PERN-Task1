import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [activeSection, setActiveSection] = useState('personal');
  const [activePropertiesTab, setActivePropertiesTab] = useState('currentlyInPossession');
  const [activePersonalTab, setActivePersonalTab] = useState('basicInfo');
  const [showGangDetails, setShowGangDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [enemyGangsList, setEnemyGangsList] = useState([]);
  const [showNewPersonModal, setShowNewPersonModal] = useState(false);
  const [newPersonType, setNewPersonType] = useState(''); // 'enemy', 'official', etc.
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
      dateOfBirth: ''
    },
    addresses: [], // New addresses array for multiple addresses
    socialMedia: [], // {platform, url, username, password}
    occupations: [], // {jobTitle, company, fromDate, toDate, currently}
    lawyers: [], // {lawyerFullName, lawFirmOrCompany, phoneNumber}
    courtCases: [], // {caseNumber, courts, description}
    activeAreas: [], // {town, district, province, fromDate, toDate, isActive, addressSelection}
    relativesOfficials: [], // {fullName, nicNumber, passportNumber, department, description}
    bankDetails: [], // {accountType, bankName, accountNumber, accountHolderName, branch, swiftCode, balance, interestRate, cardNumber, expiryDate, cvv, creditLimit, loanAmount, loanTerm, monthlyPayment}
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
    },
    enemies: {
      individuals: [],
      gangs: []
    },
    corruptedOfficials: []
  });

  // Province -> District mapping
  const provinceDistricts = {
    'Western Province': ['Colombo','Gampaha','Kalutara'],
    'Central Province': ['Kandy','Matale','Nuwara Eliya'],
    'Southern Province': ['Galle','Matara','Hambantota'],
    'Northern Province': ['Jaffna','Kilinochchi','Mannar','Vavuniya','Mullaitivu'],
    'Eastern Province': ['Trincomalee','Batticaloa','Ampara'],
    'North Western Province': ['Kurunegala','Puttalam'],
    'North Central Province': ['Anuradhapura','Polonnaruwa'],
    'Uva Province': ['Badulla','Monaragala'],
    'Sabaragamuwa Province': ['Ratnapura','Kegalle']
  };

  // Town to District and Province mapping
  const townMapping = {
    // Western Province - Colombo District
    'Colombo': { district: 'Colombo', province: 'Western Province' },
    'Dehiwala-Mount Lavinia': { district: 'Colombo', province: 'Western Province' },
    'Moratuwa': { district: 'Colombo', province: 'Western Province' },
    'Sri Jayawardenepura Kotte': { district: 'Colombo', province: 'Western Province' },
    'Kolonnawa': { district: 'Colombo', province: 'Western Province' },
    'Kelaniya': { district: 'Colombo', province: 'Western Province' },
    'Kaduwela': { district: 'Colombo', province: 'Western Province' },
    'Homagama': { district: 'Colombo', province: 'Western Province' },
    'Maharagama': { district: 'Colombo', province: 'Western Province' },
    'Nugegoda': { district: 'Colombo', province: 'Western Province' },
    'Boralesgamuwa': { district: 'Colombo', province: 'Western Province' },
    'Kotte': { district: 'Colombo', province: 'Western Province' },
    'Piliyandala': { district: 'Colombo', province: 'Western Province' },
    'Battaramulla': { district: 'Colombo', province: 'Western Province' },
    'Rajagiriya': { district: 'Colombo', province: 'Western Province' },
    'Kotikawatta': { district: 'Colombo', province: 'Western Province' },
    'Mulleriyawa': { district: 'Colombo', province: 'Western Province' },
    
    // Western Province - Gampaha District
    'Gampaha': { district: 'Gampaha', province: 'Western Province' },
    'Negombo': { district: 'Gampaha', province: 'Western Province' },
    'Katunayake': { district: 'Gampaha', province: 'Western Province' },
    'Ja-Ela': { district: 'Gampaha', province: 'Western Province' },
    'Wattala': { district: 'Gampaha', province: 'Western Province' },
    'Minuwangoda': { district: 'Gampaha', province: 'Western Province' },
    'Kadawatha': { district: 'Gampaha', province: 'Western Province' },
    'Ragama': { district: 'Gampaha', province: 'Western Province' },
    'Kandana': { district: 'Gampaha', province: 'Western Province' },
    'Welisara': { district: 'Gampaha', province: 'Western Province' },
    'Kiribathgoda': { district: 'Gampaha', province: 'Western Province' },
    'Nittambuwa': { district: 'Gampaha', province: 'Western Province' },
    'Veyangoda': { district: 'Gampaha', province: 'Western Province' },
    'Ganemulla': { district: 'Gampaha', province: 'Western Province' },
    'Mirigama': { district: 'Gampaha', province: 'Western Province' },
    'Divulapitiya': { district: 'Gampaha', province: 'Western Province' },
    'Attanagalla': { district: 'Gampaha', province: 'Western Province' },
    
    // Western Province - Kalutara District
    'Kalutara': { district: 'Kalutara', province: 'Western Province' },
    'Panadura': { district: 'Kalutara', province: 'Western Province' },
    'Horana': { district: 'Kalutara', province: 'Western Province' },
    'Beruwala': { district: 'Kalutara', province: 'Western Province' },
    'Aluthgama': { district: 'Kalutara', province: 'Western Province' },
    'Matugama': { district: 'Kalutara', province: 'Western Province' },
    'Wadduwa': { district: 'Kalutara', province: 'Western Province' },
    'Bandaragama': { district: 'Kalutara', province: 'Western Province' },
    'Mathugama': { district: 'Kalutara', province: 'Western Province' },
    'Ingiriya': { district: 'Kalutara', province: 'Western Province' },
    'Bulathsinhala': { district: 'Kalutara', province: 'Western Province' },
    'Palindanuwara': { district: 'Kalutara', province: 'Western Province' },
    'Agalawatta': { district: 'Kalutara', province: 'Western Province' },
    'Dodangoda': { district: 'Kalutara', province: 'Western Province' },
    'Millaniya': { district: 'Kalutara', province: 'Western Province' },
    
    // Central Province - Kandy District
    'Kandy': { district: 'Kandy', province: 'Central Province' },
    'Gampola': { district: 'Kandy', province: 'Central Province' },
    'Nawalapitiya': { district: 'Kandy', province: 'Central Province' },
    'Peradeniya': { district: 'Kandy', province: 'Central Province' },
    'Katugastota': { district: 'Kandy', province: 'Central Province' },
    'Akurana': { district: 'Kandy', province: 'Central Province' },
    'Kadugannawa': { district: 'Kandy', province: 'Central Province' },
    'Pilimathalawa': { district: 'Kandy', province: 'Central Province' },
    'Wattegama': { district: 'Kandy', province: 'Central Province' },
    'Digana': { district: 'Kandy', province: 'Central Province' },
    'Teldeniya': { district: 'Kandy', province: 'Central Province' },
    'Kundasale': { district: 'Kandy', province: 'Central Province' },
    'Galagedara': { district: 'Kandy', province: 'Central Province' },
    'Daulagala': { district: 'Kandy', province: 'Central Province' },
    'Harispattuwa': { district: 'Kandy', province: 'Central Province' },
    
    // Central Province - Matale District
    'Matale': { district: 'Matale', province: 'Central Province' },
    'Dambulla': { district: 'Matale', province: 'Central Province' },
    'Sigiriya': { district: 'Matale', province: 'Central Province' },
    'Galewela': { district: 'Matale', province: 'Central Province' },
    'Ukuwela': { district: 'Matale', province: 'Central Province' },
    'Rattota': { district: 'Matale', province: 'Central Province' },
    'Naula': { district: 'Matale', province: 'Central Province' },
    'Pallepola': { district: 'Matale', province: 'Central Province' },
    'Yatawatta': { district: 'Matale', province: 'Central Province' },
    'Laggala': { district: 'Matale', province: 'Central Province' },
    
    // Central Province - Nuwara Eliya District
    'Nuwara Eliya': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Hatton': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Nanuoya': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Talawakelle': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Nildandahinna': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Ginigathena': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Walapane': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Kotmale': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Ramboda': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Bogawantalawa': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Maskeliya': { district: 'Nuwara Eliya', province: 'Central Province' },
    'Haggala': { district: 'Nuwara Eliya', province: 'Central Province' },
    
    // Southern Province - Galle District
    'Galle': { district: 'Galle', province: 'Southern Province' },
    'Hikkaduwa': { district: 'Galle', province: 'Southern Province' },
    'Ambalangoda': { district: 'Galle', province: 'Southern Province' },
    'Elpitiya': { district: 'Galle', province: 'Southern Province' },
    'Bentota': { district: 'Galle', province: 'Southern Province' },
    'Baddegama': { district: 'Galle', province: 'Southern Province' },
    'Karapitiya': { district: 'Galle', province: 'Southern Province' },
    'Ahangama': { district: 'Galle', province: 'Southern Province' },
    'Habaraduwa': { district: 'Galle', province: 'Southern Province' },
    'Unawatuna': { district: 'Galle', province: 'Southern Province' },
    'Batapola': { district: 'Galle', province: 'Southern Province' },
    'Neluwa': { district: 'Galle', province: 'Southern Province' },
    'Nagoda': { district: 'Galle', province: 'Southern Province' },
    'Imaduwa': { district: 'Galle', province: 'Southern Province' },
    
    // Southern Province - Matara District
    'Matara': { district: 'Matara', province: 'Southern Province' },
    'Weligama': { district: 'Matara', province: 'Southern Province' },
    'Mirissa': { district: 'Matara', province: 'Southern Province' },
    'Dikwella': { district: 'Matara', province: 'Southern Province' },
    'Hakmana': { district: 'Matara', province: 'Southern Province' },
    'Akuressa': { district: 'Matara', province: 'Southern Province' },
    'Kamburupitiya': { district: 'Matara', province: 'Southern Province' },
    'Devinuwara': { district: 'Matara', province: 'Southern Province' },
    'Gandara': { district: 'Matara', province: 'Southern Province' },
    'Kekanadurra': { district: 'Matara', province: 'Southern Province' },
    'Thihagoda': { district: 'Matara', province: 'Southern Province' },
    'Pitabeddara': { district: 'Matara', province: 'Southern Province' },
    
    // Southern Province - Hambantota District
    'Hambantota': { district: 'Hambantota', province: 'Southern Province' },
    'Tangalle': { district: 'Hambantota', province: 'Southern Province' },
    'Tissamaharama': { district: 'Hambantota', province: 'Southern Province' },
    'Ambalantota': { district: 'Hambantota', province: 'Southern Province' },
    'Beliatta': { district: 'Hambantota', province: 'Southern Province' },
    'Weeraketiya': { district: 'Hambantota', province: 'Southern Province' },
    'Middeniya': { district: 'Hambantota', province: 'Southern Province' },
    'Walasmulla': { district: 'Hambantota', province: 'Southern Province' },
    'Kirinda': { district: 'Hambantota', province: 'Southern Province' },
    'Suriyawewa': { district: 'Hambantota', province: 'Southern Province' },
    'Angunakolapelessa': { district: 'Hambantota', province: 'Southern Province' },
    
    // North Western Province - Kurunegala District
    'Kurunegala': { district: 'Kurunegala', province: 'North Western Province' },
    'Kuliyapitiya': { district: 'Kurunegala', province: 'North Western Province' },
    'Narammala': { district: 'Kurunegala', province: 'North Western Province' },
    'Wariyapola': { district: 'Kurunegala', province: 'North Western Province' },
    'Pannala': { district: 'Kurunegala', province: 'North Western Province' },
    'Mawathagama': { district: 'Kurunegala', province: 'North Western Province' },
    'Giriulla': { district: 'Kurunegala', province: 'North Western Province' },
    'Polgahawela': { district: 'Kurunegala', province: 'North Western Province' },
    'Alawwa': { district: 'Kurunegala', province: 'North Western Province' },
    'Nikaweratiya': { district: 'Kurunegala', province: 'North Western Province' },
    'Bingiriya': { district: 'Kurunegala', province: 'North Western Province' },
    'Hettipola': { district: 'Kurunegala', province: 'North Western Province' },
    'Ibbagamuwa': { district: 'Kurunegala', province: 'North Western Province' },
    'Galgamuwa': { district: 'Kurunegala', province: 'North Western Province' },
    'Maho': { district: 'Kurunegala', province: 'North Western Province' },
    
    // North Western Province - Puttalam District
    'Puttalam': { district: 'Puttalam', province: 'North Western Province' },
    'Chilaw': { district: 'Puttalam', province: 'North Western Province' },
    'Wennappuwa': { district: 'Puttalam', province: 'North Western Province' },
    'Nattandiya': { district: 'Puttalam', province: 'North Western Province' },
    'Dankotuwa': { district: 'Puttalam', province: 'North Western Province' },
    'Marawila': { district: 'Puttalam', province: 'North Western Province' },
    'Anamaduwa': { district: 'Puttalam', province: 'North Western Province' },
    'Mundel': { district: 'Puttalam', province: 'North Western Province' },
    'Madampe': { district: 'Puttalam', province: 'North Western Province' },
    'Pallama': { district: 'Puttalam', province: 'North Western Province' },
    'Kalpitiya': { district: 'Puttalam', province: 'North Western Province' }
  };

  // Police Area to Division mapping
  const policeAreaMapping = {
    // Western Province - Colombo Division
    'Fort Police Station': 'Colombo Division',
    'Slave Island Police Station': 'Colombo Division',
    'Kollupitiya Police Station': 'Colombo Division',
    'Bambalapitiya Police Station': 'Colombo Division',
    'Wellawatta Police Station': 'Colombo Division',
    'Dehiwala Police Station': 'Colombo Division',
    'Mount Lavinia Police Station': 'Colombo Division',
    'Kotahena Police Station': 'Colombo Division',
    'Grandpass Police Station': 'Colombo Division',
    'Maradana Police Station': 'Colombo Division',
    'Dematagoda Police Station': 'Colombo Division',
    'Borella Police Station': 'Colombo Division',
    'Narahenpita Police Station': 'Colombo Division',
    'Wellampitiya Police Station': 'Colombo Division',
    'Kolonnawa Police Station': 'Colombo Division',
    'Keselwatta Police Station': 'Colombo Division',
    
    // Western Province - Colombo North Division
    'Peliyagoda Police Station': 'Colombo North Division',
    'Wattala Police Station': 'Colombo North Division',
    'Hendala Police Station': 'Colombo North Division',
    'Ja-Ela Police Station': 'Colombo North Division',
    'Seeduwa Police Station': 'Colombo North Division',
    'Katunayake Police Station': 'Colombo North Division',
    'Kandana Police Station': 'Colombo North Division',
    'Welisara Police Station': 'Colombo North Division',
    'Ragama Police Station': 'Colombo North Division',
    'Kadawatha Police Station': 'Colombo North Division',
    'Kirillawala Police Station': 'Colombo North Division',
    
    // Western Province - Colombo South Division
    'Mirihana Police Station': 'Colombo South Division',
    'Nugegoda Police Station': 'Colombo South Division',
    'Kohuwala Police Station': 'Colombo South Division',
    'Maharagama Police Station': 'Colombo South Division',
    'Homagama Police Station': 'Colombo South Division',
    'Padukka Police Station': 'Colombo South Division',
    'Pannipitiya Police Station': 'Colombo South Division',
    'Battaramulla Police Station': 'Colombo South Division',
    'Kottawa Police Station': 'Colombo South Division',
    'Piliyandala Police Station': 'Colombo South Division',
    'Kesbewa Police Station': 'Colombo South Division',
    
    // Western Province - Negombo Division
    'Negombo Police Station': 'Negombo Division',
    'Katana Police Station': 'Negombo Division',
    'Kochchikade Police Station': 'Negombo Division',
    'Dungalpitiya Police Station': 'Negombo Division',
    'Marawila Police Station': 'Negombo Division',
    'Dankotuwa Police Station': 'Negombo Division',
    'Nattandiya Police Station': 'Negombo Division',
    'Bolawatta Police Station': 'Negombo Division',
    
    // Western Province - Gampaha Division
    'Gampaha Police Station': 'Gampaha Division',
    'Yakkala Police Station': 'Gampaha Division',
    'Miriswatta Police Station': 'Gampaha Division',
    'Kiribathgoda Police Station': 'Gampaha Division',
    'Kelaniya Police Station': 'Gampaha Division',
    'Ganemulla Police Station': 'Gampaha Division',
    'Minuwangoda Police Station': 'Gampaha Division',
    'Veyangoda Police Station': 'Gampaha Division',
    'Nittambuwa Police Station': 'Gampaha Division',
    'Divulapitiya Police Station': 'Gampaha Division',
    'Mirigama Police Station': 'Gampaha Division',
    
    // Western Province - Kalutara Division
    'Kalutara North Police Station': 'Kalutara Division',
    'Kalutara South Police Station': 'Kalutara Division',
    'Panadura Police Station': 'Kalutara Division',
    'Wadduwa Police Station': 'Kalutara Division',
    'Bandaragama Police Station': 'Kalutara Division',
    'Horana Police Station': 'Kalutara Division',
    'Beruwala Police Station': 'Kalutara Division',
    'Aluthgama Police Station': 'Kalutara Division',
    'Matugama Police Station': 'Kalutara Division',
    'Agalawatta Police Station': 'Kalutara Division',
    'Ingiriya Police Station': 'Kalutara Division',
    'Bulathsinhala Police Station': 'Kalutara Division',
    'Millaniya Police Station': 'Kalutara Division',
    'Palindanuwara Police Station': 'Kalutara Division',
    
    // Central Province - Kandy Division
    'Kandy Police Station': 'Kandy Division',
    'Central Police Station (Kandy)': 'Kandy Division',
    'Peradeniya Police Station': 'Kandy Division',
    'Katugastota Police Station': 'Kandy Division',
    'Gampola Police Station': 'Kandy Division',
    'Nawalapitiya Police Station': 'Kandy Division',
    'Kadugannawa Police Station': 'Kandy Division',
    'Pilimathalawa Police Station': 'Kandy Division',
    'Wattegama Police Station': 'Kandy Division',
    'Akurana Police Station': 'Kandy Division',
    'Teldeniya Police Station': 'Kandy Division',
    'Kundasale Police Station': 'Kandy Division',
    'Galagedara Police Station': 'Kandy Division',
    'Harispattuwa Police Station': 'Kandy Division'
  };

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
    // Remove spaces, hyphens, and any other non-numeric characters except +
    return value.replace(/[^\d+]/g, '');
  };

  // Navigation through sections (next/previous)
  // Organize sections into pages - Phone is last section on page 1
  // All sections in scrollable order - no pagination needed
  const allSections = [
    'personal','address','family','vehicles','bodyMarks','usedDevices','callHistory','weapons','phone',
    'properties','enemies','corruptedOfficials','socialMedia','occupation',
    'lawyers','courtCases','activeAreas','relativesOfficials','bankDetails'
  ];
  
  const orderedSections = allSections; // Keep for compatibility
  
  // Simplified navigation without pagination

  const goToNextSection = () => {
    const currentSectionIndex = allSections.indexOf(activeSection);
    if (currentSectionIndex >= 0 && currentSectionIndex < allSections.length - 1) {
      setActiveSection(allSections[currentSectionIndex + 1]);
    }
  };

  const goToPreviousSection = () => {
    const currentSectionIndex = allSections.indexOf(activeSection);
    if (currentSectionIndex > 0) {
      setActiveSection(allSections[currentSectionIndex - 1]);
    }
  };

  // Social media handlers
  const addSocialMedia = () => {
    setFormData(prev => ({ ...prev, socialMedia: [...(prev.socialMedia||[]), { platform: '', url: '', username: '', password: '' }] }));
  };
  const updateSocialMedia = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };
  const removeSocialMedia = (index) => {
    setFormData(prev => ({ ...prev, socialMedia: prev.socialMedia.filter((_, i) => i !== index) }));
  };

  // Occupation handlers
  const addOccupation = () => {
    setFormData(prev => ({ ...prev, occupations: [...(prev.occupations||[]), { jobTitle: '', company: '', fromDate: '', toDate: '', currently: false }] }));
  };
  const updateOccupation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      occupations: prev.occupations.map((o, i) => i === index ? { ...o, [field]: value } : o)
    }));
  };
  const removeOccupation = (index) => {
    setFormData(prev => ({ ...prev, occupations: prev.occupations.filter((_, i) => i !== index) }));
  };

  // Lawyers handlers
  const addLawyer = () => {
    setFormData(prev => ({ ...prev, lawyers: [...(prev.lawyers||[]), { lawyerFullName: '', lawFirmOrCompany: '', phoneNumber: '' }] }));
  };
  const updateLawyer = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      lawyers: prev.lawyers.map((lawyer, i) => i === index ? { ...lawyer, [field]: value } : lawyer)
    }));
  };
  const removeLawyer = (index) => {
    setFormData(prev => ({ ...prev, lawyers: prev.lawyers.filter((_, i) => i !== index) }));
  };

  // Court Cases handlers
  const addCourtCase = () => {
    setFormData(prev => ({ ...prev, courtCases: [...(prev.courtCases||[]), { caseNumber: '', courts: '', description: '' }] }));
  };
  const updateCourtCase = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      courtCases: prev.courtCases.map((courtCase, i) => i === index ? { ...courtCase, [field]: value } : courtCase)
    }));
  };
  const removeCourtCase = (index) => {
    setFormData(prev => ({ ...prev, courtCases: prev.courtCases.filter((_, i) => i !== index) }));
  };

  // Active Areas handlers
  const addActiveArea = () => {
    setFormData(prev => ({ ...prev, activeAreas: [...(prev.activeAreas||[]), { town: '', district: '', province: '', fromDate: '', toDate: '', isActive: false, addressSelection: '' }] }));
  };
  const updateActiveArea = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      activeAreas: prev.activeAreas.map((activeArea, i) => {
        if (i === index) {
          let updatedArea = { ...activeArea, [field]: value };
          
          // Clear district when province changes
          if (field === 'province') {
            updatedArea.district = '';
          }
          
          // Clear toDate when currently active is checked
          if (field === 'isActive' && value === true) {
            updatedArea.toDate = '';
          }
          
          return updatedArea;
        }
        return activeArea;
      })
    }));
  };
  const removeActiveArea = (index) => {
    setFormData(prev => ({ ...prev, activeAreas: prev.activeAreas.filter((_, i) => i !== index) }));
  };

  // Relatives Officials handlers
  const addRelativesOfficial = () => {
    setFormData(prev => ({ ...prev, relativesOfficials: [...(prev.relativesOfficials||[]), { fullName: '', nicNumber: '', passportNumber: '', department: '', description: '' }] }));
  };
  const updateRelativesOfficial = async (index, field, value) => {
    // Update the field first
    setFormData(prev => ({
      ...prev,
      relativesOfficials: prev.relativesOfficials.map((relativesOfficial, i) => i === index ? { ...relativesOfficial, [field]: value } : relativesOfficial)
    }));

    // If NIC number is being updated, check if person exists and auto-fill name
    if (field === 'nicNumber' && value.trim().length > 5) {
      try {
        const response = await axios.get(`${API_URL}/search?query=${encodeURIComponent(value.trim())}`);
        const people = response.data;
        
        // Find person with matching NIC
        const matchingPerson = people.find(person => 
          person.nic && person.nic.toLowerCase() === value.trim().toLowerCase()
        );
        
        if (matchingPerson) {
          // Auto-fill the full name if person exists
          setFormData(prev => ({
            ...prev,
            relativesOfficials: prev.relativesOfficials.map((relativesOfficial, i) => 
              i === index ? { 
                ...relativesOfficial, 
                fullName: `${matchingPerson.first_name || ''} ${matchingPerson.last_name || ''}`.trim(),
                passportNumber: matchingPerson.passport || ''
              } : relativesOfficial
            )
          }));
        }
      } catch (error) {
        console.log('No matching person found or search error:', error.message);
      }
    }
  };
  const removeRelativesOfficial = (index) => {
    setFormData(prev => ({ ...prev, relativesOfficials: prev.relativesOfficials.filter((_, i) => i !== index) }));
  };

  // Bank Details handlers
  const addBankDetail = () => {
    setFormData(prev => ({ ...prev, bankDetails: [...(prev.bankDetails||[]), { accountType: '', bankName: '', accountNumber: '', accountHolderName: '', branch: '', swiftCode: '', balance: '', interestRate: '', cardNumber: '', expiryDate: '', cvv: '', creditLimit: '', loanAmount: '', loanTerm: '', monthlyPayment: '' }] }));
  };
  const updateBankDetail = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: prev.bankDetails.map((bankDetail, i) => i === index ? { ...bankDetail, [field]: value } : bankDetail)
    }));
  };
  const removeBankDetail = (index) => {
    setFormData(prev => ({ ...prev, bankDetails: prev.bankDetails.filter((_, i) => i !== index) }));
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
    if (call.contactName && call.contactNic) {
      return `Call: ${call.contactName} (${call.contactNic})`;
    } else if (call.contactName) {
      return `Call: ${call.contactName}`;
    }
    return `Call: ${call.number}`;
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
      // Add cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/person/${id}?_t=${timestamp}`);
      const data = response.data;
      console.log('Loaded person data:', data);
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
          height: data.personal.height ? String(data.personal.height) : '',
          religion: data.personal.religion || '',
          gender: data.personal.gender || '',
          dateOfBirth: data.personal.date_of_birth ? data.personal.date_of_birth.split('T')[0] : '',
          address: ''
        },
        addresses: data.addresses ? data.addresses.map(address => ({
          id: address.id,
          number: address.number || '',
          street1: address.street1 || '',
          street2: address.street2 || '',
          town: address.town || '',
          district: address.district || '',
          province: address.province || '',
          policeArea: address.policeArea || '',
          policeDivision: address.policeDivision || '',
          fromDate: address.fromDate || '',
          endDate: address.endDate || '',
          isCurrentlyActive: address.isCurrentlyActive || false
        })) : [],
        bank: data.bank ? {
          accountNumber: data.bank.account_number || '',
          bankName: data.bank.bank_name || '',
          branch: data.bank.branch || '',
          balance: data.bank.balance ? String(data.bank.balance) : ''
        } : { accountNumber: '', bankName: '', branch: '', balance: '' },
        family: data.family ? data.family.map(f => ({
          relation: f.relation || '',
          customRelation: f.custom_relation || '',
          firstName: f.first_name || '',
          lastName: f.last_name || '',
          age: f.age ? String(f.age) : '',
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
            value: p.value ? String(p.value) : '',
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
            value: p.value ? String(p.value) : '',
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
              value: p.value ? String(p.value) : '',
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
        })) : [],
        enemies: {
          individuals: data.enemies && data.enemies.individuals ? data.enemies.individuals.map(e => ({
            enemyPersonId: e.enemy_person_id || '',
            enemyName: e.enemy_name || '',
            enemyNic: e.enemy_nic || '',
            relationshipType: e.relationship_type || '',
            threatLevel: e.threat_level || 'Low',
            notes: e.notes || ''
          })) : [],
          gangs: data.enemies && data.enemies.gangs ? data.enemies.gangs.map(g => ({
            gangName: g.gang_name || '',
            threatLevel: g.threat_level || 'Low',
            notes: g.notes || ''
          })) : []
        },
        corruptedOfficials: data.corruptedOfficials ? data.corruptedOfficials.map(o => ({
          officialPersonId: o.official_person_id || '',
          officialName: o.official_name || '',
          officialNic: o.official_nic || '',
          officialPassport: o.official_passport || '',
          department: o.department || '',
          corruptionType: o.corruption_type || '',
          notes: o.notes || ''
        })) : [],
        socialMedia: data.socialMedia || [],
        occupations: data.occupations ? data.occupations.map(o => ({
          jobTitle: o.jobTitle || '',
          company: o.company || '',
          fromDate: o.fromDate || '',
          toDate: o.toDate || '',
          currently: o.currently || false
        })) : [],
        lawyers: data.lawyers ? data.lawyers.map(l => ({
          lawyerFullName: l.lawyer_full_name || '',
          lawFirmOrCompany: l.law_firm_or_company || '',
          phoneNumber: l.phone_number || '',
          caseNumber: l.case_number || ''
        })) : [],
        courtCases: data.courtCases ? data.courtCases.map(cc => ({
          caseNumber: cc.case_number || '',
          courts: cc.courts || '',
          description: cc.description || ''
        })) : [],
        activeAreas: data.activeAreas ? data.activeAreas.map(aa => ({
          town: aa.town || '',
          district: aa.district || '',
          province: aa.province || '',
          fromDate: aa.fromDate || '',
          toDate: aa.toDate || '',
          isActive: aa.isActive || false,
          addressSelection: aa.addressSelection || ''
        })) : [],
        relativesOfficials: data.relativesOfficials ? data.relativesOfficials.map(ro => ({
          fullName: ro.full_name || '',
          nicNumber: ro.nic_number || '',
          passportNumber: ro.passport_number || '',
          department: ro.department || '',
          description: ro.description || ''
        })) : [],
        bankDetails: data.bankDetails ? data.bankDetails.map(bd => ({
          accountType: bd.account_type || '',
          bankName: bd.bank_name || '',
          accountNumber: bd.account_number || '',
          accountHolderName: bd.account_holder_name || '',
          branch: bd.branch || '',
          swiftCode: bd.swift_code || '',
          balance: bd.balance ? String(bd.balance) : '',
          interestRate: bd.interest_rate ? String(bd.interest_rate) : '',
          cardNumber: bd.card_number || '',
          expiryDate: bd.expiry_date ? bd.expiry_date.split('T')[0] : '',
          cvv: bd.cvv || '',
          creditLimit: bd.credit_limit ? String(bd.credit_limit) : '',
          loanAmount: bd.loan_amount ? String(bd.loan_amount) : '',
          loanTerm: bd.loan_term ? String(bd.loan_term) : '',
          monthlyPayment: bd.monthly_payment ? String(bd.monthly_payment) : ''
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
      personal: { firstName: '', lastName: '', fullName: '', aliases: '', passport: '', nic: '', height: '', religion: '', gender: '', dateOfBirth: '', address: '' },
      addresses: [{ number: '', street1: '', street2: '', town: '', district: '', province: '', policeArea: '', policeDivision: '', fromDate: '', endDate: '', isCurrentlyActive: true }],
      bank: { accountNumber: '', bankName: '', branch: '', balance: '' },
      family: [],
      vehicles: [],
      bodyMarks: [],
      usedDevices: [],
      callHistory: [],
      weapons: [],
      phones: [],
      gangDetails: [],
      socialMedia: [],
      occupations: [],
      properties: {
        currentlyInPossession: [],
        sold: [],
        intendedToBuy: []
      },
      enemies: {
        individuals: [],
        gangs: []
      },
      corruptedOfficials: [],
      lawyers: [],
      courtCases: [],
      activeAreas: [],
      relativesOfficials: [],
      bankDetails: []
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

      // Clean up the data before sending to backend
      const cleanedFormData = {
        ...formData,
        personal: {
          ...formData.personal,
          height: formData.personal.height ? parseFloat(formData.personal.height) : null,
        },
        bank: {
          ...formData.bank,
          balance: formData.bank.balance ? parseFloat(formData.bank.balance) : 0
        }
      };

      const updateData = {
        ...cleanedFormData,
        secondPhone,
        properties: allProperties
      };
      delete updateData.phones; // Remove the phones field since backend expects secondPhone
      
      console.log('Updating person with data:', updateData);

      const response = await axios.put(`${API_URL}/person/${selectedPerson}`, updateData);
      console.log('Update response:', response.data);
      
      // Clear any cached data and force a fresh reload
      setFormData({
        personal: { firstName: '', lastName: '', fullName: '', aliases: '', passport: '', nic: '', height: '', religion: '', gender: '', dateOfBirth: '', address: '' },
        addresses: [],
        bank: { accountNumber: '', bankName: '', branch: '', balance: '' },
        family: [],
        vehicles: [],
        bodyMarks: [],
        usedDevices: [],
        callHistory: [],
        weapons: [],
        phones: [],
        properties: { currentlyInPossession: [], sold: [], intendedToBuy: [] },
        gangDetails: [],
        enemies: {
          individuals: [],
          gangs: []
        },
        corruptedOfficials: [],
        socialMedia: [],
        occupations: [],
        lawyers: [],
        courtCases: [],
        activeAreas: [],
        relativesOfficials: [],
        bankDetails: []
      });
      
      // Force reload fresh data from database
      await loadPerson(selectedPerson);
      
      alert('Updated successfully! Data has been saved to the database.');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Update error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const message = error.response?.data?.message || error.response?.data?.error || error.response?.data?.details || 'Failed to update person';
      alert(`Update failed: ${message}`);
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
    // Get current datetime in the format required for datetime-local input
    const now = new Date();
    const defaultDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    
    setFormData(prev => ({
      ...prev,
      callHistory: [...prev.callHistory, { 
        device: '', 
        callType: '', 
        number: '', 
        dateTime: defaultDateTime,
        contactName: '',
        contactNic: ''
      }]
    }));
  };

  const updateCallHistory = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      callHistory: prev.callHistory.map((call, i) => 
        i === index ? { 
          ...call, 
          [field]: value,
          // Preserve existing contact information when updating non-number fields
          contactName: call.contactName || '',
          contactNic: call.contactNic || ''
        } : call
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

  // Enemy handlers
  const addEnemyIndividual = () => {
    setFormData(prev => ({
      ...prev,
      enemies: {
        ...prev.enemies,
        individuals: [...prev.enemies.individuals, {
          enemyPersonId: '',
          enemyName: '',
          enemyNic: '',
          relationshipType: '',
          threatLevel: 'Low',
          notes: ''
        }]
      }
    }));
  };

  const updateEnemyIndividual = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      enemies: {
        ...prev.enemies,
        individuals: prev.enemies.individuals.map((enemy, i) => 
          i === index ? { ...enemy, [field]: value } : enemy
        )
      }
    }));
  };

  const removeEnemyIndividual = (index) => {
    setFormData(prev => ({
      ...prev,
      enemies: {
        ...prev.enemies,
        individuals: prev.enemies.individuals.filter((_, i) => i !== index)
      }
    }));
  };

  const addEnemyGang = () => {
    setFormData(prev => ({
      ...prev,
      enemies: {
        ...prev.enemies,
        gangs: [...prev.enemies.gangs, {
          gangName: '',
          threatLevel: 'Low',
          notes: ''
        }]
      }
    }));
  };

  const updateEnemyGang = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      enemies: {
        ...prev.enemies,
        gangs: prev.enemies.gangs.map((gang, i) => 
          i === index ? { ...gang, [field]: value } : gang
        )
      }
    }));
  };

  const removeEnemyGang = (index) => {
    setFormData(prev => ({
      ...prev,
      enemies: {
        ...prev.enemies,
        gangs: prev.enemies.gangs.filter((_, i) => i !== index)
      }
    }));
  };

  // Corrupted Officials handlers
  const addCorruptedOfficial = () => {
    setFormData(prev => ({
      ...prev,
      corruptedOfficials: [...prev.corruptedOfficials, {
        officialPersonId: '',
        officialName: '',
        officialNic: '',
        officialPassport: '',
        department: '',
        corruptionType: '',
        notes: ''
      }]
    }));
  };

  const updateCorruptedOfficial = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      corruptedOfficials: prev.corruptedOfficials.map((official, i) => 
        i === index ? { ...official, [field]: value } : official
      )
    }));
  };

  const removeCorruptedOfficial = (index) => {
    setFormData(prev => ({
      ...prev,
      corruptedOfficials: prev.corruptedOfficials.filter((_, i) => i !== index)
    }));
  };

  // Function to create new person and add to dropdown
  const handleCreateNewPerson = async (personData, targetSection, targetIndex, targetField) => {
    try {
      const response = await axios.post(`${API_URL}/person/quick`, personData);
      const newPerson = response.data;
      
      // Update the appropriate field with the new person's ID
      if (targetSection === 'enemyIndividual') {
        updateEnemyIndividual(targetIndex, 'enemyPersonId', newPerson.id);
        updateEnemyIndividual(targetIndex, 'enemyName', `${newPerson.first_name} ${newPerson.last_name}`);
        updateEnemyIndividual(targetIndex, 'enemyNic', newPerson.nic);
      } else if (targetSection === 'corruptedOfficial') {
        updateCorruptedOfficial(targetIndex, 'officialPersonId', newPerson.id);
        updateCorruptedOfficial(targetIndex, 'officialName', `${newPerson.first_name} ${newPerson.last_name}`);
        updateCorruptedOfficial(targetIndex, 'officialNic', newPerson.nic);
      }
      
      // Refresh search results to include new person
      if (searchQuery) {
        await handleSearch();
      }
      
      alert('New person created successfully!');
    } catch (error) {
      console.error('Error creating new person:', error);
      alert('Failed to create new person. Please try again.');
    }
  };

  // Auto-fill functions for person lookup
  const searchPersonByIdentifier = async (identifier) => {
    if (!identifier || identifier.length < 3) return null;
    
    try {
      const response = await axios.get(`${API_URL}/search?query=${encodeURIComponent(identifier)}`);
      const results = response.data;
      
      // Find exact match by NIC or Passport
      const exactMatch = results.find(person => 
        person.nic === identifier || person.passport === identifier
      );
      
      if (exactMatch) {
        return {
          fullName: exactMatch.full_name || `${exactMatch.first_name} ${exactMatch.last_name}`,
          nic: exactMatch.nic,
          passport: exactMatch.passport
        };
      }
      
      // Find match by full name
      const nameMatch = results.find(person => 
        person.full_name === identifier || 
        `${person.first_name} ${person.last_name}` === identifier
      );
      
      if (nameMatch) {
        return {
          fullName: nameMatch.full_name || `${nameMatch.first_name} ${nameMatch.last_name}`,
          nic: nameMatch.nic,
          passport: nameMatch.passport
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error searching person:', error);
      return null;
    }
  };

  // Auto-fill for Corrupted Officials
  const handleCorruptedOfficialAutoFill = async (index, field, value) => {
    updateCorruptedOfficial(index, field, value);
    
    if ((field === 'officialNic' || field === 'officialPassport') && value) {
      const personData = await searchPersonByIdentifier(value);
      if (personData) {
        updateCorruptedOfficial(index, 'officialName', personData.fullName);
        if (field === 'officialNic' && personData.passport) {
          updateCorruptedOfficial(index, 'officialPassport', personData.passport);
        }
        if (field === 'officialPassport' && personData.nic) {
          updateCorruptedOfficial(index, 'officialNic', personData.nic);
        }
      }
    } else if (field === 'officialName' && value) {
      const personData = await searchPersonByIdentifier(value);
      if (personData) {
        if (personData.nic) updateCorruptedOfficial(index, 'officialNic', personData.nic);
        if (personData.passport) updateCorruptedOfficial(index, 'officialPassport', personData.passport);
      }
    }
  };

  // Auto-fill for Enemy Individuals
  const handleEnemyAutoFill = async (index, field, value) => {
    updateEnemyIndividual(index, field, value);
    
    if (field === 'enemyNic' && value) {
      const personData = await searchPersonByIdentifier(value);
      if (personData) {
        updateEnemyIndividual(index, 'enemyName', personData.fullName);
      }
    } else if (field === 'enemyName' && value) {
      const personData = await searchPersonByIdentifier(value);
      if (personData) {
        if (personData.nic) updateEnemyIndividual(index, 'enemyNic', personData.nic);
      }
    }
  };

  // Auto-fill for Relatives Officials
  const handleRelativesOfficialAutoFill = async (index, field, value) => {
    updateRelativesOfficial(index, field, value);
    
    if ((field === 'nicNumber' || field === 'passportNumber') && value) {
      const personData = await searchPersonByIdentifier(value);
      if (personData) {
        updateRelativesOfficial(index, 'fullName', personData.fullName);
        if (field === 'nicNumber' && personData.passport) {
          updateRelativesOfficial(index, 'passportNumber', personData.passport);
        }
        if (field === 'passportNumber' && personData.nic) {
          updateRelativesOfficial(index, 'nicNumber', personData.nic);
        }
      }
    } else if (field === 'fullName' && value) {
      const personData = await searchPersonByIdentifier(value);
      if (personData) {
        if (personData.nic) updateRelativesOfficial(index, 'nicNumber', personData.nic);
        if (personData.passport) updateRelativesOfficial(index, 'passportNumber', personData.passport);
      }
    }
  };

  // Auto-fill for Property Owners
  const handlePropertyOwnerAutoFill = async (section, index, field, value) => {
    updateProperty(section, index, field, value);
    
    if ((field === 'ownerNic' || field === 'ownerPassport') && value) {
      const personData = await searchPersonByIdentifier(value);
      if (personData) {
        updateProperty(section, index, 'ownerFullName', personData.fullName);
        if (field === 'ownerNic' && personData.passport) {
          updateProperty(section, index, 'ownerPassport', personData.passport);
        }
        if (field === 'ownerPassport' && personData.nic) {
          updateProperty(section, index, 'ownerNic', personData.nic);
        }
      }
    } else if (field === 'ownerFullName' && value) {
      const personData = await searchPersonByIdentifier(value);
      if (personData) {
        if (personData.nic) updateProperty(section, index, 'ownerNic', personData.nic);
        if (personData.passport) updateProperty(section, index, 'ownerPassport', personData.passport);
      }
    }
  };

  // Auto-fill for Call History phone numbers
  const handleCallHistoryAutoFill = async (index, field, value) => {    
    // Update the field first
    updateCallHistory(index, field, value);
    
    // If it's a phone number field and has a value, search for the person
    if (field === 'number' && value && value.length >= 8) {
      try {
        const response = await fetch(`http://localhost:5000/api/search-by-phone/${value}`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.found) {
            // Update call history with contact information using proper state update
            setFormData(prev => ({
              ...prev,
              callHistory: prev.callHistory.map((call, i) => 
                i === index ? { 
                  ...call, 
                  contactName: data.person.fullName,
                  contactNic: data.person.nic 
                } : call
              )
            }));
          } else {
            // Clear contact information if no match found
            setFormData(prev => ({
              ...prev,
              callHistory: prev.callHistory.map((call, i) => 
                i === index ? { 
                  ...call, 
                  contactName: '',
                  contactNic: '' 
                } : call
              )
            }));
          }
        }
      } catch (error) {
        console.error('Error searching by phone number:', error);
        // Clear contact info on error
        setFormData(prev => ({
          ...prev,
          callHistory: prev.callHistory.map((call, i) => 
            i === index ? { 
              ...call, 
              contactName: '',
              contactNic: '' 
            } : call
          )
        }));
      }
    } else if (field === 'number' && (!value || value.length < 8)) {
      // Clear contact info if phone number is too short or empty
      setFormData(prev => ({
        ...prev,
        callHistory: prev.callHistory.map((call, i) => 
          i === index ? { 
            ...call, 
            contactName: '',
            contactNic: '' 
          } : call
        )
      }));
    }
  };

  // Helper functions for cross-section updates
  const getAllGangNames = () => {
    const gangDetailsNames = formData.gangDetails ? formData.gangDetails.map(g => g.gangName).filter(name => name && name.trim()) : [];
    const enemyGangNames = formData.enemies?.gangs ? formData.enemies.gangs.map(g => g.gangName).filter(name => name && name.trim()) : [];
    return [...new Set([...gangDetailsNames, ...enemyGangNames])]; // Remove duplicates
  };

  const getAllCaseNumbers = () => {
    return formData.courtCases ? formData.courtCases.map(cc => cc.caseNumber).filter(caseNum => caseNum && caseNum.trim()) : [];
  };

  // Enhanced gang detail update with enemy gang sync
  const updateGangDetailWithSync = (index, field, value) => {
    updateGangDetail(index, field, value);
    
    // If gang name is updated, sync to enemy gangs dropdown options
    if (field === 'gangName' && value) {
      // This will be used by the dropdown options
      // No need to update enemy gangs directly, just ensure the dropdown shows updated options
    }
  };

  // Enhanced enemy gang update with gang details sync
  const updateEnemyGangWithSync = (index, field, value) => {
    updateEnemyGang(index, field, value);
    
    // If gang name is updated, optionally sync back to gang details
    if (field === 'gangName' && value) {
      // Check if this gang name exists in gang details, if not and user wants, add it
      const existingGangNames = formData.gangDetails ? formData.gangDetails.map(g => g.gangName) : [];
      if (!existingGangNames.includes(value)) {
        // For now, we'll just make it available in dropdowns
        // Could add logic here to automatically add to gang details if desired
      }
    }
  };

  // Enhanced lawyer update with case number dropdown
  const addLawyerWithCaseSelect = () => {
    setFormData(prev => ({
      ...prev,
      lawyers: [...(prev.lawyers || []), {
        lawyerFullName: '',
        lawFirmOrCompany: '',
        phoneNumber: '',
        caseNumber: '' // Add case number field
      }]
    }));
  };

  const updateLawyerWithCaseNumber = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      lawyers: prev.lawyers.map((lawyer, i) => 
        i === index ? { ...lawyer, [field]: value } : lawyer
      )
    }));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* LEFT PANEL */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
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
        {/* Page indicator */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '10px', 
          fontSize: '12px', 
          color: '#bdc3c7' 
        }}>
          All Sections
        </div>
        {/* Scrollable navigation sections */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px', 
          flex: '1',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 150px)',
          paddingRight: '8px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#4a5568 #2d3748'
        }}>
          {allSections.map((section) => {
            // Define section titles
            const sectionTitles = {
              personal: 'Personal Details',
              address: 'Address Details',
              family: 'Family & Friends',
              vehicles: 'Vehicle Details',
              bodyMarks: 'Body Marks',
              usedDevices: 'Used Devices',
              callHistory: 'Call History',
              weapons: 'Used Weapons',
              phone: 'Phone',
              properties: 'Assets or Properties',
              enemies: 'Enemies',
              corruptedOfficials: 'Corrupted Officials',
              socialMedia: 'Social Media',
              occupation: 'Occupation',
              lawyers: 'Lawyers Details',
              courtCases: 'Court Cases', 
              activeAreas: 'Active Areas',
              relativesOfficials: 'Relatives Officials',
              bankDetails: 'Bank Details'
            };

            return (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                style={{
                  padding: '12px',
                  backgroundColor: activeSection === section ? '#34495e' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
              >
                {sectionTitles[section] || section}
              </button>
            );
          })}
        </div>
        

      </div>

      {/* CENTER PANEL */}
      <div style={{ flex: 1, padding: '30px', backgroundColor: '#ecf0f1', overflowY: 'auto' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            {activeSection === 'personal' && 'Personal Details'}
            {activeSection === 'address' && 'Address Details'}
            {activeSection === 'family' && 'Family Members & Friends'}
            {activeSection === 'vehicles' && 'VEHICLES Details'}
            {activeSection === 'bodyMarks' && 'BODY MARKS Details'}
            {activeSection === 'usedDevices' && 'USED DEVICES Details'}
            {activeSection === 'callHistory' && 'CALL HISTORY Details'}
            {activeSection === 'weapons' && 'USED WEAPONS Details'}
            {activeSection === 'phone' && 'PHONE Details'}
            {activeSection === 'properties' && 'ASSETS OR PROPERTIES Details'}
            {activeSection === 'enemies' && 'ENEMIES Details'}
            {activeSection === 'corruptedOfficials' && 'CORRUPTED OFFICIALS Details'}
            {activeSection === 'socialMedia' && 'SOCIAL MEDIA Details'}
            {activeSection === 'occupation' && 'OCCUPATION Details'}
            {activeSection === 'lawyers' && 'LAWYERS Details'}
            {activeSection === 'courtCases' && 'COURT CASES Details'}
            {activeSection === 'activeAreas' && 'ACTIVE AREAS Details'}
            {activeSection === 'relativesOfficials' && 'RELATIVES OFFICIALS Details'}
            {activeSection === 'bankDetails' && 'BANK DETAILS'}
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
                    <select
                      value={formData.personal.religion}
                      onChange={(e) => updatePersonalField('religion', e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    >
                      <option value="">Select Religion</option>
                      <option value="Buddhism">Buddhism</option>
                      <option value="Hinduism">Hinduism</option>
                      <option value="Islam">Islam</option>
                      <option value="Christianity">Christianity</option>
                      <option value="Others">Others</option>
                      <option value="No Religion">No Religion</option>
                    </select>
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
                            onChange={(e) => updateGangDetailWithSync(index, 'gangName', e.target.value)}
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

          {activeSection === 'address' && (
            <div>
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    addresses: [...formData.addresses, {
                      number: '',
                      street1: '',
                      street2: '',
                      town: '',
                      district: '',
                      province: '',
                      policeArea: '',
                      policeDivision: '',
                      fromDate: '',
                      endDate: '',
                      isCurrentlyActive: false
                    }]
                  });
                }}
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
                + Add Address
              </button>
              
              {formData.addresses.map((address, index) => (
                <div key={index} style={{ 
                  marginBottom: '25px', 
                  padding: '20px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50' }}>
                      Address {index + 1}
                    </h4>
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          addresses: formData.addresses.filter((_, i) => i !== index)
                        });
                      }}
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Number</label>
                      <input 
                        type="text" 
                        value={address.number} 
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          newAddresses[index].number = e.target.value;
                          setFormData({ ...formData, addresses: newAddresses });
                        }} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Street Name 1</label>
                      <input 
                        type="text" 
                        value={address.street1} 
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          newAddresses[index].street1 = e.target.value;
                          setFormData({ ...formData, addresses: newAddresses });
                        }} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Street Name 2</label>
                      <input 
                        type="text" 
                        value={address.street2} 
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          newAddresses[index].street2 = e.target.value;
                          setFormData({ ...formData, addresses: newAddresses });
                        }} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Town</label>
                      <input 
                        type="text" 
                        value={address.town} 
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          const townValue = e.target.value;
                          newAddresses[index].town = townValue;
                          
                          // Auto-fill district and province based on town selection
                          if (townMapping[townValue]) {
                            newAddresses[index].district = townMapping[townValue].district;
                            newAddresses[index].province = townMapping[townValue].province;
                          }
                          
                          setFormData({ ...formData, addresses: newAddresses });
                        }} 
                        list={`towns-${index}`}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                      />
                      <datalist id={`towns-${index}`}>
                        {Object.keys(townMapping).map(town => (
                          <option key={town} value={town} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Province</label>
                      <select 
                        value={address.province} 
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          newAddresses[index].province = e.target.value;
                          newAddresses[index].district = '';
                          setFormData({ ...formData, addresses: newAddresses });
                        }} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      >
                        <option value="">Select Province</option>
                        {Object.keys(provinceDistricts).map((p) => (<option key={p} value={p}>{p}</option>))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>District</label>
                      <select 
                        value={address.district} 
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          newAddresses[index].district = e.target.value;
                          setFormData({ ...formData, addresses: newAddresses });
                        }} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      >
                        <option value="">Select District</option>
                        {(provinceDistricts[address.province] || []).map(d => (<option key={d} value={d}>{d}</option>))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Police Area</label>
                      <input 
                        type="text" 
                        value={address.policeArea} 
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          const policeAreaValue = e.target.value;
                          newAddresses[index].policeArea = policeAreaValue;
                          
                          // Auto-fill police division based on police area selection
                          if (policeAreaMapping[policeAreaValue]) {
                            newAddresses[index].policeDivision = policeAreaMapping[policeAreaValue];
                          }
                          
                          setFormData({ ...formData, addresses: newAddresses });
                        }} 
                        list={`police-areas-${index}`}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                      />
                      <datalist id={`police-areas-${index}`}>
                        {Object.keys(policeAreaMapping).map(policeArea => (
                          <option key={policeArea} value={policeArea} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Police Division</label>
                      <input 
                        type="text" 
                        value={address.policeDivision} 
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          newAddresses[index].policeDivision = e.target.value;
                          setFormData({ ...formData, addresses: newAddresses });
                        }} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>From Date</label>
                      <input 
                        type="date" 
                        value={address.fromDate} 
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          newAddresses[index].fromDate = e.target.value;
                          setFormData({ ...formData, addresses: newAddresses });
                        }} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                      />
                    </div>
                    {!address.isCurrentlyActive && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Date</label>
                        <input 
                          type="date" 
                          value={address.endDate} 
                          onChange={(e) => {
                            const newAddresses = [...formData.addresses];
                            newAddresses[index].endDate = e.target.value;
                            setFormData({ ...formData, addresses: newAddresses });
                          }} 
                          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                        />
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="checkbox" 
                        id={`currently-active-${index}`}
                        checked={address.isCurrentlyActive} 
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          newAddresses[index].isCurrentlyActive = e.target.checked;
                          if (e.target.checked) {
                            newAddresses[index].endDate = '';
                          }
                          setFormData({ ...formData, addresses: newAddresses });
                        }} 
                      />
                      <label htmlFor={`currently-active-${index}`} style={{ fontWeight: 'bold' }}>Currently Active</label>
                    </div>
                  </div>
                </div>
              ))}
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
                        onChange={(e) => {
                          // Update device while preserving contact information
                          setFormData(prev => ({
                            ...prev,
                            callHistory: prev.callHistory.map((c, i) => 
                              i === index ? { 
                                ...c, 
                                device: e.target.value,
                                // Preserve existing contact info
                                contactName: c.contactName || '',
                                contactNic: c.contactNic || ''
                              } : c
                            )
                          }));
                        }}
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
                        onChange={(e) => {
                          // Update call type while preserving contact information
                          setFormData(prev => ({
                            ...prev,
                            callHistory: prev.callHistory.map((c, i) => 
                              i === index ? { 
                                ...c, 
                                callType: e.target.value,
                                // Preserve existing contact info
                                contactName: c.contactName || '',
                                contactNic: c.contactNic || ''
                              } : c
                            )
                          }));
                        }}
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
                          handleCallHistoryAutoFill(index, 'number', cleanedNumber);
                        }}
                        onBlur={(e) => {
                          // Also trigger auto-fill on blur to catch paste operations
                          const cleanedNumber = validatePhoneNumber(e.target.value);
                          if (cleanedNumber !== call.number) {
                            handleCallHistoryAutoFill(index, 'number', cleanedNumber);
                          }
                        }}
                        onPaste={(e) => {
                          // Handle paste events with a slight delay to ensure the value is updated
                          setTimeout(() => {
                            const cleanedNumber = validatePhoneNumber(e.target.value);
                            handleCallHistoryAutoFill(index, 'number', cleanedNumber);
                          }, 100);
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
                      {/* Show contact information or searching status */}
                      {call.number && call.number.length >= 8 && (
                        <div style={{ marginTop: '8px' }}>
                          {call.contactName ? (
                            <div style={{ 
                              padding: '8px 12px', 
                              backgroundColor: '#e8f5e8', 
                              border: '1px solid #c3e6c3', 
                              borderRadius: '5px',
                              fontSize: '13px'
                            }}>
                              <strong>📞 Contact Found:</strong><br />
                              <span style={{ color: '#2c5530' }}>
                                <strong>Name:</strong> {call.contactName}<br />
                                <strong>NIC:</strong> {call.contactNic}
                              </span>
                            </div>
                          ) : (
                            <div style={{ 
                              padding: '6px 10px', 
                              backgroundColor: '#fff3cd', 
                              border: '1px solid #ffeeba', 
                              borderRadius: '5px',
                              fontSize: '12px',
                              color: '#856404'
                            }}>
                              ⚠️ No contact found for this number
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={call.dateTime || ''}
                        onChange={(e) => {
                          // Update dateTime while preserving contact information
                          setFormData(prev => ({
                            ...prev,
                            callHistory: prev.callHistory.map((c, i) => 
                              i === index ? { 
                                ...c, 
                                dateTime: e.target.value,
                                // Preserve existing contact info
                                contactName: c.contactName || '',
                                contactNic: c.contactNic || ''
                              } : c
                            )
                          }));
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

                        {/* Property Owner Information */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '15px', marginBottom: '15px' }}>
                          <h5 style={{ margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                            Property Owner Information (Optional)
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                                Owner Full Name <small style={{ color: '#666' }}>(Auto-fills from NIC/Passport)</small>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter owner's full name"
                                value={property.ownerFullName || ''}
                                onChange={(e) => handlePropertyOwnerAutoFill('currentlyInPossession', index, 'ownerFullName', e.target.value)}
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
                                Owner NIC Number <small style={{ color: '#666' }}>(Auto-fills name)</small>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter NIC number"
                                value={property.ownerNic || ''}
                                onChange={(e) => handlePropertyOwnerAutoFill('currentlyInPossession', index, 'ownerNic', e.target.value)}
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
                                Owner Passport Number <small style={{ color: '#666' }}>(Auto-fills name)</small>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter passport number"
                                value={property.ownerPassport || ''}
                                onChange={(e) => handlePropertyOwnerAutoFill('currentlyInPossession', index, 'ownerPassport', e.target.value)}
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

                        {/* Property Owner Information */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '15px', marginBottom: '15px' }}>
                          <h5 style={{ margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                            Property Owner Information (Optional)
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                                Owner Full Name <small style={{ color: '#666' }}>(Auto-fills from NIC/Passport)</small>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter owner's full name"
                                value={property.ownerFullName || ''}
                                onChange={(e) => handlePropertyOwnerAutoFill('intendedToBuy', index, 'ownerFullName', e.target.value)}
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
                                Owner NIC Number <small style={{ color: '#666' }}>(Auto-fills name)</small>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter NIC number"
                                value={property.ownerNic || ''}
                                onChange={(e) => handlePropertyOwnerAutoFill('intendedToBuy', index, 'ownerNic', e.target.value)}
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
                                Owner Passport Number <small style={{ color: '#666' }}>(Auto-fills name)</small>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter passport number"
                                value={property.ownerPassport || ''}
                                onChange={(e) => handlePropertyOwnerAutoFill('intendedToBuy', index, 'ownerPassport', e.target.value)}
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

          {/* ENEMIES SECTION */}
          {activeSection === 'enemies' && (
            <div>
              <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #e9ecef' }}>
                <button
                  onClick={() => setActivePersonalTab('enemyIndividuals')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: activePersonalTab === 'enemyIndividuals' ? '#e74c3c' : '#f8f9fa',
                    color: activePersonalTab === 'enemyIndividuals' ? 'white' : '#2c3e50',
                    border: 'none',
                    borderRadius: '5px 5px 0 0',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginRight: '5px'
                  }}
                >
                  Enemy Individuals
                </button>
                <button
                  onClick={() => setActivePersonalTab('enemyGangs')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: activePersonalTab === 'enemyGangs' ? '#e74c3c' : '#f8f9fa',
                    color: activePersonalTab === 'enemyGangs' ? 'white' : '#2c3e50',
                    border: 'none',
                    borderRadius: '5px 5px 0 0',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Enemy Gangs
                </button>
              </div>

              {/* Enemy Individuals Section */}
              {activePersonalTab === 'enemyIndividuals' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: '#e74c3c', margin: 0 }}>Enemy Individuals</h3>
                    <button
                      onClick={addEnemyIndividual}
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
                      + Add Enemy Individual
                    </button>
                  </div>

                  {(formData.enemies.individuals || []).length === 0 && (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      backgroundColor: '#fff5f5',
                      borderRadius: '8px',
                      border: '2px dashed #f5c6cb',
                      color: '#6c757d'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>No Enemy Individuals</h4>
                      <p style={{ margin: 0 }}>Click "Add Enemy Individual" to start recording enemy individuals</p>
                    </div>
                  )}

                  {(formData.enemies.individuals || []).map((enemy, index) => (
                    <div key={index} style={{
                      marginBottom: '25px',
                      padding: '20px',
                      backgroundColor: '#fff5f5',
                      borderRadius: '8px',
                      border: '1px solid #f5c6cb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, color: '#e74c3c' }}>
                          Enemy Individual {index + 1}
                        </h4>
                        <button
                          onClick={() => removeEnemyIndividual(index)}
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
                            Enemy Name * <small style={{ color: '#666' }}>(Auto-fills from NIC/Passport)</small>
                          </label>
                          <input
                            type="text"
                            value={enemy.enemyName}
                            onChange={(e) => handleEnemyAutoFill(index, 'enemyName', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                            placeholder="Enter enemy's full name or create new person"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Enemy NIC <small style={{ color: '#666' }}>(Auto-fills name)</small>
                          </label>
                          <input
                            type="text"
                            value={enemy.enemyNic}
                            onChange={(e) => handleEnemyAutoFill(index, 'enemyNic', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            placeholder="NIC number"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Relationship Type *
                          </label>
                          <select
                            value={enemy.relationshipType}
                            onChange={(e) => updateEnemyIndividual(index, 'relationshipType', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                          >
                            <option value="">Select Relationship</option>
                            <option value="Business Rival">Business Rival</option>
                            <option value="Personal Vendetta">Personal Vendetta</option>
                            <option value="Gang Conflict">Gang Conflict</option>
                            <option value="Territory Dispute">Territory Dispute</option>
                            <option value="Family Feud">Family Feud</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Threat Level *
                          </label>
                          <select
                            value={enemy.threatLevel}
                            onChange={(e) => updateEnemyIndividual(index, 'threatLevel', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Notes
                          </label>
                          <textarea
                            value={enemy.notes}
                            onChange={(e) => updateEnemyIndividual(index, 'notes', e.target.value)}
                            rows="3"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            placeholder="Additional notes about this enemy relationship"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Enemy Gangs Section */}
              {activePersonalTab === 'enemyGangs' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: '#e74c3c', margin: 0 }}>Enemy Gangs</h3>
                    <button
                      onClick={addEnemyGang}
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
                      + Add Enemy Gang
                    </button>
                  </div>

                  {(formData.enemies.gangs || []).length === 0 && (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      backgroundColor: '#fff5f5',
                      borderRadius: '8px',
                      border: '2px dashed #f5c6cb',
                      color: '#6c757d'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>No Enemy Gangs</h4>
                      <p style={{ margin: 0 }}>Click "Add Enemy Gang" to start recording enemy gangs</p>
                    </div>
                  )}

                  {(formData.enemies.gangs || []).map((gang, index) => (
                    <div key={index} style={{
                      marginBottom: '25px',
                      padding: '20px',
                      backgroundColor: '#fff5f5',
                      borderRadius: '8px',
                      border: '1px solid #f5c6cb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, color: '#e74c3c' }}>
                          Enemy Gang {index + 1}
                        </h4>
                        <button
                          onClick={() => removeEnemyGang(index)}
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
                          <select
                            value={gang.gangName}
                            onChange={(e) => updateEnemyGangWithSync(index, 'gangName', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                          >
                            <option value="">Select Gang</option>
                            {getAllGangNames().map((gangName, idx) => (
                              <option key={idx} value={gangName}>{gangName}</option>
                            ))}
                            <option value="Black Serpents">Black Serpents</option>
                            <option value="Iron Wolves">Iron Wolves</option>
                            <option value="Red Dragons">Red Dragons</option>
                            <option value="Golden Eagles">Golden Eagles</option>
                            <option value="Other">Other</option>
                          </select>
                          {gang.gangName === 'Other' && (
                            <input
                              type="text"
                              placeholder="Enter custom gang name"
                              value={gang.customGangName || ''}
                              style={{
                                width: '100%',
                                marginTop: '5px',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '14px'
                              }}
                              onChange={(e) => {
                                updateEnemyGangWithSync(index, 'customGangName', e.target.value);
                              }}
                              onBlur={(e) => {
                                // Only update gangName when user finishes typing
                                if (e.target.value && e.target.value.trim()) {
                                  updateEnemyGangWithSync(index, 'gangName', e.target.value);
                                }
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Threat Level *
                          </label>
                          <select
                            value={gang.threatLevel}
                            onChange={(e) => updateEnemyGang(index, 'threatLevel', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                            Notes
                          </label>
                          <textarea
                            value={gang.notes}
                            onChange={(e) => updateEnemyGang(index, 'notes', e.target.value)}
                            rows="3"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            placeholder="Additional notes about this enemy gang relationship"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CORRUPTED OFFICIALS SECTION */}
          {activeSection === 'corruptedOfficials' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#dc3545', margin: 0 }}>Corrupted Officials</h3>
                <button
                  onClick={addCorruptedOfficial}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  + Add Corrupted Official
                </button>
              </div>

              {formData.corruptedOfficials.length === 0 && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#fff5f5',
                  borderRadius: '8px',
                  border: '2px dashed #f5c6cb',
                  color: '#6c757d'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Corrupted Officials</h4>
                  <p style={{ margin: 0 }}>Click "Add Corrupted Official" to start recording corrupted officials</p>
                </div>
              )}

              {formData.corruptedOfficials.map((official, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '20px',
                  backgroundColor: '#fff5f5',
                  borderRadius: '8px',
                  border: '1px solid #f5c6cb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#dc3545' }}>
                      Corrupted Official {index + 1}
                    </h4>
                    <button
                      onClick={() => removeCorruptedOfficial(index)}
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
                        Department *
                      </label>
                      <select
                        value={official.department}
                        onChange={(e) => updateCorruptedOfficial(index, 'department', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Police Department">Police Department</option>
                        <option value="Customs Office">Customs Office</option>
                        <option value="Immigration Department">Immigration Department</option>
                        <option value="Tax Department">Tax Department</option>
                        <option value="Municipal Council">Municipal Council</option>
                        <option value="Court System">Court System</option>
                        <option value="Prison Services">Prison Services</option>
                        <option value="Transport Department">Transport Department</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Full Name * <small style={{ color: '#666' }}>(Auto-fills from NIC/Passport)</small>
                      </label>
                      <input
                        type="text"
                        value={official.officialName}
                        onChange={(e) => handleCorruptedOfficialAutoFill(index, 'officialName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        required
                        placeholder="Enter official's full name"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        NIC Number <small style={{ color: '#666' }}>(Auto-fills name)</small>
                      </label>
                      <input
                        type="text"
                        value={official.officialNic}
                        onChange={(e) => handleCorruptedOfficialAutoFill(index, 'officialNic', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        placeholder="NIC number"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Passport Number <small style={{ color: '#666' }}>(Auto-fills name)</small>
                      </label>
                      <input
                        type="text"
                        value={official.officialPassport}
                        onChange={(e) => handleCorruptedOfficialAutoFill(index, 'officialPassport', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        placeholder="Passport number"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Corruption Type
                      </label>
                      <select
                        value={official.corruptionType}
                        onChange={(e) => updateCorruptedOfficial(index, 'corruptionType', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Select Corruption Type</option>
                        <option value="Bribery">Bribery</option>
                        <option value="Information Leak">Information Leak</option>
                        <option value="Document Forgery">Document Forgery</option>
                        <option value="Evidence Tampering">Evidence Tampering</option>
                        <option value="Illegal Favors">Illegal Favors</option>
                        <option value="Blackmail">Blackmail</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>
                        Notes
                      </label>
                      <textarea
                        value={official.notes}
                        onChange={(e) => updateCorruptedOfficial(index, 'notes', e.target.value)}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '14px'
                        }}
                        placeholder="Additional notes about this corrupted official relationship"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SOCIAL MEDIA SECTION */}
          {activeSection === 'socialMedia' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#6f42c1', margin: 0 }}>Social Media</h3>
                <button onClick={addSocialMedia} style={{ padding: '10px 20px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>+ Add Social Media</button>
              </div>

              {(formData.socialMedia||[]).length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f0ff', borderRadius: '8px', border: '2px dashed #e6d9ff', color: '#6c757d' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Social Media Accounts</h4>
                  <p style={{ margin: 0 }}>Click "Add Social Media" to record social profiles (facebook, instagram, twitter, snapchat, imo, other)</p>
                </div>
              )}

              {(formData.socialMedia||[]).map((s, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#faf5ff', borderRadius: '8px', border: '1px solid #efe5ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong>Account {index+1}</strong>
                    <button onClick={() => removeSocialMedia(index)} style={{ padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Platform</label>
                      <select value={s.platform} onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)} style={{ width: '100%', padding: '8px' }}>
                        <option value="">Select</option>
                        <option>Facebook</option>
                        <option>Instagram</option>
                        <option>Twitter</option>
                        <option>Snapchat</option>
                        <option>IMO</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>URL</label>
                      <input type="text" value={s.url} onChange={(e) => updateSocialMedia(index, 'url', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Username</label>
                      <input type="text" value={s.username} onChange={(e) => updateSocialMedia(index, 'username', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Password</label>
                      <input type="text" value={s.password} onChange={(e) => updateSocialMedia(index, 'password', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* OCCUPATION SECTION */}
          {activeSection === 'occupation' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#20c997', margin: 0 }}>Occupation</h3>
                <button onClick={addOccupation} style={{ padding: '10px 20px', backgroundColor: '#20c997', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>+ Add Occupation</button>
              </div>

              {(formData.occupations||[]).length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#e9f7ef', borderRadius: '8px', border: '2px dashed #cdeed9', color: '#6c757d' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Occupation Records</h4>
                  <p style={{ margin: 0 }}>Click "Add Occupation" to record job title, company and duration</p>
                </div>
              )}

              {(formData.occupations||[]).map((o, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fffa', borderRadius: '8px', border: '1px solid #e6ffef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong>Occupation {index+1}</strong>
                    <button onClick={() => removeOccupation(index)} style={{ padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Job Title</label>
                      <input type="text" value={o.jobTitle} onChange={(e) => updateOccupation(index, 'jobTitle', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Company</label>
                      <input type="text" value={o.company} onChange={(e) => updateOccupation(index, 'company', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>From Date</label>
                      <input type="date" value={o.fromDate} onChange={(e) => updateOccupation(index, 'fromDate', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>To Date</label>
                      <input type="date" value={o.toDate} onChange={(e) => updateOccupation(index, 'toDate', e.target.value)} disabled={o.currently} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={o.currently} onChange={(e) => updateOccupation(index, 'currently', e.target.checked)} /> <label>Currently</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lawyers Section */}
          {activeSection === 'lawyers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#7e57c2', margin: 0 }}>Lawyers Details</h3>
                <button onClick={addLawyerWithCaseSelect} style={{ padding: '10px 20px', backgroundColor: '#7e57c2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>+ Add Lawyer</button>
              </div>

              {(formData.lawyers||[]).length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f3e5f5', borderRadius: '8px', border: '2px dashed #ce93d8', color: '#6c757d' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Lawyer Records</h4>
                  <p style={{ margin: 0 }}>Click "Add Lawyer" to record lawyer details</p>
                </div>
              )}

              {(formData.lawyers||[]).map((lawyer, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e1bee7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong>Lawyer {index+1}</strong>
                    <button onClick={() => removeLawyer(index)} style={{ padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Case Number <small style={{ color: '#666' }}>(From Court Cases)</small></label>
                      <select 
                        value={lawyer.caseNumber || ''} 
                        onChange={(e) => updateLawyerWithCaseNumber(index, 'caseNumber', e.target.value)} 
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      >
                        <option value="">Select Case Number</option>
                        {getAllCaseNumbers().map((caseNum, idx) => (
                          <option key={idx} value={caseNum}>{caseNum}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Lawyer Full Name</label>
                      <input type="text" value={lawyer.lawyerFullName} onChange={(e) => updateLawyerWithCaseNumber(index, 'lawyerFullName', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Law Firm or Company</label>
                      <input type="text" value={lawyer.lawFirmOrCompany} onChange={(e) => updateLawyerWithCaseNumber(index, 'lawFirmOrCompany', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Phone Number</label>
                      <input type="text" value={lawyer.phoneNumber} onChange={(e) => updateLawyerWithCaseNumber(index, 'phoneNumber', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Court Cases Section */}
          {activeSection === 'courtCases' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#ff7043', margin: 0 }}>Court Cases</h3>
                <button onClick={addCourtCase} style={{ padding: '10px 20px', backgroundColor: '#ff7043', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>+ Add Court Case</button>
              </div>

              {(formData.courtCases||[]).length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fbe9e7', borderRadius: '8px', border: '2px dashed #ffab91', color: '#6c757d' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Court Case Records</h4>
                  <p style={{ margin: 0 }}>Click "Add Court Case" to record case details</p>
                </div>
              )}

              {(formData.courtCases||[]).map((courtCase, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '1px solid #ffcc02' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong>Court Case {index+1}</strong>
                    <button onClick={() => removeCourtCase(index)} style={{ padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Case Number</label>
                      <input type="text" value={courtCase.caseNumber} onChange={(e) => updateCourtCase(index, 'caseNumber', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Courts</label>
                      <input type="text" value={courtCase.courts} onChange={(e) => updateCourtCase(index, 'courts', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Description</label>
                      <textarea value={courtCase.description} onChange={(e) => updateCourtCase(index, 'description', e.target.value)} style={{ width: '100%', padding: '8px', minHeight: '80px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Areas Section */}
          {activeSection === 'activeAreas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#26a69a', margin: 0 }}>Active Areas</h3>
                <button onClick={addActiveArea} style={{ padding: '10px 20px', backgroundColor: '#26a69a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>+ Add Active Area</button>
              </div>

              {(formData.activeAreas||[]).length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#e0f2f1', borderRadius: '8px', border: '2px dashed #80cbc4', color: '#6c757d' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Active Area Records</h4>
                  <p style={{ margin: 0 }}>Click "Add Active Area" to record location details</p>
                </div>
              )}

              {(formData.activeAreas||[]).map((activeArea, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong>Active Area {index+1}</strong>
                    <button onClick={() => removeActiveArea(index)} style={{ padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Town</label>
                      <input type="text" value={activeArea.town} onChange={(e) => updateActiveArea(index, 'town', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>District</label>
                      <select value={activeArea.district} onChange={(e) => updateActiveArea(index, 'district', e.target.value)} style={{ width: '100%', padding: '8px' }}>
                        <option value="">Select District</option>
                        {activeArea.province && provinceDistricts[activeArea.province] ? 
                          provinceDistricts[activeArea.province].map(district => (
                            <option key={district} value={district}>{district}</option>
                          )) :
                          Object.values(provinceDistricts).flat().map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))
                        }
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Province</label>
                      <select value={activeArea.province} onChange={(e) => updateActiveArea(index, 'province', e.target.value)} style={{ width: '100%', padding: '8px' }}>
                        <option value="">Select Province</option>
                        {Object.keys(provinceDistricts).map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>From Date</label>
                      <input type="date" value={activeArea.fromDate} onChange={(e) => updateActiveArea(index, 'fromDate', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    {/* Hide To Date when Currently Active is checked */}
                    {!activeArea.isActive && (
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>To Date</label>
                        <input type="date" value={activeArea.toDate} onChange={(e) => updateActiveArea(index, 'toDate', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={activeArea.isActive} onChange={(e) => updateActiveArea(index, 'isActive', e.target.checked)} /> 
                      <label>Currently Active</label>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Address Selection</label>
                      <textarea value={activeArea.addressSelection} onChange={(e) => updateActiveArea(index, 'addressSelection', e.target.value)} style={{ width: '100%', padding: '8px', minHeight: '60px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Relatives Officials Section */}
          {activeSection === 'relativesOfficials' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#5c6bc0', margin: 0 }}>Relatives Officials</h3>
                <button onClick={addRelativesOfficial} style={{ padding: '10px 20px', backgroundColor: '#5c6bc0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>+ Add Relatives Official</button>
              </div>

              {(formData.relativesOfficials||[]).length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#e8eaf6', borderRadius: '8px', border: '2px dashed #9fa8da', color: '#6c757d' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Relatives Official Records</h4>
                  <p style={{ margin: 0 }}>Click "Add Relatives Official" to record official details</p>
                </div>
              )}

              {(formData.relativesOfficials||[]).map((relativesOfficial, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3f4ff', borderRadius: '8px', border: '1px solid #c5cae9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong>Relatives Official {index+1}</strong>
                    <button onClick={() => removeRelativesOfficial(index)} style={{ padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Full Name <small style={{ color: '#666' }}>(Auto-fills from NIC/Passport)</small></label>
                      <input type="text" value={relativesOfficial.fullName} onChange={(e) => handleRelativesOfficialAutoFill(index, 'fullName', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>NIC Number <small style={{ color: '#666' }}>(Auto-fills name)</small></label>
                      <input type="text" value={relativesOfficial.nicNumber} onChange={(e) => handleRelativesOfficialAutoFill(index, 'nicNumber', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Passport Number <small style={{ color: '#666' }}>(Auto-fills name)</small></label>
                      <input type="text" value={relativesOfficial.passportNumber} onChange={(e) => handleRelativesOfficialAutoFill(index, 'passportNumber', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Department</label>
                      <input type="text" value={relativesOfficial.department} onChange={(e) => updateRelativesOfficial(index, 'department', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Description</label>
                      <textarea value={relativesOfficial.description} onChange={(e) => updateRelativesOfficial(index, 'description', e.target.value)} style={{ width: '100%', padding: '8px', minHeight: '80px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bank Details Section */}
          {activeSection === 'bankDetails' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#ef5350', margin: 0 }}>Bank Details</h3>
                <button onClick={addBankDetail} style={{ padding: '10px 20px', backgroundColor: '#ef5350', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>+ Add Bank Detail</button>
              </div>

              {(formData.bankDetails||[]).length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffebee', borderRadius: '8px', border: '2px dashed #ffcdd2', color: '#6c757d' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>No Bank Detail Records</h4>
                  <p style={{ margin: 0 }}>Click "Add Bank Detail" to record financial details</p>
                </div>
              )}

              {(formData.bankDetails||[]).map((bankDetail, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fdf2f2', borderRadius: '8px', border: '1px solid #f8bbd9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong>Bank Detail {index+1}</strong>
                    <button onClick={() => removeBankDetail(index)} style={{ padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Account Type</label>
                      <select value={bankDetail.accountType} onChange={(e) => updateBankDetail(index, 'accountType', e.target.value)} style={{ width: '100%', padding: '8px' }}>
                        <option value="">Select Account Type</option>
                        <option value="savings">Savings Account</option>
                        <option value="current">Current Account</option>
                        <option value="fixed_deposit">Fixed Deposit</option>
                        <option value="bank_card">Bank Card</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="leasing">Leasing</option>
                        <option value="loans">Loans</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Bank Name</label>
                      <input type="text" value={bankDetail.bankName} onChange={(e) => updateBankDetail(index, 'bankName', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Account Number</label>
                      <input type="text" value={bankDetail.accountNumber} onChange={(e) => updateBankDetail(index, 'accountNumber', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Account Holder Name</label>
                      <input type="text" value={bankDetail.accountHolderName} onChange={(e) => updateBankDetail(index, 'accountHolderName', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Branch</label>
                      <input type="text" value={bankDetail.branch} onChange={(e) => updateBankDetail(index, 'branch', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold' }}>Balance</label>
                      <input type="number" step="0.01" value={bankDetail.balance} onChange={(e) => updateBankDetail(index, 'balance', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    
                    {/* Conditionally show fields based on account type */}
                    {(bankDetail.accountType === 'credit_card' || bankDetail.accountType === 'bank_card') && (
                      <>
                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold' }}>Card Number</label>
                          <input type="text" value={bankDetail.cardNumber} onChange={(e) => updateBankDetail(index, 'cardNumber', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold' }}>Expiry Date</label>
                          <input type="date" value={bankDetail.expiryDate} onChange={(e) => updateBankDetail(index, 'expiryDate', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold' }}>CVV</label>
                          <input type="text" value={bankDetail.cvv} onChange={(e) => updateBankDetail(index, 'cvv', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                        </div>
                      </>
                    )}
                    
                    {bankDetail.accountType === 'credit_card' && (
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Credit Limit</label>
                        <input type="number" step="0.01" value={bankDetail.creditLimit} onChange={(e) => updateBankDetail(index, 'creditLimit', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                      </div>
                    )}
                    
                    {(bankDetail.accountType === 'loans' || bankDetail.accountType === 'leasing') && (
                      <>
                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold' }}>Loan Amount</label>
                          <input type="number" step="0.01" value={bankDetail.loanAmount} onChange={(e) => updateBankDetail(index, 'loanAmount', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold' }}>Loan Term (months)</label>
                          <input type="number" value={bankDetail.loanTerm} onChange={(e) => updateBankDetail(index, 'loanTerm', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold' }}>Monthly Payment</label>
                          <input type="number" step="0.01" value={bankDetail.monthlyPayment} onChange={(e) => updateBankDetail(index, 'monthlyPayment', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                        </div>
                      </>
                    )}
                    
                    {bankDetail.accountType === 'fixed_deposit' && (
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Interest Rate (%)</label>
                        <input type="number" step="0.01" value={bankDetail.interestRate} onChange={(e) => updateBankDetail(index, 'interestRate', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                      </div>
                    )}
                    
                    {/* Hide Swift Code for Credit Cards */}
                    {bankDetail.accountType !== 'credit_card' && (
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Swift Code</label>
                        <input type="text" value={bankDetail.swiftCode} onChange={(e) => updateBankDetail(index, 'swiftCode', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                      </div>
                    )}
                    
                    {/* Routing Number field removed completely per user request */}
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
            placeholder="Search by Name or NIC or Passport Number"
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
              {person.passport && (
                <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '2px' }}>
                  Passport: {person.passport}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}