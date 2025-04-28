import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const getNextId = (data) => {
  // Find the highest cXX id and return c(next)
  const ids = data.map(item => item.id).filter(Boolean);
  let max = 0;
  ids.forEach(id => {
    const match = id.match(/^c(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  });
  const next = (max + 1).toString().padStart(2, '0');
  return `c${next}`;
};

const CompanyInsightsData = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    companyName: '',
    companyDesc: '',
    roles: [
      {
        role: '',
        jobDesc: '',
        package: '',
        rounds: { }
      }
    ],
    description: ''
  });
  const [deleteCompanyName, setDeleteCompanyName] = useState('');
  const [deleteAllCompanyUsername, setDeleteAllCompanyUsername] = useState('');
  const [deleteAllCompanyPassword, setDeleteAllCompanyPassword] = useState('');
  const [deleteAllCompanyReady, setDeleteAllCompanyReady] = useState(false);
  const [deleteAllCompanyError, setDeleteAllCompanyError] = useState('');
  const [allCompanies, setAllCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState('');

  useEffect(() => {
    fetchData();
    fetchAllCompanies();
  }, []);

  useEffect(() => {
    // Set next id when data changes
    setFormData(f => ({ ...f, id: getNextId(data) }));
  }, [data]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/company-insights/get-company-insights-data');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAllCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:8000/company-insights/get-company-insights-data');
      setAllCompanies(response.data);
    } catch (error) {
      console.error('Error fetching all companies:', error);
    }
  };

  const handleRoleChange = (idx, field, value) => {
    setFormData(f => {
      const roles = [...f.roles];
      roles[idx][field] = value;
      return { ...f, roles };
    });
  };

  const handleRoundChange = (roleIdx, roundKey, value) => {
    setFormData(f => {
      const roles = [...f.roles];
      roles[roleIdx].rounds = { ...roles[roleIdx].rounds, [roundKey]: value };
      return { ...f, roles };
    });
  };

  const addRole = () => {
    setFormData(f => ({
      ...f,
      roles: [...f.roles, { role: '', jobDesc: '', package: '', rounds: {} }]
    }));
  };

  const removeRole = (idx) => {
    setFormData(f => ({
      ...f,
      roles: f.roles.filter((_, i) => i !== idx)
    }));
  };

  const addRound = (roleIdx) => {
    setFormData(f => {
      const roles = [...f.roles];
      const roundKeys = Object.keys(roles[roleIdx].rounds || {});
      const nextKey = `round${roundKeys.length + 1}`;
      roles[roleIdx].rounds = { ...roles[roleIdx].rounds, [nextKey]: '' };
      return { ...f, roles };
    });
  };

  const removeRound = (roleIdx, roundKey) => {
    setFormData(f => {
      const roles = [...f.roles];
      const { [roundKey]: _, ...rest } = roles[roleIdx].rounds;
      roles[roleIdx].rounds = rest;
      return { ...f, roles };
    });
  };

  const getToken = () => localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/company-insights/add-company-insights-data', formData, { headers: { Authorization: `Bearer ${getToken()}` } });
      await fetchData();
      await fetchAllCompanies();
      setFormData({
        id: getNextId(data),
        companyName: '',
        companyDesc: '',
        roles: [{ role: '', jobDesc: '', package: '', rounds: {} }],
        description: ''
      });
      setShowSuccess('Added successfully!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (error) {
      console.error('Error adding data:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/company-insights/delete-data/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchData();
      setShowSuccess('Deleted successfully!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await axios.delete('http://localhost:8000/company-insights/delete-all-data', { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchData();
      setShowSuccess('All data deleted!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (error) {
      console.error('Error deleting all data:', error);
    }
  };

  // Delete company by company name
  const handleDeleteCompany = async (e) => {
    e.preventDefault();
    if (!deleteCompanyName) {
      alert('Please enter a company name.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete all records for company: ${deleteCompanyName}?`)) return;
    try {
      await axios.delete(`http://localhost:8000/company-insights/delete-company-insights-record?company_name=${encodeURIComponent(deleteCompanyName)}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setDeleteCompanyName('');
      await fetchData();
      await fetchAllCompanies();
      setShowSuccess('Company deleted!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (error) {
      alert('Error deleting company record.');
    }
  };

  // Delete all companies with admin validation
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
  const handleDeleteAllCompanyConfirmed = async () => {
    if (!window.confirm('Are you sure you want to delete ALL company insights data? This cannot be undone.')) return;
    try {
      await axios.delete('http://localhost:8000/company-insights/delete-all-company-insights-data', { headers: { Authorization: `Bearer ${getToken()}` } });
      setDeleteAllCompanyReady(false);
      setDeleteAllCompanyUsername('');
      setDeleteAllCompanyPassword('');
      await fetchData();
      await fetchAllCompanies();
      setShowSuccess('All company insights deleted!');
      setTimeout(() => setShowSuccess(''), 2000);
    } catch (err) {
      setDeleteAllCompanyError('Failed to delete all company insights data.');
    }
  };

  return (
    <AdminLayout>
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50 animate-bounce">
          {showSuccess}
        </div>
      )}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Add Company Insights Data</h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID (auto)</label>
              <input type="text" value={formData.id} readOnly className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input type="text" value={formData.companyName} onChange={e => setFormData(f => ({ ...f, companyName: e.target.value }))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Description</label>
              <input type="text" value={formData.companyDesc} onChange={e => setFormData(f => ({ ...f, companyDesc: e.target.value }))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roles</label>
              {formData.roles.map((role, idx) => (
                <div key={idx} className="border p-4 mb-2 rounded-md bg-gray-50">
                  <div className="flex gap-2 mb-2">
                    <input type="text" placeholder="Role" value={role.role} onChange={e => handleRoleChange(idx, 'role', e.target.value)} className="border rounded px-2 py-1 flex-1" required />
                    <input type="text" placeholder="Job Desc" value={role.jobDesc} onChange={e => handleRoleChange(idx, 'jobDesc', e.target.value)} className="border rounded px-2 py-1 flex-1" required />
                    <input type="text" placeholder="Package" value={role.package} onChange={e => handleRoleChange(idx, 'package', e.target.value)} className="border rounded px-2 py-1 flex-1" required />
                    {formData.roles.length > 1 && <button type="button" onClick={() => removeRole(idx)} className="text-red-600">Remove</button>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Rounds</label>
                    {Object.entries(role.rounds).map(([key, value]) => (
                      <div key={key} className="flex gap-2 mb-1">
                        <input type="text" value={key} readOnly className="border rounded px-2 py-1 w-32 bg-gray-100" />
                        <input type="text" value={value} onChange={e => handleRoundChange(idx, key, e.target.value)} className="border rounded px-2 py-1 flex-1" />
                        <button type="button" onClick={() => removeRound(idx, key)} className="text-red-600">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addRound(idx)} className="mt-1 text-blue-600">+ Add Round</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addRole} className="mt-2 text-blue-600">+ Add Role</button>
            </div>
            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Add Data</button>
          </form>
        </div>
      </div>

      {/* <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Company Insights Data List</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {data.map((item) => (
            <li key={item.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{item.companyName}</h4>
                  <p className="text-sm text-gray-500">{item.companyDesc}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <div className="text-xs text-gray-700 mt-2">
                    <b>Roles:</b>
                    <ul className="list-disc ml-6">
                      {item.roles && item.roles.map((role, i) => (
                        <li key={i}>
                          <b>{role.role}</b> - {role.jobDesc} - {role.package}
                          <ul className="list-disc ml-6">
                            {role.rounds && Object.entries(role.rounds).map(([k, v]) => (
                              <li key={k}>{k}: {v}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Delete Company Record Form */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Company Insights Record</h3>
          <form onSubmit={handleDeleteCompany} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input type="text" value={deleteCompanyName} onChange={e => setDeleteCompanyName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
            </div>
            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">Delete Record</button>
          </form>
        </div>
      </div>

      {/* Delete All Company Insights Data Section */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Delete All Company Insights Data</h3>
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
            <button onClick={handleDeleteAllCompanyConfirmed} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">Delete All Company Insights Data</button>
          )}
        </div>
      </div>

      {/* View All Companies Section */}
      <div className="bg-white shadow sm:rounded-lg mt-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">View All Companies</h3>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allCompanies
                .filter(item => !companySearchTerm || (item.companyName && item.companyName.toLowerCase().includes(companySearchTerm.toLowerCase())))
                .sort((a, b) => (a.companyName || '').toLowerCase().localeCompare((b.companyName || '').toLowerCase()))
                .map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg shadow p-4 flex flex-col">
                    <div className="font-bold text-indigo-700 mb-1">{item.companyName}</div>
                    <div className="text-xs text-gray-500 mb-1">ID: {item.id}</div>
                    <div className="text-sm text-gray-800 mb-1">{item.companyDesc}</div>
                    <div className="text-xs text-gray-700 mb-2">{item.description}</div>
                    <div className="text-xs text-gray-700 mt-2">
                      <b>Roles:</b>
                      <ul className="list-disc ml-4">
                        {item.roles && item.roles.map((role, i) => (
                          <li key={i} className="mb-1">
                            <b>{role.role}</b> - {role.jobDesc} - <span className="text-green-700">{role.package}</span>
                            {role.rounds && Object.keys(role.rounds).length > 0 && (
                              <ul className="list-disc ml-4 mt-1">
                                {Object.entries(role.rounds).map(([k, v]) => (
                                  <li key={k}>{k}: {v}</li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CompanyInsightsData; 