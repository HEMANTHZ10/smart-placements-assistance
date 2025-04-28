import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Building2, Users, TrendingUp, Award, Briefcase, ArrowRight, MessageSquareText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { dashboardService } from '../services/api';

const Home = () => {
  const [animateChart, setAnimateChart] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [animateCompanies, setAnimateCompanies] = useState(false);
  const [animateChat, setAnimateChat] = useState(false);
  const [stats, setStats] = useState({
    placementRate: 0,
    totalCompanies: 0,
    studentsPlaced: 0,
    highestPackage: 0,
    yearOverYearGrowth: {
      placementRate: 0,
      companies: 0,
      students: 0,
      package: 0
    }
  });
  const [yearlyData, setYearlyData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topCompanies, setTopCompanies] = useState([]);
  const [topCompaniesYear, setTopCompaniesYear] = useState(null);
  const [topCompaniesLoading, setTopCompaniesLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch placement data
        const placementResponse = await dashboardService.getPlacementData();
        const placementData = placementResponse.data;
        
        // Fetch company data
        const companyResponse = await dashboardService.getCompanyData();
        
        // Get unique years and sort them
        const years = [...new Set(companyResponse.map(d => d.year))].sort((a, b) => b - a);
        const currentYear = years[0];
        const lastYear = years[1];
        
        // Process placement data for current year and last year
        const currentYearPlacement = placementData.filter(d => d.year === currentYear);
        const lastYearPlacement = placementData.filter(d => d.year === lastYear);
        
        // Calculate placement rate
        const currentTotalStudents = currentYearPlacement.reduce((sum, d) => sum + (d.class_total || 0), 0);
        const currentPlacedStudents = currentYearPlacement.reduce((sum, d) => sum + (d.selected_total || 0), 0);
        const lastTotalStudents = lastYearPlacement.reduce((sum, d) => sum + (d.class_total || 0), 0);
        const lastPlacedStudents = lastYearPlacement.reduce((sum, d) => sum + (d.selected_total || 0), 0);
        
        const currentPlacementRate = currentTotalStudents ? (currentPlacedStudents / currentTotalStudents * 100).toFixed(1) : 0;
        const lastPlacementRate = lastTotalStudents ? (lastPlacedStudents / lastTotalStudents * 100).toFixed(1) : 0;
        
        // Process company data for current year and last year
        const currentYearCompanies = companyResponse.filter(d => d.year === currentYear);
        const lastYearCompanies = companyResponse.filter(d => d.year === lastYear);
        
        // Calculate highest package
        const currentHighestPackage = Math.max(...currentYearCompanies.map(d => d.salary || 0));
        const lastHighestPackage = Math.max(...lastYearCompanies.map(d => d.salary || 0));
        
        // Calculate year over year growth
        const calculateGrowth = (current, previous) => {
          if (!previous) return 0;
          return ((current - previous) / previous * 100).toFixed(1);
        };

        // Calculate percentage point difference for placement rate
        const calculatePlacementRateDiff = (current, previous) => {
          if (!previous) return 0;
          return (current - previous).toFixed(1);
        };
        
        // Set stats
        setStats({
          placementRate: parseFloat(currentPlacementRate),
          totalCompanies: currentYearCompanies.length,
          studentsPlaced: currentPlacedStudents,
          highestPackage: currentHighestPackage,
          yearOverYearGrowth: {
            placementRate: calculatePlacementRateDiff(currentPlacementRate, lastPlacementRate),
            companies: calculateGrowth(currentYearCompanies.length, lastYearCompanies.length),
            students: calculateGrowth(currentPlacedStudents, lastPlacedStudents),
            package: calculateGrowth(currentHighestPackage, lastHighestPackage)
          }
        });
        
        // Prepare yearly data for charts
        const yearlyStats = years.map(year => {
          const yearPlacement = placementData.filter(d => d.year === year);
          const yearCompanies = companyResponse.filter(d => d.year === year);
          const totalStudents = yearPlacement.reduce((sum, d) => sum + (d.class_total || 0), 0);
          const selectedStudents = yearPlacement.reduce((sum, d) => sum + (d.selected_total || 0), 0);
          return {
            year: year.toString(),
            placementRate: totalStudents ? (selectedStudents / totalStudents * 100).toFixed(1) : 0,
            companies: yearCompanies.length,
            offers: yearCompanies.reduce((sum, d) => sum + (d.total_offers || 0), 0)
          };
        });
        
        setYearlyData(yearlyStats);
        setCompanyData(companyResponse);
        
        // Trigger animations
        setTimeout(() => setAnimateChart(true), 300);
        setTimeout(() => setAnimateStats(true), 600);
        setTimeout(() => setAnimateCompanies(true), 900);
        setTimeout(() => setAnimateChat(true), 1200);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  useEffect(() => {
    const fetchTopCompanies = async () => {
      try {
        setTopCompaniesLoading(true);
        const response = await dashboardService.getCompanyData();
        
        // Get the latest year
        const years = [...new Set(response.map(d => d.year))].sort((a, b) => b - a);
        const currentYear = years[0];
        
        // Filter and sort companies for the current year
        const currentYearCompanies = response
          .filter(d => d.year === currentYear)
          .sort((a, b) => (b.total_offers || 0) - (a.total_offers || 0))
          .slice(0, 5);
        
        setTopCompaniesYear(currentYear);
        setTopCompanies(currentYearCompanies);
      } catch (err) {
        console.error('Error fetching top companies:', err);
      } finally {
        setTopCompaniesLoading(false);
      }
    };

    fetchTopCompanies();
  }, []); // Independent useEffect

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

  // Debug log for rendering
  console.log('Rendering with company data:', companyData);
  console.log('Current year:', yearlyData[0]?.year);
  
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] opacity-10 bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-violet-600/90 to-indigo-700/90"></div>
          {/* Animated particles */}
          <div className="absolute inset-0">
            <div className="absolute h-4 w-4 rounded-full bg-white/20 animate-particles top-1/4 left-1/4"></div>
            <div className="absolute h-3 w-3 rounded-full bg-white/20 animate-particles delay-300 top-1/3 right-1/3"></div>
            <div className="absolute h-2 w-2 rounded-full bg-white/20 animate-particles delay-500 bottom-1/4 right-1/4"></div>
            <div className="absolute h-3 w-3 rounded-full bg-white/20 animate-particles delay-700 bottom-1/3 left-1/3"></div>
          </div>
        </div>
        <div className="relative px-8 py-16 md:py-24 md:px-12 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                VNR Training & Placement Cell
              </h1>
              <p className="text-lg md:text-xl mb-8 text-purple-100 leading-relaxed">
                Empowering students with career opportunities and industry connections through data-driven placement analytics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/analysis" className="bg-white text-purple-700 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium flex items-center transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-105">
                  Explore Analytics <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/chatbot" className="bg-transparent border-2 border-white hover:bg-white hover:text-purple-700 px-6 py-3 rounded-lg font-medium flex items-center transition-all duration-200 hover:scale-105">
                  Ask AI Assistant <MessageSquareText className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center items-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <svg className="w-full h-full" viewBox="0 0 400 400">
                  {/* Definitions */}
                  <defs>
                    <linearGradient id="laptopScreen" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4F46E5"/>
                      <stop offset="100%" stopColor="#6366F1"/>
                    </linearGradient>
                    <linearGradient id="book1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444"/>
                      <stop offset="100%" stopColor="#F87171"/>
                    </linearGradient>
                    <linearGradient id="book2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6"/>
                      <stop offset="100%" stopColor="#A78BFA"/>
                    </linearGradient>
                    <linearGradient id="book3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981"/>
                      <stop offset="100%" stopColor="#34D399"/>
                    </linearGradient>
                    <linearGradient id="book4" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B"/>
                      <stop offset="100%" stopColor="#FBBF24"/>
                    </linearGradient>
                  </defs>

                  {/* Background with subtle gradient */}
                  <rect x="0" y="0" width="400" height="400" fill="#F8FAFC" opacity="0.1"/>

                  {/* Laptop */}
                  <g className="animate-float-slow">
                    {/* Laptop Base */}
                    <path d="M120,240 L280,240 L300,280 L100,280 Z" 
                          fill="#1E293B" 
                          className="animate-pulse"/>
                    
                    {/* Laptop Screen */}
                    <g>
                      <path d="M140,140 L260,140 L260,240 L140,240 Z" 
                            fill="#1E293B"/>
                      <path d="M145,145 L255,145 L255,235 L145,235 Z" 
                            fill="url(#laptopScreen)"/>
                      
                      {/* Code Lines Animation */}
                      <g className="animate-code-typing">
                        <line x1="155" y1="160" x2="245" y2="160" stroke="#FFFFFF" strokeWidth="2" opacity="0.5"/>
                        <line x1="155" y1="175" x2="225" y2="175" stroke="#FFFFFF" strokeWidth="2" opacity="0.3"/>
                        <line x1="155" y1="190" x2="235" y2="190" stroke="#FFFFFF" strokeWidth="2" opacity="0.5"/>
                        <line x1="155" y1="205" x2="215" y2="205" stroke="#FFFFFF" strokeWidth="2" opacity="0.3"/>
                      </g>
                    </g>
                  </g>

                  {/* Books */}
                  {/* Book 4 (Bottom) */}
                  <g className="animate-book-4">
                    <path d="M290,260 L350,260 L350,280 L290,280 Z" fill="url(#book4)"/>
                    <path d="M290,260 L350,260 L350,265 L290,265 Z" fill="#FFFFFF" opacity="0.3"/>
                  </g>

                  {/* Book 3 */}
                  <g className="animate-book-3">
                    <path d="M290,240 L350,240 L350,260 L290,260 Z" fill="url(#book3)"/>
                    <path d="M290,240 L350,240 L350,245 L290,245 Z" fill="#FFFFFF" opacity="0.3"/>
                  </g>

                  {/* Book 2 */}
                  <g className="animate-book-2">
                    <path d="M290,220 L350,220 L350,240 L290,240 Z" fill="url(#book2)"/>
                    <path d="M290,220 L350,220 L350,225 L290,225 Z" fill="#FFFFFF" opacity="0.3"/>
                  </g>

                  {/* Book 1 (Top) */}
                  <g className="animate-book-1">
                    <path d="M290,200 L350,200 L350,220 L290,220 Z" fill="url(#book1)"/>
                    <path d="M290,200 L350,200 L350,205 L290,205 Z" fill="#FFFFFF" opacity="0.3"/>
                  </g>

                  {/* Sparkles */}
                  <g className="animate-sparkle">
                    <circle cx="320" cy="180" r="2" fill="#FCD34D"/>
                    <circle cx="290" cy="190" r="2" fill="#FCD34D"/>
                    <circle cx="350" cy="195" r="2" fill="#FCD34D"/>
                    <circle cx="330" cy="170" r="2" fill="#FCD34D"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-all duration-200 hover:scale-105 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Placement Rate</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1 group-hover:text-purple-600 transition-colors">{stats.placementRate}%</h3>
              <p className={`text-sm mt-1 flex items-center ${parseFloat(stats.yearOverYearGrowth.placementRate) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <span>{stats.yearOverYearGrowth.placementRate}%</span>
                <span className="text-gray-400 ml-1">from last year</span>
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-500 transition-colors">
              <TrendingUp className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-all duration-200 hover:scale-105 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Companies</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1 group-hover:text-indigo-600 transition-colors">{stats.totalCompanies}</h3>
              <p className={`text-sm mt-1 flex items-center ${parseFloat(stats.yearOverYearGrowth.companies) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <span>{stats.yearOverYearGrowth.companies}%</span>
                <span className="text-gray-400 ml-1">from last year</span>
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-500 transition-colors">
              <Building2 className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-violet-500 hover:shadow-lg transition-all duration-200 hover:scale-105 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Students Placed</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1 group-hover:text-violet-600 transition-colors">{stats.studentsPlaced}</h3>
              <p className={`text-sm mt-1 flex items-center ${parseFloat(stats.yearOverYearGrowth.students) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <span>{stats.yearOverYearGrowth.students}%</span>
                <span className="text-gray-400 ml-1">from last year</span>
              </p>
            </div>
            <div className="bg-violet-100 p-3 rounded-lg group-hover:bg-violet-500 transition-colors">
              <Users className="h-6 w-6 text-violet-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all duration-200 hover:scale-105 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Highest Package</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1 group-hover:text-blue-600 transition-colors">₹{stats.highestPackage} LPA</h3>
              <div className="text-gray-400 text-sm mt-1">
                <span>Last Year</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-500 transition-colors">
              <Award className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Analytics Preview */}
      <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-700 transform ${animateChart ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} hover:shadow-lg`}>
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Placement Analytics
            </h2>
            <Link to="/analysis" className="text-purple-600 hover:text-purple-700 font-medium flex items-center text-sm bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
              View detailed analysis <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Yearly Placement Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="placementRate" 
                      name="Placement Rate (%)" 
                      stroke="#4F46E5" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Company Recruitment Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="companies" name="Companies" fill="#10B981" />
                    <Bar dataKey="offers" name="Total Offers" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top 5 Companies Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-purple-600" />
              Top 5 Companies - {topCompaniesYear}
            </h2>
            <Link to="/companies" className="text-purple-600 hover:text-purple-700 font-medium flex items-center bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
              View all companies <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          {topCompaniesLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {topCompanies.map((company, index) => (
                <div 
                  key={company.company_name || index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                >
                  <div className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
                        <Building2 className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 line-clamp-2 group-hover:text-purple-600 transition-colors">{company.company_name}</h3>
                      <div className="w-full space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-purple-50 transition-colors">
                          <p className="text-sm text-gray-500 mb-1">Total Offers</p>
                          <p className="text-xl font-bold text-purple-600">{company.total_offers || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-purple-50 transition-colors">
                          <p className="text-sm text-gray-500 mb-1">Package (LPA)</p>
                          <p className="text-xl font-bold text-indigo-600">₹{company.salary?.toFixed(2) || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* AI Assistant Preview */}
      <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-700 transform ${animateChat ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} hover:shadow-lg`}>
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-purple-600" />
              AI Placement Assistant
            </h2>
            <Link to="/chatbot" className="text-purple-600 hover:text-purple-700 font-medium flex items-center text-sm bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
              Chat with AI <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <MessageSquareText className="h-5 w-5 text-white" />
              </div>
              <div className="bg-purple-50 p-4 rounded-lg shadow-sm max-w-md relative">
                <div className="absolute w-3 h-3 bg-purple-50 transform rotate-45 -left-1.5 top-3"></div>
                <p className="text-gray-700">Hello! I'm your VNR Placement Assistant. Ask me anything about placement statistics, company information, or preparation tips.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-6">
              <button className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-lg text-sm transition-colors duration-200 hover:shadow-md flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                What companies hire the most?
              </button>
              <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2 rounded-lg text-sm transition-colors duration-200 hover:shadow-md flex items-center gap-1">
                <Award className="h-4 w-4" />
                How to prepare for interviews?
              </button>
              <button className="bg-violet-100 hover:bg-violet-200 text-violet-800 px-4 py-2 rounded-lg text-sm transition-colors duration-200 hover:shadow-md flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                What is the average package?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;