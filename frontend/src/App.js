import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { useToast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";
import { Building2, Users, Package, FileBarChart, Download, LogOut, Plus, Search, TrendingUp, MapPin, Calendar, DollarSign } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post(`${API}/auth/register`, userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Components
const FloatingActionButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-modern-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-50 ${className}`}
  >
    {children}
  </button>
);

const NotificationBadge = ({ count, className = "" }) => (
  count > 0 && (
    <div className={`absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse ${className}`}>
      {count > 99 ? '99+' : count}
    </div>
  )
);

const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };
  
  return (
    <div className={`spinner ${sizeClasses[size]} ${className}`}></div>
  );
};

const EmptyState = ({ icon: Icon, title, description, action, className = "" }) => (
  <div className={`text-center py-12 ${className}`}>
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4 max-w-sm mx-auto">{description}</p>
    {action}
  </div>
);

const Header = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleDownloadProject = async () => {
    try {
      const response = await axios.get(`${API}/download/project`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'coal-ash-marketplace.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Project downloaded successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Download failed",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="glass border-b sticky top-0 z-50 shadow-modern">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Building2 className="h-10 w-10 text-blue-600" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">AshLink</h1>
              <p className="text-xs text-gray-500">Coal Ash Marketplace</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.contact_person}</p>
                    <p className="text-xs text-gray-500">{user.company}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="capitalize px-3 py-1 font-medium border-2"
                    style={{
                      borderColor: user.role === 'admin' ? '#ef4444' : 
                                   user.role === 'supplier' ? '#10b981' : 
                                   user.role === 'buyer' ? '#3b82f6' : '#6b7280',
                      color: user.role === 'admin' ? '#ef4444' : 
                             user.role === 'supplier' ? '#10b981' : 
                             user.role === 'buyer' ? '#3b82f6' : '#6b7280'
                    }}
                  >
                    {user.role}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  {user.role === 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadProject}
                      className="btn-animate flex items-center space-x-2 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="btn-animate flex items-center space-x-2 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company: '',
    contact_person: '',
    phone: '',
    role: '',
    address: '',
    city: '',
    state: ''
  });
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast({
            title: "Welcome back! 🎉",
            description: "Logged in successfully!",
            className: "success-checkmark"
          });
        } else {
          toast({
            title: "Login Failed",
            description: result.error,
            variant: "destructive"
          });
        }
      } else {
        const result = await register(formData);
        if (result.success) {
          toast({
            title: "Account Created! 🎉",
            description: "Registration successful! Please login.",
            className: "success-checkmark"
          });
          setIsLogin(true);
          setFormData({...formData, password: ''});
        } else {
          toast({
            title: "Registration Failed",
            description: result.error,
            variant: "destructive"
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
      </div>
      
      <Card className="w-full max-w-md glass shadow-modern-lg fade-in relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Building2 className="h-16 w-16 text-blue-600" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold gradient-text mb-2">
            AshLink Marketplace
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {isLogin ? '👋 Welcome back!' : '🚀 Join our marketplace'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <Label htmlFor="email" className="form-label">
                📧 Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="password" className="form-label">
                🔒 Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            {!isLogin && (
              <div className="space-y-5 fade-in">
                <div className="form-group">
                  <Label htmlFor="company" className="form-label">
                    🏢 Company Name
                  </Label>
                  <Input
                    id="company"
                    placeholder="Your Company Ltd."
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <Label htmlFor="contact_person" className="form-label">
                    👤 Contact Person
                  </Label>
                  <Input
                    id="contact_person"
                    placeholder="John Doe"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <Label htmlFor="phone" className="form-label">
                    📱 Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <Label htmlFor="role" className="form-label">
                    🎯 Your Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier">🏭 Supplier</SelectItem>
                      <SelectItem value="buyer">🛒 Buyer</SelectItem>
                      <SelectItem value="logistics">🚛 Logistics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-group">
                  <Label htmlFor="address" className="form-label">
                    📍 Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Business St"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <Label htmlFor="city" className="form-label">
                      🏙️ City
                    </Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="state" className="form-label">
                      🗺️ State
                    </Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full btn-animate bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                <>
                  {isLogin ? '🚀 Sign In' : '✨ Create Account'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="text-center pt-4">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-base hover:text-blue-600"
          >
            {isLogin ? "New here? Create an account 🆕" : "Already have an account? Sign in 👈"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [demands, setDemands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
    fetchProducts();
    fetchDemands();
    fetchOrders();
    fetchSuggestions();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchDemands = async () => {
    try {
      const response = await axios.get(`${API}/demands`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDemands(response.data);
    } catch (error) {
      console.error('Error fetching demands:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${API}/matching/suggestions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, trend, trendValue }) => (
    <Card className="stats-card card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="relative">
          <Icon className="h-5 w-5 text-gray-400" />
          {trend && (
            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
              trend === 'up' ? 'bg-green-500' : trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="stats-number">{value}</div>
        <div className="flex items-center justify-between">
          <p className="stats-label">{description}</p>
          {trendValue && (
            <div className={`flex items-center text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="dashboard-container fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.contact_person} 👋
            </h2>
            <p className="text-lg text-gray-600">
              Here's what's happening with your coal ash marketplace
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === 'admin' && (
            <>
              <StatCard
                title="Total Users"
                value={analytics.total_users}
                icon={Users}
                description="Registered users"
                trend="up"
                trendValue="+12%"
              />
              <StatCard
                title="Active Products"
                value={analytics.total_products}
                icon={Package}
                description="Listed products"
                trend="up"
                trendValue="+8%"
              />
              <StatCard
                title="Total Orders"
                value={analytics.total_orders}
                icon={FileBarChart}
                description="All orders"
                trend="stable"
                trendValue="0%"
              />
              <StatCard
                title="Active Demands"
                value={analytics.total_demands}
                icon={TrendingUp}
                description="Buyer requests"
                trend="up"
                trendValue="+15%"
              />
            </>
          )}
          
          {user?.role === 'supplier' && (
            <>
              <StatCard
                title="My Products"
                value={analytics.my_products}
                icon={Package}
                description="Listed products"
                trend="up"
                trendValue="+3"
              />
              <StatCard
                title="My Orders"
                value={analytics.my_orders}
                icon={FileBarChart}
                description="Received orders"
                trend="up"
                trendValue="+5"
              />
              <StatCard
                title="Total Revenue"
                value={`₹${analytics.total_revenue?.toLocaleString() || 0}`}
                icon={DollarSign}
                description="Total earnings"
                trend="up"
                trendValue="+₹2.5L"
              />
              <StatCard
                title="Success Rate"
                value="94%"
                icon={TrendingUp}
                description="Order completion"
                trend="up"
                trendValue="+2%"
              />
            </>
          )}
          
          {user?.role === 'buyer' && (
            <>
              <StatCard
                title="My Demands"
                value={analytics.my_demands}
                icon={TrendingUp}
                description="Posted demands"
                trend="stable"
                trendValue="0"
              />
              <StatCard
                title="My Orders"
                value={analytics.my_orders}
                icon={FileBarChart}
                description="Placed orders"
                trend="up"
                trendValue="+2"
              />
              <StatCard
                title="Total Spent"
                value={`₹${analytics.total_spent?.toLocaleString() || 0}`}
                icon={DollarSign}
                description="Total purchases"
                trend="up"
                trendValue="+₹1.8L"
              />
              <StatCard
                title="Avg. Savings"
                value="18%"
                icon={TrendingUp}
                description="Below market rate"
                trend="up"
                trendValue="+3%"
              />
            </>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="marketplace" className="space-y-6">
        <div className="glass rounded-lg p-2 shadow-modern">
          <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
            <TabsTrigger 
              value="marketplace" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Marketplace</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="my-items"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>My Items</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <div className="flex items-center space-x-2">
                <FileBarChart className="h-4 w-4" />
                <span>Orders</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="matching"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Matching</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="marketplace" className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">🏪 Marketplace</h3>
              <p className="text-gray-600">Discover coal ash products from verified suppliers</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search products, location..." 
                  className="pl-10 w-full sm:w-64" 
                />
              </div>
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fly_ash">Fly Ash</SelectItem>
                  <SelectItem value="bottom_ash">Bottom Ash</SelectItem>
                  <SelectItem value="pond_ash">Pond Ash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <Card key={product.id} className="product-card">
                <div className="product-image relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Package className="h-16 w-16 text-white opacity-80" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge 
                      variant="secondary" 
                      className="bg-white/90 text-gray-800 capitalize font-medium"
                    >
                      {product.ash_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 rounded-full p-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="product-content">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="product-title">{product.title}</h4>
                    <Button variant="ghost" size="sm" className="p-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </Button>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">📦 Quantity:</span>
                      <span className="font-semibold text-gray-900">{product.quantity_available} tons</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">💰 Price:</span>
                      <span className="product-price">₹{product.price_per_ton}/ton</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{product.city}, {product.state}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    {user?.role === 'buyer' ? (
                      <CreateOrderDialog product={product} onOrderCreated={fetchOrders} />
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-items" className="space-y-6">
          {user?.role === 'supplier' && <SupplierItems onItemsChanged={fetchProducts} />}
          {user?.role === 'buyer' && <BuyerItems onItemsChanged={fetchDemands} />}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">📋 My Orders</h3>
              <p className="text-gray-600">Track and manage your orders</p>
            </div>
            <div className="flex space-x-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            {orders.map((order, index) => (
              <Card key={order.id} className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileBarChart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}...</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={`capitalize px-3 py-1 font-medium ${
                        order.status === 'pending' ? 'status-pending' :
                        order.status === 'confirmed' ? 'status-confirmed' :
                        order.status === 'in_transit' ? 'status-in-transit' :
                        order.status === 'delivered' ? 'status-delivered' :
                        'status-cancelled'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">📦 Quantity</p>
                      <p className="font-semibold text-gray-900">{order.quantity} tons</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">💰 Total Amount</p>
                      <p className="font-semibold text-blue-600">₹{order.total_amount.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">📍 Delivery</p>
                      <p className="font-medium text-gray-900">{order.delivery_address.slice(0, 20)}...</p>
                    </div>
                    <div className="flex justify-end items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Progress */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${order.status !== 'cancelled' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${order.status === 'confirmed' || order.status === 'in_transit' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${order.status === 'in_transit' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Placed</span>
                      <span>Confirmed</span>
                      <span>In Transit</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {orders.length === 0 && (
            <div className="text-center py-12">
              <FileBarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start by browsing the marketplace to place your first order.</p>
              <Button>Browse Products</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">🎯 Smart Matching</h3>
            <p className="text-gray-600">AI-powered suggestions to connect supply with demand</p>
          </div>
          
          <div className="space-y-6">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500 card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">🎯</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">Perfect Match Found!</h4>
                        <p className="text-sm text-gray-600">High compatibility score</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        96% Match
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    {suggestion.demand && (
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Your Demand Request</p>
                          <p className="text-sm text-gray-600">
                            {suggestion.demand.title} ({suggestion.demand.quantity_required} tons)
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {suggestion.product && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Your Product</p>
                          <p className="text-sm text-gray-600">
                            {suggestion.product.title} ({suggestion.product.quantity_available} tons)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-green-600">
                        ✨ {suggestion.matching_products?.length || suggestion.matching_demands?.length} matching opportunities
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        Connect Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {suggestions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found yet</h3>
              <p className="text-gray-600 mb-4">
                {user?.role === 'supplier' ? 
                  'Add more products to get better matching opportunities with buyer demands.' :
                  'Post more demand requests to get matched with available products.'
                }
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {user?.role === 'supplier' ? 'Add Product' : 'Post Demand'}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Additional Components
const SupplierItems = ({ onItemsChanged }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [myProducts, setMyProducts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const response = await axios.get(`${API}/products/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyProducts(response.data);
    } catch (error) {
      console.error('Error fetching my products:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold">My Products</h3>
        <CreateProductDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onProductCreated={() => {
            fetchMyProducts();
            onItemsChanged();
          }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="text-lg">{product.title}</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className="capitalize">
                  {product.ash_type.replace('_', ' ')}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available:</span>
                  <span className="font-medium">{product.quantity_available} tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="font-medium">₹{product.price_per_ton}/ton</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {product.city}, {product.state}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const BuyerItems = ({ onItemsChanged }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [myDemands, setMyDemands] = useState([]);

  useEffect(() => {
    fetchMyDemands();
  }, []);

  const fetchMyDemands = async () => {
    try {
      const response = await axios.get(`${API}/demands/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyDemands(response.data);
    } catch (error) {
      console.error('Error fetching my demands:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold">My Demand Requests</h3>
        <CreateDemandDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onDemandCreated={() => {
            fetchMyDemands();
            onItemsChanged();
          }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myDemands.map((demand) => (
          <Card key={demand.id}>
            <CardHeader>
              <CardTitle className="text-lg">{demand.title}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="capitalize">
                  {demand.ash_type.replace('_', ' ')}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Required:</span>
                  <span className="font-medium">{demand.quantity_required} tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Max Price:</span>
                  <span className="font-medium">₹{demand.max_price_per_ton}/ton</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(demand.required_by).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CreateProductDialog = ({ open, onOpenChange, onProductCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    ash_type: '',
    quantity_available: '',
    price_per_ton: '',
    location: '',
    city: '',
    state: '',
    quality_specs: {},
    description: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/products`, {
        ...formData,
        quantity_available: parseInt(formData.quantity_available),
        price_per_ton: parseFloat(formData.price_per_ton)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast({
        title: "Success",
        description: "Product created successfully!"
      });
      
      onProductCreated();
      onOpenChange(false);
      setFormData({
        title: '',
        ash_type: '',
        quantity_available: '',
        price_per_ton: '',
        location: '',
        city: '',
        state: '',
        quality_specs: {},
        description: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create product",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            List your coal ash product for buyers to discover
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="ash_type">Ash Type</Label>
              <Select value={formData.ash_type} onValueChange={(value) => setFormData({...formData, ash_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ash type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fly_ash">Fly Ash</SelectItem>
                  <SelectItem value="bottom_ash">Bottom Ash</SelectItem>
                  <SelectItem value="pond_ash">Pond Ash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity (tons)</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity_available}
                onChange={(e) => setFormData({...formData, quantity_available: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price per ton (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price_per_ton}
                onChange={(e) => setFormData({...formData, price_per_ton: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CreateDemandDialog = ({ open, onOpenChange, onDemandCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    ash_type: '',
    quantity_required: '',
    max_price_per_ton: '',
    delivery_location: '',
    delivery_city: '',
    delivery_state: '',
    required_by: '',
    quality_requirements: {},
    description: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/demands`, {
        ...formData,
        quantity_required: parseInt(formData.quantity_required),
        max_price_per_ton: parseFloat(formData.max_price_per_ton),
        required_by: new Date(formData.required_by).toISOString()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast({
        title: "Success",
        description: "Demand request created successfully!"
      });
      
      onDemandCreated();
      onOpenChange(false);
      setFormData({
        title: '',
        ash_type: '',
        quantity_required: '',
        max_price_per_ton: '',
        delivery_location: '',
        delivery_city: '',
        delivery_state: '',
        required_by: '',
        quality_requirements: {},
        description: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create demand",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Demand
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Demand Request</DialogTitle>
          <DialogDescription>
            Post your coal ash requirements for suppliers to see
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Request Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="ash_type">Ash Type</Label>
              <Select value={formData.ash_type} onValueChange={(value) => setFormData({...formData, ash_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ash type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fly_ash">Fly Ash</SelectItem>
                  <SelectItem value="bottom_ash">Bottom Ash</SelectItem>
                  <SelectItem value="pond_ash">Pond Ash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity Required (tons)</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity_required}
                onChange={(e) => setFormData({...formData, quantity_required: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="max_price">Max Price per ton (₹)</Label>
              <Input
                id="max_price"
                type="number"
                step="0.01"
                value={formData.max_price_per_ton}
                onChange={(e) => setFormData({...formData, max_price_per_ton: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="required_by">Required By</Label>
              <Input
                id="required_by"
                type="date"
                value={formData.required_by}
                onChange={(e) => setFormData({...formData, required_by: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="delivery_location">Delivery Location</Label>
              <Input
                id="delivery_location"
                value={formData.delivery_location}
                onChange={(e) => setFormData({...formData, delivery_location: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="delivery_city">Delivery City</Label>
              <Input
                id="delivery_city"
                value={formData.delivery_city}
                onChange={(e) => setFormData({...formData, delivery_city: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="delivery_state">Delivery State</Label>
              <Input
                id="delivery_state"
                value={formData.delivery_state}
                onChange={(e) => setFormData({...formData, delivery_state: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Demand</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CreateOrderDialog = ({ product, onOrderCreated }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    delivery_address: '',
    contract_terms: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post(`${API}/orders`, {
        product_id: product.id,
        quantity: parseInt(formData.quantity),
        delivery_address: formData.delivery_address,
        contract_terms: formData.contract_terms
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast({
        title: "Order Placed Successfully! 🎉",
        description: "Your order has been submitted to the supplier.",
        className: "success-checkmark"
      });
      
      onOrderCreated();
      setIsOpen(false);
      setFormData({
        quantity: '',
        delivery_address: '',
        contract_terms: ''
      });
    } catch (error) {
      toast({
        title: "Order Failed",
        description: error.response?.data?.detail || "Failed to create order",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = formData.quantity ? formData.quantity * product.price_per_ton : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full btn-animate bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium">
          🛒 Place Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <span>Place Order</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <p className="font-medium text-gray-900">{product.title}</p>
              <p className="text-sm text-gray-600">₹{product.price_per_ton}/ton</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <Label htmlFor="quantity" className="form-label">
              📦 Quantity (max: {product.quantity_available} tons)
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={product.quantity_available}
              placeholder="Enter quantity..."
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <Label htmlFor="delivery_address" className="form-label">
              📍 Delivery Address
            </Label>
            <Textarea
              id="delivery_address"
              placeholder="Enter complete delivery address..."
              value={formData.delivery_address}
              onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
              className="form-input min-h-[80px]"
              required
            />
          </div>
          
          <div className="form-group">
            <Label htmlFor="contract_terms" className="form-label">
              📋 Contract Terms (Optional)
            </Label>
            <Textarea
              id="contract_terms"
              placeholder="Any special terms or conditions..."
              value={formData.contract_terms}
              onChange={(e) => setFormData({...formData, contract_terms: e.target.value})}
              className="form-input min-h-[60px]"
            />
          </div>
          
          {formData.quantity && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">💰 Order Summary</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{formData.quantity} tons</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per ton:</span>
                  <span className="font-medium">₹{product.price_per_ton.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-blue-600 text-lg">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner"></div>
                  <span>Placing...</span>
                </div>
              ) : (
                '🚀 Confirm Order'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <BrowserRouter>
          <AuthContent />
          <Toaster />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

const AuthContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative mb-8">
            <Building2 className="h-16 w-16 text-blue-600 mx-auto animate-pulse" />
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full animate-bounce"></div>
          </div>
          <div className="space-y-3">
            <LoadingSpinner size="lg" className="mx-auto" />
            <h3 className="text-xl font-semibold text-gray-900">Loading AshLink</h3>
            <p className="text-gray-600">Preparing your marketplace experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {user && <Header />}
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />
      </Routes>
      {user && <Footer />}
    </>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-white mt-auto">
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-400" />
            <h3 className="text-xl font-bold">AshLink</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Connecting the coal ash ecosystem for sustainable construction solutions.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Marketplace</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Browse Products</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Post Demands</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Smart Matching</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
        <p>&copy; 2025 AshLink Marketplace. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default App;