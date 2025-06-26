import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { Link } from 'react-router-dom';
import { useContext } from "react";
import { TokenContext } from "../../Context/TokenContext";

const currentYear = new Date().getFullYear();
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const recentOrders = [
  { product: "Smart Phone", category: "Mobiles", price: "$199.99" },
  { product: "White Headphones", category: "Music", price: "$79.49" },
  { product: "Stop Watch", category: "Electronics", price: "$49.29" },
  { product: "Nikon Camera", category: "Electronics", price: "$1,699.00" },
  { product: "Photo Frame", category: "Furniture", price: "$29.99" },
];

const topCustomers = [
  { name: "Emma Wilson", purchases: 15, amount: "$1,835" },
  { name: "Robert Lewis", purchases: 18, amount: "$2,341" },
  { name: "Angelina Hose", purchases: 12, amount: "$2,415" },
];

export default function AdminDashboard() {
  const [totalHandicrafts, setTotalHandicrafts] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [currentMonthData, setCurrentMonthData] = useState(null);
  const [lastMonthData, setLastMonthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { token } = useContext(TokenContext);

  // New state for additional stats from API
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCulturalArticles: 0,
    totalHandiCrafts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFollows: 0,
    totalCategories: 0,
    activeUsersToday: 0,
  });
  const [topActiveUsers, setTopActiveUsers] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [popularHandiCrafts, setPopularHandiCrafts] = useState([]);

  // State for Add Admin modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    username: '',
    userId: '', // Changed from email to userId
    role: 'Admin', // Default role
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const adminStatsRes = await fetch(
          "https://ourheritage.runasp.net/api/Statistics/admin",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: '*/*',
            },
          }
        );
        const adminStatsResult = await adminStatsRes.json();

        if (!adminStatsResult.isSucceeded) {
          throw new Error(adminStatsResult.message || 'Failed to fetch admin statistics');
        }

        const { model } = adminStatsResult;

        setStats({
          totalUsers: model.totalUsers,
          totalCulturalArticles: model.totalCulturalArticles,
          totalHandiCrafts: model.totalHandiCrafts,
          totalLikes: model.totalLikes,
          totalComments: model.totalComments,
          totalFollows: model.totalFollows,
          totalCategories: model.totalCategories,
          activeUsersToday: model.activeUsersToday,
        });

        setTotalHandicrafts(model.totalHandiCrafts);
        setTopActiveUsers(model.topActiveUsers);
        setPopularArticles(model.popularArticles);
        setPopularHandiCrafts(model.popularHandiCrafts);

        const filteredMonthlyData = model.monthlyActivity
          .filter(activity => activity.year === selectedYear)
          .map((activity, index) => {
            const monthName = monthNames[index].substring(0, 3);
            return {
              month: monthName,
              monthNumber: index + 1,
              newUsers: activity.newUsers,
              newArticles: activity.newArticles,
              newHandiCrafts: activity.newHandiCrafts,
              totalEngagement: activity.totalLikes + activity.totalComments,
              totalActivity: activity.newUsers + activity.newArticles + activity.newHandiCrafts,
            };
          });

        const chartData = Array.from({ length: 12 }, (_, index) => {
          const month = index + 1;
          const monthName = monthNames[index].substring(0, 3);
          const existingData = filteredMonthlyData.find(data => data.monthNumber === month);
          return existingData || {
            month: monthName,
            monthNumber: month,
            newUsers: 0,
            newArticles: 0,
            newHandiCrafts: 0,
            totalEngagement: 0,
            totalActivity: 0,
          };
        });

        setMonthlyData(chartData);

        const currentMonthRes = await fetch(
          "https://ourheritage.runasp.net/api/Statistics/current-month",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const currentMonthResult = await currentMonthRes.json();
        if (currentMonthResult.isSucceeded) {
          setCurrentMonthData(currentMonthResult.model);
        }

        const lastMonthRes = await fetch(
          "https://ourheritage.runasp.net/api/Statistics/last-month",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const lastMonthResult = await lastMonthRes.json();
        if (lastMonthResult.isSucceeded) {
          setLastMonthData(lastMonthResult.model);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        if (err.message.includes('Failed to fetch')) {
          console.error('Possible CORS or network issue. Check server configuration or token validity.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, token]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
    setFormError('');
    setFormSuccess('');
  };

  // Handle form submission
  const handleAddAdmin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!adminForm.username || !adminForm.userId || !adminForm.role) {
      setFormError('All fields are required.');
      return;
    }

    // Validate userId is a positive integer
    const userId = parseInt(adminForm.userId);
    if (isNaN(userId) || userId <= 0) {
      setFormError('Please enter a valid User ID (positive integer).');
      return;
    }

    try {
      // Step 1: Fetch User by ID
      const userRes = await fetch(
        `https://ourheritage.runasp.net/api/Users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        }
      );

      if (!userRes.ok) {
        const errorText = await userRes.text();
        throw new Error(`Failed to fetch user: ${userRes.status} ${errorText}`);
      }

      const userData = await userRes.json();
      if (!userData || !userData.id) {
        throw new Error('User not found or invalid response.');
      }

      // Step 2: Assign role
      const formData = new FormData();
      formData.append('UserId', userData.id);
      formData.append('RoleName', adminForm.role.toLowerCase()); // Map Admin/SuperAdmin to admin/superadmin

      const response = await fetch('https://ourheritage.runasp.net/api/Auth/assign-role', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
        body: formData,
      });

      if (response.ok) {
        setFormSuccess('Admin role assigned successfully!');
        setAdminForm({
          username: '',
          userId: '',
          role: 'Admin',
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess('');
        }, 2000);
      } else {
        const errorText = await response.text();
        console.error('Error assigning role:', response.status, errorText);
        if (response.status === 401) {
          setFormError('Unauthorized: Invalid or expired token. Please log in again.');
        } else {
          setFormError(`Failed to assign role: ${response.status} ${errorText}`);
        }
      }
    } catch (err) {
      console.error('Error assigning admin role:', err);
      setFormError(`An error occurred: ${err.message}`);
    }
  };

  // Calculate totals from monthly data
  const yearlyTotals = monthlyData.reduce((acc, month) => ({
    totalNewUsers: acc.totalNewUsers + month.newUsers,
    totalNewArticles: acc.totalNewArticles + month.newArticles,
    totalNewHandiCrafts: acc.totalNewHandiCrafts + month.newHandiCrafts,
    totalEngagement: acc.totalEngagement + month.totalEngagement,
  }), { totalNewUsers: 0, totalNewArticles: 0, totalNewHandiCrafts: 0, totalEngagement: 0 });

  return (
    <div className="flex min-h-screen mt-24 style={{ position: 'relative' }}">
      {/* Sidebar */}
    <aside
        className="w-72 bg-[#5e3c23] text-white p-6 space-y-6 fixed top-0 left-0  h-screen overflow-y-auto z-20"
        style={{ position: 'fixed !important', height: '100vh' }}
      >       
       <nav className="space-y-4 mt-24">
          <a href="#" className="flex items-center gap-2 hover:text-[#b08968] text-[#b08968]">📊 Dashboard</a>
         
          <Link to="/allcat" className="flex items-center gap-2 hover:text-[#b08968]">
            📋 Total Categories
          </Link>
          <Link to="/users" className="flex items-center gap-2 hover:text-[#b08968]">
            👥 Users
          </Link>
          <Link to="/top-users" className="flex items-center gap-2 hover:text-[#b08968]">
            👑 Top Users
          </Link>
          <Link to="/Populararticles" className="flex items-center gap-2 hover:text-[#b08968]">
            📰 Popular Articles
          </Link>
          <Link to="/home2" className="flex items-center gap-2 text-[#a44a3f] hover:text-[#8b352d]">🚪 Logout</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#fefaf4] ml-72 overflow-y-auto min-h-screen">
        {/* Year Selection */}
        <div className="mb-6">
          <div className="bg-[#f5eee6] rounded-xl shadow p-4 flex items-center gap-4 border border-[#e0c9b9]">
            <div className="text-[#b08968] text-3xl">📅</div>
            <div className="flex items-center gap-2">
              <label className="text-[#5e3c23] font-medium">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-[#e0c9b9] rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#b08968] bg-white"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
            {loading && <div className="text-[#5e3c23]">Loading...</div>}
          </div>
        </div>

        {/* Add Admin Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#f5eee6] rounded-xl p-6 w-full max-w-md border border-[#e0c9b9]">
              <h3 className="text-lg font-semibold mb-4 text-[#5e3c23] w-[200px]">Assign Admin Role</h3>
              <form onSubmit={handleAddAdmin}>
                <div className="mb-4">
                  <label className="block text-[#5e3c23] mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={adminForm.username}
                    onChange={handleInputChange}
                    className="w-full border border-[#e0c9b9] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08968] bg-white"
                    placeholder="Enter username"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[#5e3c23] mb-2">User ID</label>
                  <input
                    type="number"
                    name="userId"
                    value={adminForm.userId}
                    onChange={handleInputChange}
                    className="w-full border border-[#e0c9b9] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08968] bg-white"
                    placeholder="Enter user ID"
                    min="1"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[#5e3c23] mb-2">Role</label>
                  <select
                    name="role"
                    value={adminForm.role}
                    onChange={handleInputChange}
                    className="w-full border border-[#e0c9b9] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08968] bg-white"
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                   
                  </select>
                </div>
                {formError && <p className="text-[#a44a3f] text-sm mb-4">{formError}</p>}
                {formSuccess && <p className="text-[#52796f] text-sm mb-4">{formSuccess}</p>}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setFormError('');
                      setFormSuccess('');
                    }}
                    className="bg-[#e0c9b9] text-[#5e3c23] px-4 py-2 rounded hover:bg-[#d4b3a0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#b08968] text-white px-4 py-2 rounded hover:bg-[#a7724e]"
                  >
                    Assign Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Current Month vs Last Month Comparison */}
        {currentMonthData && lastMonthData && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-[#5e3c23]">📈 Monthly Comparison</h3>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-[#f5eee6] rounded-xl shadow p-6 border border-[#e0c9b9]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[#b08968] text-3xl">👥</div>
                  <div className={`text-sm px-2 py-1 rounded bg-[#e0c9b9] text-[#5e3c23]`}>
                    {calculatePercentageChange(currentMonthData.newUsers, lastMonthData.newUsers)}%
                  </div>
                </div>
                <h4 className="text-[#6e4c2f] mb-2">New Users</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[#9c6644]">{currentMonthData.newUsers}</p>
                    <p className="text-sm text-[#6e4c2f]">{currentMonthData.monthName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-[#6e4c2f]">{lastMonthData.newUsers}</p>
                    <p className="text-sm text-[#6e4c2f]">{lastMonthData.monthName}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f5eee6] rounded-xl shadow p-6 border border-[#e0c9b9]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[#b08968] text-3xl">📰</div>
                  <div className={`text-sm px-2 py-1 rounded bg-[#e0c9b9] text-[#5e3c23]`}>
                    {calculatePercentageChange(currentMonthData.newArticles, lastMonthData.newArticles)}%
                  </div>
                </div>
                <h4 className="text-[#6e4c2f] mb-2">New Articles</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[#52796f]">{currentMonthData.newArticles}</p>
                    <p className="text-sm text-[#6e4c2f]">{currentMonthData.monthName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-[#6e4c2f]">{lastMonthData.newArticles}</p>
                    <p className="text-sm text-[#6e4c2f]">{lastMonthData.monthName}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f5eee6] rounded-xl shadow p-6 border border-[#e0c9b9]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[#b08968] text-3xl">🎨</div>
                  <div className={`text-sm px-2 py-1 rounded bg-[#e0c9b9] text-[#5e3c23]`}>
                    {calculatePercentageChange(currentMonthData.newHandiCrafts, lastMonthData.newHandiCrafts)}%
                  </div>
                </div>
                <h4 className="text-[#6e4c2f] mb-2">New Handicrafts</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[#a44a3f]">{currentMonthData.newHandiCrafts}</p>
                    <p className="text-sm text-[#6e4c2f]">{currentMonthData.monthName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-[#6e4c2f]">{lastMonthData.newHandiCrafts}</p>
                    <p className="text-sm text-[#6e4c2f]">{lastMonthData.monthName}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f5eee6] rounded-xl shadow p-6 border border-[#e0c9b9]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[#b08968] text-3xl">📈</div>
                  <div className={`text-sm px-2 py-1 rounded bg-[#e0c9b9] text-[#5e3c23]`}>
                    {calculatePercentageChange(currentMonthData.totalEngagement, lastMonthData.totalEngagement)}%
                  </div>
                </div>
                <h4 className="text-[#6e4c2f] mb-2">Total Engagement</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[#b08968]">{currentMonthData.totalEngagement}</p>
                    <p className="text-sm text-[#6e4c2f]">{currentMonthData.monthName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-[#6e4c2f]">{lastMonthData.totalEngagement}</p>
                    <p className="text-sm text-[#6e4c2f]">{lastMonthData.monthName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-[#f5eee6] rounded-xl shadow p-4 flex items-center gap-4 border border-[#e0c9b9]">
            <div className="text-[#b08968] text-3xl">👥</div>
            <div>
              <h4 className="text-[#6e4c2f]">Total Users</h4>
              <p className="text-xl font-bold text-[#9c6644]">{stats.totalUsers}</p>
              <span className="text-sm text-[#b08968]">All time</span>
            </div>
          </div>

          <div className="bg-[#f5eee6] rounded-xl shadow p-4 flex items-center gap-4 border border-[#e0c9b9]">
            <div className="text-[#b08968] text-3xl">📰</div>
            <div>
              <h4 className="text-[#6e4c2f]">Total Articles</h4>
              <p className="text-xl font-bold text-[#52796f]">{stats.totalCulturalArticles}</p>
              <span className="text-sm text-[#b08968]">All time</span>
            </div>
          </div>

          <div className="bg-[#f5eee6] rounded-xl shadow p-4 flex items-center gap-4 border border-[#e0c9b9]">
            <div className="text-[#b08968] text-3xl">📦</div>
            <div>
              <h4 className="text-[#6e4c2f]">Total Handicrafts</h4>
              <p className="text-xl font-bold text-[#a44a3f]">{stats.totalHandiCrafts}</p>
              <span className="text-sm text-[#b08968]">All time</span>
            </div>
          </div>

          <div className="bg-[#f5eee6] rounded-xl shadow p-4 flex items-center gap-4 border border-[#e0c9b9]">
            <div className="text-[#b08968] text-3xl">📈</div>
            <div>
              <h4 className="text-[#6e4c2f]">Total Engagement ({selectedYear})</h4>
              <p className="text-xl font-bold text-[#b08968]">{yearlyTotals.totalEngagement}</p>
              <span className="text-sm text-[#b08968]">Total for year</span>
            </div>
          </div>

          <div className="bg-[#f5eee6] rounded-xl shadow p-4 flex items-center gap-4 border border-[#e0c9b9]">
            <div className="text-[#b08968] text-3xl">❤️</div>
            <div>
              <h4 className="text-[#6e4c2f]">Total Likes</h4>
              <p className="text-xl font-bold text-[#9c6644]">{stats.totalLikes}</p>
              <span className="text-sm text-[#b08968]">All time</span>
            </div>
          </div>

          <div className="bg-[#f5eee6] rounded-xl shadow p-4 flex items-center gap-4 border border-[#e0c9b9]">
            <div className="text-[#b08968] text-3xl">💬</div>
            <div>
              <h4 className="text-[#6e4c2f]">Total Comments</h4>
              <p className="text-xl font-bold text-[#52796f]">{stats.totalComments}</p>
              <span className="text-sm text-[#b08968]">All time</span>
            </div>
          </div>

          <div className="bg-[#f5eee6] rounded-xl shadow p-4 flex items-center gap-4 border border-[#e0c9b9]">
            <div className="text-[#b08968] text-3xl">👤➕</div>
            <div>
              <h4 className="text-[#6e4c2f]">Total Follows</h4>
              <p className="text-xl font-bold text-[#a44a3f]">{stats.totalFollows}</p>
              <span className="text-sm text-[#b08968]">All time</span>
            </div>
          </div>

          <div className="bg-[#f5eee6] rounded-xl shadow p-4 flex items-center gap-4 border border-[#e0c9b9]">
            <div className="text-[#b08968] text-3xl">📂</div>
            <div>
              <h4 className="text-[#6e4c2f]">Total Categories</h4>
              <p className="text-xl font-bold text-[#9c6644]">{stats.totalCategories}</p>
              <span className="text-sm text-[#b08968]">All time</span>
            </div>
          </div>

          <div className="bg-[#f5eee6] rounded-xl shadow p-4 flex items-center gap-4 border border-[#e0c9b9]">
            <div className="text-[#b08968] text-3xl">👀</div>
            <div>
              <h4 className="text-[#6e4c2f]">Active Users Today</h4>
              <p className="text-xl font-bold text-[#52796f]">{stats.activeUsersToday}</p>
              <span className="text-sm text-[#b08968]">Today</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
          <div className="bg-[#f5eee6] p-6 rounded-xl shadow border border-[#e0c9b9]">
            <h3 className="text-lg font-semibold mb-4 text-[#5e3c23]">Monthly Activity Overview ({selectedYear})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#5e3c23" />
                <YAxis stroke="#5e3c23" />
                <Tooltip
                  formatter={(value, name) => [value, name.replace(/([A-Z])/g, ' $1').trim()]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ backgroundColor: '#f5eee6', borderColor: '#e0c9b9' }}
                />
                <Bar dataKey="newUsers" fill="#b08968" name="New Users" barSize={35} radius={[4, 4, 0, 0]} />
                <Bar dataKey="newArticles" fill="#9c6644" name="New Articles" barSize={35} radius={[4, 4, 0, 0]} />
                <Bar dataKey="newHandiCrafts" fill="#a44a3f" name="New Handicrafts" barSize={35} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#f5eee6] p-6 rounded-xl shadow border border-[#e0c9b9]">
            <h3 className="text-lg font-semibold mb-4 text-[#5e3c23]">Engagement Trend ({selectedYear})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#5e3c23" />
                <YAxis stroke="#5e3c23" />
                <Tooltip contentStyle={{ backgroundColor: '#f5eee6', borderColor: '#e0c9b9' }} />
                <Line
                  type="monotone"
                  dataKey="totalEngagement"
                  stroke="#b08968"
                  strokeWidth={3}
                  dot={{ fill: '#b08968', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Data Table */}
        <div className="bg-[#f5eee6] rounded-xl shadow p-6 mb-8 border border-[#e0c9b9]">
          <h3 className="text-lg font-semibold mb-4 text-[#5e3c23]">Monthly Statistics ({selectedYear})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e0c9b9]">
                  <th className="text-left p-2 text-[#5e3c23]">Month</th>
                  <th className="text-left p-2 text-[#5e3c23]">New Users</th>
                  <th className="text-left p-2 text-[#5e3c23]">New Articles</th>
                  <th className="text-left p-2 text-[#5e3c23]">New Handicrafts</th>
                  <th className="text-left p-2 text-[#5e3c23]">Total Engagement</th>
                  <th className="text-left p-2 text-[#5e3c23]">Activity Score</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, index) => (
                  <tr key={index} className="border-b border-[#e0c9b9] hover:bg-[#e0c9b9]">
                    <td className="p-2 font-medium text-[#5e3c23]">{monthNames[index]}</td>
                    <td className="p-2 text-[#9c6644]">{month.newUsers}</td>
                    <td className="p-2 text-[#52796f]">{month.newArticles}</td>
                    <td className="p-2 text-[#a44a3f]">{month.newHandiCrafts}</td>
                    <td className="p-2 text-[#b08968]">{month.totalEngagement}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        month.totalActivity > 0 ? 'bg-[#b08968] text-white' : 'bg-[#e0c9b9] text-[#5e3c23]'
                      }`}>
                        {month.totalActivity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Cards and Other Sections */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-[#f5eee6] rounded-xl shadow p-6 flex items-center justify-between border border-[#e0c9b9]">
            <div className="flex items-center gap-4">
              <div className="text-[#b08968] text-4xl">➕</div>
              <div>
                <h4 className="text-lg font-semibold text-[#5e3c23] w-[200px]">Assign Admin Role</h4>
                <p className="text-sm text-[#6e4c2f]">Assign roles to existing users</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#b08968] hover:bg-[#a7724e] text-white px-4 py-2 rounded"
            >
              Assign Role
            </button>
          </div>


          <div className="bg-[#f5eee6] rounded-xl shadow p-6 flex items-center justify-between border border-[#e0c9b9]">
            <div className="flex items-center gap-4">
              <div className="text-[#b08968] text-4xl">📦</div>
              <div>
                <h4 className="text-lg font-semibold text-[#5e3c23]">Total Handicrafts</h4>
                <p className="text-xl font-bold text-[#a44a3f]">{totalHandicrafts}</p>
              </div>
            </div>
          </div>


          <div className="bg-[#f5eee6] p-4 rounded-xl shadow border border-[#e0c9b9]">
            <h3 className="text-lg font-semibold mb-4 text-[#5e3c23]">Top Active Users</h3>
            <ul className="space-y-2">
              {topActiveUsers.map((user, index) => (
                <li key={user.userId} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-[#b08968]">👑</span>
                    <span className="text-[#5e3c23]">{user.userName}</span>
                  </span>
                  <span className="text-[#6e4c2f]">Score: {user.activityScore}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#f5eee6] p-4 rounded-xl shadow border border-[#e0c9b9]">
            <h3 className="text-lg font-semibold mb-4 text-[#5e3c23]">Popular Articles</h3>
            <ul className="space-y-2">
              {popularArticles.map((article, index) => (
                <li key={article.id} className="flex justify-between text-sm">
                  <span className="text-[#5e3c23]">{article.title}</span>
                  <span className="text-[#6e4c2f]">Likes: {article.likeCount}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#f5eee6] p-4 rounded-xl shadow border border-[#e0c9b9]">
            <h3 className="text-lg font-semibold mb-4 text-[#5e3c23]">Popular Handicrafts</h3>
            <ul className="space-y-2">
              {popularHandiCrafts.map((craft, index) => (
                <li key={craft.id} className="flex justify-between text-sm">
                  <span className="text-[#5e3c23]">{craft.title}</span>
                  <span className="text-[#6e4c2f]">Favorites: {craft.favoriteCount}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#f5eee6] p-4 rounded-xl shadow flex items-center justify-center border border-[#e0c9b9]">
            <Link
              to="/summary"
              className="bg-[#b08968] text-white px-4 py-2 rounded hover:bg-[#a7724e] transition-colors"
            >
              View All Reports
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}