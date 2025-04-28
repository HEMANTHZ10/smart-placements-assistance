import React, { useState, useEffect } from 'react';
import { Search, Building2, MapPin, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { companyInsightsService } from '../services/api';

const CompanyList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await companyInsightsService.getCompanyInsights();
        setCompanies(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);
  
  const filteredCompanies = companies
    .filter(company => 
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.companyDesc.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.companyName.localeCompare(b.companyName));
  
  const handleCompanyClick = (companyName) => {
    setSelectedCompany(companyName === selectedCompany ? null : companyName);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error: {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] opacity-10 bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-violet-600/90 to-purple-700/90"></div>
        </div>
        <div className="relative px-8 py-16 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Company Directory
          </h1>
          <p className="text-lg md:text-xl mb-8 text-indigo-100 leading-relaxed max-w-2xl">
            Explore detailed information about companies visiting our campus, their roles, and hiring processes.
          </p>
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search companies by name or description..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-4 h-6 w-6 text-white/60" />
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Companies ({filteredCompanies.length})
            </h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100 max-h-[800px] overflow-y-auto">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map(company => (
              <div key={company.companyName} 
                className="group hover:bg-gray-50 transition-all duration-200">
                <div className="p-6">
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => handleCompanyClick(company.companyName)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-200">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {company.companyName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Multiple Locations</span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
                      {selectedCompany === company.companyName ? (
                        <>Hide details <ChevronUp className="h-4 w-4" /></>
                      ) : (
                        <>View details <ChevronDown className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                  
                  {selectedCompany === company.companyName && (
                    <div className="mt-6 pl-20 animate-fadeIn">
                      <div className="prose prose-indigo max-w-none">
                        <p className="text-gray-600 mb-6">{company.companyDesc}</p>
                      </div>
                      
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-indigo-600" />
                          Open Positions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {company.roles.map((role, index) => (
                            <div key={index} 
                              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-indigo-200">
                              <div className="p-6">
                                <h5 className="text-lg font-semibold text-gray-900 mb-2">{role.role}</h5>
                                <p className="text-gray-600 text-sm mb-4">{role.jobDesc}</p>
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    {role.package}
                                  </div>
                                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    Full Time
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <h6 className="text-sm font-semibold text-gray-900">Hiring Process</h6>
                                  <div className="space-y-2">
                                    {Object.entries(role.rounds).map(([round, description], idx) => (
                                      <div key={round} 
                                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                                          {idx + 1}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">Round {round}</p>
                                          <p className="text-sm text-gray-600">{description}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or browse all companies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyList;