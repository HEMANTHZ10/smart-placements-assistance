import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const BRANCHES = [
  'CSE', 'IT', 'ECE', 'EEE', 'EIE', 'MECH', 'CIVIL', 'AME',
  'CSBS', 'AIML', 'CYS', 'IOT', 'DS', 'AIDS'
];

const DashboardData = () => {
  // Placement Statistics State
  const [placementData, setPlacementData] = useState([]);
  const [placementFormData, setPlacementFormData] = useState({
    branch: '',
    selected_male: 0,
    selected_female: 0,
    selected_total: 0,
    class_total: 0,
    registered: 0,
    not_registered: 0,
    not_eligible: 0,
    eligible: 0,
    single_offers: 0,
    multiple_offers: 0,
    total_offers: 0,
    total_percentage_single: 0,
    year: new Date().getFullYear()
  });
  // New states for delete record and delete all
  const [deleteParams, setDeleteParams] = useState({ year: '', branch: '' });
  const [deleteAllPassword, setDeleteAllPassword] = useState('');
  const [deleteAllReady, setDeleteAllReady] = useState(false);
  const [deleteAllError, setDeleteAllError] = useState('');
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [deleteAllUsername, setDeleteAllUsername] = useState('');
  const [showSuccess, setShowSuccess] = useState('');

  // Company Data State
  const [companyData, setCompanyData] = useState([]);
  const [companyFormData, setCompanyFormData] = useState({
    company_name: '',
    internship_ppo: 0,
    salary: 0,
    CSE: 0,
    CSBS: 0,
    CYS: 0,
    AIML: 0,
    DS: 0,
    IOT: 0,
    IT: 0,
    ECE: 0,
    EEE: 0,
    EIE: 0,
    MECH: 0,
    CIVIL: 0,
    AUTO: 0,
    total_offers: 0,
    year: new Date().getFullYear()
  });
  // Company delete states
  const [deleteCompanyParams, setDeleteCompanyParams] = useState({ year: '', company_name: '' });
  const [deleteAllCompanyUsername, setDeleteAllCompanyUsername] = useState('');
  const [deleteAllCompanyPassword, setDeleteAllCompanyPassword] = useState('');
  const [deleteAllCompanyReady, setDeleteAllCompanyReady] = useState(false);
  const [deleteAllCompanyError, setDeleteAllCompanyError] = useState('');
  const [companyYearOptions, setCompanyYearOptions] = useState([]);
  const [selectedCompanyYear, setSelectedCompanyYear] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');

  useEffect(() => {
    fetchPlacementData();
    fetchCompanyData();
  }, []);

  useEffect(() => {
    // Update year options when placementData changes
    const years = Array.from(new Set(placementData.map(d => d.year))).sort((a, b) => b - a);
    setYearOptions(years);
    if (years.length > 0 && !selectedYear) setSelectedYear(years[0]);
    // Company year options
    const companyYears = Array.from(new Set(companyData.map(d => d.year))).sort((a, b) => b - a);
    setCompanyYearOptions(companyYears);
    if (companyYears.length > 0 && !selectedCompanyYear) setSelectedCompanyYear(companyYears[0]);
  }, [placementData, companyData]);

  const getToken = () => localStorage.getItem('token');

  // Placement Statistics Functions
  const fetchPlacementData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/dashboard/get-data');
      setPlacementData(response.data);
    } catch (error) {
      console.error('Error fetching placement data:', error);
    }
  };

  const handlePlacementSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate all fields are filled
      const requiredFields = Object.keys(placementFormData);
      const emptyFields = requiredFields.filter(field => !placementFormData[field]);
      if (emptyFields.length > 0) {
        alert('Please fill in all fields');
        return;
      }
      await axios.post('http://localhost:8000/dashboard/add-data', placementFormData, { headers: { Authorization: `Bearer ${getToken()}` } });
      setPlacementFormData({
        branch: '',
        selected_male: 0,
        selected_female: 0,
        selected_total: 0,
        class_total: 0,
        registered: 0,
        not_registered: 0,
        not_eligible: 0,
        eligible: 0,
        single_offers: 0,
        multiple_offers: 0,
        total_offers: 0,
        total_percentage_single: 0,
        year: new Date().getFullYear()
      });
      fetchPlacementData();
      setShowSuccess('Added successfully!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (error) {
      console.error('Error adding placement data:', error);
    }
  };

  // Delete record by parameters (placement)
  const handleDeleteRecord = async (e) => {
    e.preventDefault();
    if (!deleteParams.year) {
      alert('Please provide at least the year.');
      return;
    }
    let confirmMsg = 'Are you sure you want to delete ';
    if (deleteParams.year && deleteParams.branch) {
      confirmMsg += `all placement records for year ${deleteParams.year} and branch ${deleteParams.branch}?`;
    } else {
      confirmMsg += `all placement records for year ${deleteParams.year}?`;
    }
    if (!window.confirm(confirmMsg)) return;
    const params = [];
    if (deleteParams.year) params.push(`year=${deleteParams.year}`);
    if (deleteParams.branch) params.push(`branch=${deleteParams.branch}`);
    try {
      await axios.delete(`http://localhost:8000/dashboard/delete-record?${params.join('&')}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchPlacementData();
      setDeleteParams({ year: '', branch: '' });
      setShowSuccess('Deleted successfully!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (error) {
      alert('Error deleting record.');
    }
  };

  // Admin validation for deleting all placement records
  const handleDeleteAllPassword = async (e) => {
    e.preventDefault();
    setDeleteAllError('');
    try {
      const formData = new FormData();
      formData.append('username', deleteAllUsername);
      formData.append('password', deleteAllPassword);
      await axios.post('http://localhost:8000/auth/login', formData);
      setDeleteAllReady(true);
    } catch (err) {
      setDeleteAllError('Invalid admin username or password.');
      setDeleteAllReady(false);
    }
  };

  // Delete all placement data
  const handleDeleteAllConfirmed = async () => {
    try {
      await axios.delete('http://localhost:8000/dashboard/delete-all-records', { headers: { Authorization: `Bearer ${getToken()}` } });
      setDeleteAllReady(false);
      setDeleteAllPassword('');
      fetchPlacementData();
      setShowSuccess('All records deleted!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (err) {
      setDeleteAllError('Failed to delete all records.');
    }
  };

  // Company Data Functions
  const fetchCompanyData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/dashboard/get-company-data');
      setCompanyData(response.data);
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/dashboard/add-company-data', companyFormData, { headers: { Authorization: `Bearer ${getToken()}` } });
      setCompanyFormData({
        company_name: '',
        internship_ppo: 0,
        salary: 0,
        CSE: 0,
        CSBS: 0,
        CYS: 0,
        AIML: 0,
        DS: 0,
        IOT: 0,
        IT: 0,
        ECE: 0,
        EEE: 0,
        EIE: 0,
        MECH: 0,
        CIVIL: 0,
        AUTO: 0,
        total_offers: 0,
        year: new Date().getFullYear()
      });
      fetchCompanyData();
      setShowSuccess('Added successfully!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (error) {
      console.error('Error adding company data:', error);
    }
  };

  // Delete company record by parameters
  const handleDeleteCompanyRecord = async (e) => {
    e.preventDefault();
    if (!deleteCompanyParams.year) {
      alert('Please provide at least the year.');
      return;
    }
    let confirmMsg = 'Are you sure you want to delete ';
    if (deleteCompanyParams.year && deleteCompanyParams.company_name) {
      confirmMsg += `all company records for year ${deleteCompanyParams.year} and company ${deleteCompanyParams.company_name}?`;
    } else {
      confirmMsg += `all company records for year ${deleteCompanyParams.year}?`;
    }
    if (!window.confirm(confirmMsg)) return;
    const params = [];
    if (deleteCompanyParams.year) params.push(`year=${deleteCompanyParams.year}`);
    if (deleteCompanyParams.company_name) params.push(`company_name=${deleteCompanyParams.company_name}`);
    try {
      await axios.delete(`http://localhost:8000/dashboard/delete-company-data?${params.join('&')}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchCompanyData();
      setDeleteCompanyParams({ year: '', company_name: '' });
      setShowSuccess('Deleted successfully!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (error) {
      alert('Error deleting company record.');
    }
  };

  // Admin validation for deleting all company records
  const handleDeleteAllCompanyPassword = async (e) => {
    e.preventDefault();
    setDeleteAllCompanyError('');
    try {
      const formData = new FormData();
      formData.append('username', deleteAllCompanyUsername);
      formData.append('password', deleteAllCompanyPassword);
      await axios.post('http://localhost:8000/auth/login', formData);
      setDeleteAllCompanyReady(true);
    } catch (err) {
      setDeleteAllCompanyError('Invalid admin username or password.');
      setDeleteAllCompanyReady(false);
    }
  };

  // Delete all company data
  const handleDeleteAllCompanyConfirmed = async () => {
    if (!window.confirm('Are you sure you want to delete ALL company records? This cannot be undone.')) return;
    try {
      await axios.delete('http://localhost:8000/dashboard/delete-all-company-data', { headers: { Authorization: `Bearer ${getToken()}` } });
      setDeleteAllCompanyReady(false);
      setDeleteAllCompanyUsername('');
      setDeleteAllCompanyPassword('');
      fetchCompanyData();
      setShowSuccess('All company records deleted!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (err) {
      setDeleteAllCompanyError('Failed to delete all company records.');
    }
  };

  return (
    <AdminLayout>
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50 animate-bounce">
          {showSuccess}
        </div>
      )}
      {/* Placement Statistics Section */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Add Placement Statistics</h3>
          <form onSubmit={handlePlacementSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
                <select
                  name="branch"
                  id="branch"
                  value={placementFormData.branch}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, branch: e.target.value })}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Branch</option>
                  {BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  value={placementFormData.year}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, year: parseInt(e.target.value) })}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="selected_male" className="block text-sm font-medium text-gray-700">Selected Male</label>
                <input
                  type="number"
                  name="selected_male"
                  id="selected_male"
                  value={placementFormData.selected_male}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, selected_male: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="selected_female" className="block text-sm font-medium text-gray-700">Selected Female</label>
                <input
                  type="number"
                  name="selected_female"
                  id="selected_female"
                  value={placementFormData.selected_female}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, selected_female: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="selected_total" className="block text-sm font-medium text-gray-700">Selected Total</label>
                <input
                  type="number"
                  name="selected_total"
                  id="selected_total"
                  value={placementFormData.selected_total}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, selected_total: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="class_total" className="block text-sm font-medium text-gray-700">Class Total</label>
                <input
                  type="number"
                  name="class_total"
                  id="class_total"
                  value={placementFormData.class_total}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, class_total: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="registered" className="block text-sm font-medium text-gray-700">Registered</label>
                <input
                  type="number"
                  name="registered"
                  id="registered"
                  value={placementFormData.registered}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, registered: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="not_registered" className="block text-sm font-medium text-gray-700">Not Registered</label>
                <input
                  type="number"
                  name="not_registered"
                  id="not_registered"
                  value={placementFormData.not_registered}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, not_registered: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="not_eligible" className="block text-sm font-medium text-gray-700">Not Eligible</label>
                <input
                  type="number"
                  name="not_eligible"
                  id="not_eligible"
                  value={placementFormData.not_eligible}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, not_eligible: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="eligible" className="block text-sm font-medium text-gray-700">Eligible</label>
                <input
                  type="number"
                  name="eligible"
                  id="eligible"
                  value={placementFormData.eligible}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, eligible: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="single_offers" className="block text-sm font-medium text-gray-700">Single Offers</label>
                <input
                  type="number"
                  name="single_offers"
                  id="single_offers"
                  value={placementFormData.single_offers}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, single_offers: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="multiple_offers" className="block text-sm font-medium text-gray-700">Multiple Offers</label>
                <input
                  type="number"
                  name="multiple_offers"
                  id="multiple_offers"
                  value={placementFormData.multiple_offers}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, multiple_offers: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="total_offers" className="block text-sm font-medium text-gray-700">Total Offers</label>
                <input
                  type="number"
                  name="total_offers"
                  id="total_offers"
                  value={placementFormData.total_offers}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, total_offers: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="total_percentage_single" className="block text-sm font-medium text-gray-700">Total Percentage Single</label>
                <input
                  type="number"
                  step="0.01"
                  name="total_percentage_single"
                  id="total_percentage_single"
                  value={placementFormData.total_percentage_single}
                  onChange={(e) => setPlacementFormData({ ...placementFormData, total_percentage_single: parseFloat(e.target.value) })}
                  required
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Placement Data
            </button>
          </form>
        </div>
      </div>

      {/* Delete Record Form */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Placement Record</h3>
          <form onSubmit={handleDeleteRecord} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input type="number" value={deleteParams.year} onChange={e => setDeleteParams(p => ({...p, year: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <select value={deleteParams.branch} onChange={e => setDeleteParams(p => ({...p, branch: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                <option value="">Select Branch (optional)</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">Delete Record</button>
          </form>
        </div>
      </div>

      {/* Delete All Section */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Delete All Placement Records</h3>
          {!deleteAllReady ? (
            <form onSubmit={handleDeleteAllPassword} className="flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Username</label>
                <input type="text" value={deleteAllUsername} onChange={e => setDeleteAllUsername(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Password</label>
                <input type="password" value={deleteAllPassword} onChange={e => setDeleteAllPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
              </div>
              <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">Validate</button>
              {deleteAllError && <span className="text-red-500 ml-4">{deleteAllError}</span>}
            </form>
          ) : (
            <button onClick={handleDeleteAllConfirmed} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">Delete All Records</button>
          )}
        </div>
      </div>

      {/* View Section for Topmost Year */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">View Placement Statistics by Year</h3>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border border-gray-300 rounded-md py-2 px-3">
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selected Male</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selected Female</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selected Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Not Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Not Eligible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Single Offers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multiple Offers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Offers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total % Single</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {placementData.filter(item => String(item.year) === String(selectedYear)).map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.selected_male}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.selected_female}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.selected_total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.class_total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.registered}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.not_registered}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.not_eligible}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.eligible}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.single_offers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.multiple_offers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.total_offers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.total_percentage_single}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Company Data Section */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Add Company Data</h3>
          <form onSubmit={handleCompanySubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" name="company_name" id="company_name" value={companyFormData.company_name} onChange={e => setCompanyFormData({ ...companyFormData, company_name: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>
              <div>
                <label htmlFor="internship_ppo" className="block text-sm font-medium text-gray-700">Internship PPO</label>
                <input type="number" name="internship_ppo" id="internship_ppo" value={companyFormData.internship_ppo} onChange={e => setCompanyFormData({ ...companyFormData, internship_ppo: parseInt(e.target.value) })} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary</label>
                <input type="number" name="salary" id="salary" value={companyFormData.salary} onChange={e => setCompanyFormData({ ...companyFormData, salary: parseFloat(e.target.value) })} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>
              {/* Branches */}
              {['CSE','CSBS','CYS','AIML','DS','IOT','IT','ECE','EEE','EIE','MECH','CIVIL','AUTO'].map(branch => (
                <div key={branch}>
                  <label htmlFor={branch} className="block text-sm font-medium text-gray-700">{branch}</label>
                  <input type="number" name={branch} id={branch} value={companyFormData[branch]} onChange={e => setCompanyFormData({ ...companyFormData, [branch]: parseInt(e.target.value) })} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
              ))}
              <div>
                <label htmlFor="total_offers" className="block text-sm font-medium text-gray-700">Total Offers</label>
                <input type="number" name="total_offers" id="total_offers" value={companyFormData.total_offers} onChange={e => setCompanyFormData({ ...companyFormData, total_offers: parseInt(e.target.value) })} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                <input type="number" name="year" id="year" value={companyFormData.year} onChange={e => setCompanyFormData({ ...companyFormData, year: parseInt(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>
            </div>
            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Add Company Data</button>
          </form>
        </div>
      </div>

      {/* Delete Company Record Form */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Company Record</h3>
          <form onSubmit={handleDeleteCompanyRecord} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input type="number" value={deleteCompanyParams.year} onChange={e => setDeleteCompanyParams(p => ({...p, year: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input type="text" value={deleteCompanyParams.company_name} onChange={e => setDeleteCompanyParams(p => ({...p, company_name: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">Delete Record</button>
          </form>
        </div>
      </div>

      {/* Delete All Company Data Section */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Delete All Company Records</h3>
          {!deleteAllCompanyReady ? (
            <form onSubmit={handleDeleteAllCompanyPassword} className="flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Username</label>
                <input type="text" value={deleteAllCompanyUsername} onChange={e => setDeleteAllCompanyUsername(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Password</label>
                <input type="password" value={deleteAllCompanyPassword} onChange={e => setDeleteAllCompanyPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
              </div>
              <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">Validate</button>
              {deleteAllCompanyError && <span className="text-red-500 ml-4">{deleteAllCompanyError}</span>}
            </form>
          ) : (
            <button onClick={handleDeleteAllCompanyConfirmed} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">Delete All Company Records</button>
          )}
        </div>
      </div>

      {/* View Company Data by Year */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">View Company Data by Year</h3>
            <select value={selectedCompanyYear} onChange={e => setSelectedCompanyYear(e.target.value)} className="border border-gray-300 rounded-md py-2 px-3">
              {companyYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <input
              type="text"
              placeholder="Search company name"
              value={companySearch}
              onChange={e => setCompanySearch(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3"
            />
            <button
              type="button"
              onClick={() => setCompanySearchTerm(companySearch)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Search
            </button>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Internship PPO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  {['CSE','CSBS','CYS','AIML','DS','IOT','IT','ECE','EEE','EIE','MECH','CIVIL','AUTO'].map(branch => (
                    <th key={branch} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{branch}</th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Offers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companyData
                  .filter(item => String(item.year) === String(selectedCompanyYear))
                  .filter(item => !companySearchTerm || (item.company_name && item.company_name.toLowerCase().includes(companySearchTerm.toLowerCase())))
                  .sort((a, b) => (a.company_name || '').toLowerCase().localeCompare((b.company_name || '').toLowerCase()))
                  .map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.internship_ppo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.salary}</td>
                    {['CSE','CSBS','CYS','AIML','DS','IOT','IT','ECE','EEE','EIE','MECH','CIVIL','AUTO'].map(branch => (
                      <td key={branch} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item[branch]}</td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.total_offers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardData; 