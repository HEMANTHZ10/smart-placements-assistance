import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Filter, Download, ArrowUpRight, Search, Building2, Users, Award, TrendingUp, ArrowDownRight, BarChart3 } from 'lucide-react';
import { dashboardService } from '../services/api';



const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const CompanyRecruitment = () => {
  const [companyData, setCompanyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalCompanies: 0,
    totalOffers: 0,
    offersPerStudent: 0,
    yearOverYearGrowth: {
      companies: 0,
      offers: 0,
      offersPerStudent: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [sortBySalary, setSortBySalary] = useState(false);
  const BRANCHES = [
    'ALL',
    'CSE',
    'CSBS',
    'CYS',
    'AIML',
    'DS',
    'IOT',
    'IT',
    'ECE',
    'EEE',
    'EIE',
    'MECH',
    'CIVIL',
    'AUTO',
    'AIDS'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await dashboardService.getCompanyData();
        const data = response;  // The actual data array from your backend
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }

        const years = [...new Set(data.map(d => d.year))].sort((a, b) => b - a);
        const currentYear = years[0];
        const lastYear = years[1];
        
        setAvailableYears(years.slice(0, 5));
        setSelectedYear(currentYear);
        setCompanyData(data);

        // Calculate summary statistics
        const currentYearData = data.filter(d => d.year === currentYear);
        const lastYearData = data.filter(d => d.year === lastYear);

        const currentPackageStats = calculatePackageStats(currentYearData);
        const lastPackageStats = calculatePackageStats(lastYearData);

        const currentStats = {
          totalCompanies: currentYearData.length,
          totalOffers: currentYearData.reduce((sum, d) => sum + (d.total_offers || 0), 0),
          offersPerStudent: calculateOffersPerStudent(currentYearData),
          averagePackage: currentPackageStats.average,
          highestPackage: currentPackageStats.highest
        };

        const lastYearStats = {
          totalCompanies: lastYearData.length,
          totalOffers: lastYearData.reduce((sum, d) => sum + (d.total_offers || 0), 0),
          offersPerStudent: calculateOffersPerStudent(lastYearData),
          averagePackage: lastPackageStats.average,
          highestPackage: lastPackageStats.highest
        };

        setSummaryStats({
          ...currentStats,
          yearOverYearGrowth: {
            companies: calculateGrowth(currentStats.totalCompanies, lastYearStats.totalCompanies),
            offers: calculateGrowth(currentStats.totalOffers, lastYearStats.totalOffers),
            offersPerStudent: calculateGrowth(currentStats.offersPerStudent, lastYearStats.offersPerStudent),
            averagePackage: calculateGrowth(currentStats.averagePackage, lastYearStats.averagePackage),
            highestPackage: calculateGrowth(currentStats.highestPackage, lastYearStats.highestPackage)
          }
        });

      } catch (err) {
        console.error('Error fetching company data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTotalStudents = (company) => {
    // Sum up students across all branches
    const branches = ['CSE', 'CSBS', 'CYS', 'AIML', 'DS', 'IOT', 'IT', 'ECE', 
                     'EEE', 'EIE', 'MECH', 'CIVIL', 'AUTO'];
    return branches.reduce((sum, branch) => sum + (company[branch] || 0), 0);
  };

  const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const calculateOffersPerStudent = (companies) => {
    const totalOffers = companies.reduce((sum, d) => sum + (d.total_offers || 0), 0);
    const totalStudents = companies.reduce((sum, d) => sum + calculateTotalStudents(d), 0);
    return totalStudents ? (totalOffers / totalStudents).toFixed(2) : '0.00';
  };

  const calculatePackageStats = (companies) => {
    const validSalaries = companies
      .filter(c => c.salary && typeof c.salary === 'number' && c.salary > 0)
      .map(c => c.salary);
    
    return {
      average: validSalaries.length ? 
        (validSalaries.reduce((a, b) => a + b, 0) / validSalaries.length).toFixed(2) : '0.00',
      highest: validSalaries.length ? 
        Math.max(...validSalaries).toFixed(2) : '0.00'
    };
  };

  const getSalaryRangeData = (year) => {
    const ranges = [
      { range: '0-5', min: 0, max: 5 },
      { range: '5-10', min: 5, max: 10 },
      { range: '10-15', min: 10, max: 15 },
      { range: '15-20', min: 15, max: 20 },
      { range: '20-25', min: 20, max: 25 },
      { range: '25+', min: 25, max: Infinity }
    ];

    const yearData = companyData.filter(d => d.year === year);
    return ranges.map(r => ({
      range: `${r.range} LPA`,
      count: yearData.filter(d => {
        const salaryInLPA = d.salary || 0;
        if (r.max === Infinity) {
          return salaryInLPA >= r.min;
        }
        return salaryInLPA >= r.min && salaryInLPA < r.max;
      }).length
    }));
  };

  const getYearlyCompanyCount = () => {
    return availableYears.map(year => ({
      year: year.toString(),
      companies: companyData.filter(d => d.year === year).length
    }));
  };

  const getTop10Companies = (year) => {
    return companyData
      .filter(d => d.year === year)
      .sort((a, b) => b.total_offers - a.total_offers)
      .slice(0, 10)
      .map(d => ({
        name: d.company_name.length > 15 ? d.company_name.substring(0, 15) + '...' : d.company_name,
        fullName: d.company_name,
        offers: d.total_offers
      }));
  };

  const getPackageTrends = () => {
    return availableYears.map(year => {
      const yearData = companyData.filter(d => d.year === year);
      const packageStats = calculatePackageStats(yearData);
      return {
        year: year.toString(),
        average: parseFloat(packageStats.average),
        highest: parseFloat(packageStats.highest)
      };
    });
  };

  const YearFilter = () => (
    <select
      value={selectedYear}
      onChange={(e) => setSelectedYear(Number(e.target.value))}
      className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
    >
      {availableYears.map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  );

  const BranchFilter = () => (
    <select
      value={selectedBranch}
      onChange={(e) => setSelectedBranch(e.target.value)}
      className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
    >
      {BRANCHES.map(branch => (
        <option key={branch} value={branch}>{branch}</option>
      ))}
    </select>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Company Recruitment Analysis
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Total Companies
            </h2>
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {summaryStats.totalCompanies}
            </div>
          </div>
          <p className="text-sm text-gray-500">Current academic year</p>
          <div className={`mt-2 ${summaryStats.yearOverYearGrowth.companies >= 0 ? 'text-green-500' : 'text-red-500'} text-sm flex items-center gap-1`}>
            {summaryStats.yearOverYearGrowth.companies >= 0 ? 
              <TrendingUp className="h-4 w-4" /> : 
              <ArrowDownRight className="h-4 w-4" />
            }
            <span>{Math.abs(summaryStats.yearOverYearGrowth.companies)}% from last year</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Offers per Student
            </h2>
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {summaryStats.offersPerStudent}
            </div>
          </div>
          <p className="text-sm text-gray-500">Current academic year</p>
          <div className={`mt-2 ${summaryStats.yearOverYearGrowth.offersPerStudent >= 0 ? 'text-green-500' : 'text-red-500'} text-sm flex items-center gap-1`}>
            {summaryStats.yearOverYearGrowth.offersPerStudent >= 0 ? 
              <TrendingUp className="h-4 w-4" /> : 
              <ArrowDownRight className="h-4 w-4" />
            }
            <span>{Math.abs(summaryStats.yearOverYearGrowth.offersPerStudent)}% from last year</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-pink-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-pink-600" />
              Package Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Package:</span>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
                  {summaryStats.averagePackage} LPA
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Highest Package:</span>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
                  {summaryStats.highestPackage} LPA
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">Current academic year</p>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Company Distribution by Package Range
          </h2>
          <YearFilter />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={getSalaryRangeData(selectedYear)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="range" 
              interval={0} 
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="count" 
              name="Number of Companies" 
              fill="#8884d8"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Companies Visited (Last 5 Years)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={getYearlyCompanyCount()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="companies" 
              name="Number of Companies" 
              fill="#82ca9d"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <LineChart className="h-5 w-5 text-pink-600" />
          Package Trends (Last 5 Years)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={getPackageTrends()}>
            <defs>
              <linearGradient id="highestGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
              <linearGradient id="averageGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{ 
                value: 'Package (LPA)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="highest" 
              name="Highest Package" 
              stroke="url(#highestGradient)" 
              strokeWidth={3}
              dot={{ r: 6, fill: '#db2777', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey="average" 
              name="Average Package" 
              stroke="url(#averageGradient)" 
              strokeWidth={3}
              dot={{ r: 6, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Top 10 Recruiters
          </h2>
          <YearFilter />
        </div>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={getTop10Companies(selectedYear)}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
          >
            <defs>
              <linearGradient id="topRecruitersGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis 
              type="number"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              dataKey="name" 
              type="category"
              width={140}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              formatter={(value, name, props) => [value, props.payload.fullName]}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="offers" 
              name="Total Offers" 
              fill="url(#topRecruitersGradient)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Company Recruitment Details
          </h2>
          <div className="flex gap-4 items-center">
            <YearFilter />
            <BranchFilter />
            <div className="relative">
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {selectedBranch === 'ALL' ? 'Total Offers' : `${selectedBranch} Offers`}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-purple-600 transition-colors flex items-center gap-1"
                  onClick={() => setSortBySalary(!sortBySalary)}
                >
                  Package (LPA)
                  <span className="inline-block ml-1">
                    {sortBySalary ? '↓' : '↑'}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companyData
                .filter(d => d.year === selectedYear)
                .filter(d => d.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(d => selectedBranch === 'ALL' ? true : d[selectedBranch] > 0)
                .sort((a, b) => {
                  if (sortBySalary) {
                    const aSalary = a.salary || 0;
                    const bSalary = b.salary || 0;
                    return bSalary - aSalary;
                  }
                  const aOffers = selectedBranch === 'ALL' ? (a.total_offers || 0) : (a[selectedBranch] || 0);
                  const bOffers = selectedBranch === 'ALL' ? (b.total_offers || 0) : (b[selectedBranch] || 0);
                  return bOffers - aOffers;
                })
                .map((company, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-600">
                        {selectedBranch === 'ALL' ? 
                          (company.total_offers || 0) : 
                          (company[selectedBranch] || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600">
                        {company.salary ? `${company.salary.toFixed(2)}` : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyRecruitment;