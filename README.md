# 🏭 AshLink - Coal Ash Marketplace

A modern, full-stack marketplace platform connecting coal ash suppliers with buyers, built with React and FastAPI.

![AshLink Logo](https://via.placeholder.com/800x200/667eea/ffffff?text=AshLink%20Coal%20Ash%20Marketplace)

## 🌟 Features

### 🎯 Core Functionality

- **Multi-role System**: Suppliers, Buyers, Logistics, and Admin roles
- **Product Marketplace**: Browse and list coal ash products
- **Demand Management**: Post and manage demand requests
- **Smart Matching**: AI-powered matching between supply and demand
- **Order Management**: Complete order lifecycle tracking
- **User Authentication**: Secure JWT-based authentication

### 🎨 Modern UI/UX

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Glass Morphism**: Modern glass effects and smooth animations
- **Interactive Dashboard**: Real-time analytics and insights
- **Professional Theme**: Blue-purple gradient design with consistent branding
- **Enhanced Accessibility**: Keyboard navigation and screen reader support

### 📊 Analytics & Insights

- **Role-based Dashboards**: Customized views for different user types
- **Real-time Statistics**: Live data updates and trend indicators
- **Order Tracking**: Visual progress tracking with timeline
- **Performance Metrics**: Revenue, savings, and success rate tracking

## 🛠️ Tech Stack

### Frontend

- **React 19.0.0** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

### Backend

- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with Motor async driver
- **JWT Authentication** - Secure token-based auth
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server
- **Bcrypt** - Password hashing
- **CORS Middleware** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **MongoDB** (local or cloud instance)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/hadwaniravi009/coal_ash_marketplace.git
   cd coal_ash_marketplace
   ```

2. **Setup Backend**

   ```bash
   cd backend
   pip install -r requirements.txt

   # Create .env file
   cp .env.example .env
   # Edit .env with your MongoDB connection string and secrets

   # Start the backend server
   python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Setup Frontend**

   ```bash
   cd frontend
   npm install --legacy-peer-deps

   # Create .env file
   echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env
   echo "WDS_SOCKET_PORT=3000" >> .env

   # Start the frontend server
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
coal_ash_marketplace/
├── backend/                 # FastAPI backend
│   ├── server.py           # Main application file
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── create_admin.py    # Admin user creation script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.js         # Main application component
│   │   ├── App.css        # Global styles
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   ├── public/            # Static assets
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # Tailwind configuration
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
MONGO_URL="your_mongodb_connection_string"
DB_NAME="coal_ash_marketplace"
JWT_SECRET_KEY="your_secret_key"
CORS_ORIGINS="*"
```

### Frontend Environment Variables (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=3000
```

## 👥 User Roles

### 🏭 Suppliers

- List coal ash products
- Manage inventory
- Receive and process orders
- View revenue analytics

### 🛒 Buyers

- Browse marketplace
- Post demand requests
- Place orders
- Track order status

### 🚛 Logistics

- Manage transportation
- Update delivery status
- Coordinate between suppliers and buyers

### 👨‍💼 Admin

- System oversight
- User management
- Platform analytics
- Download project files

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/my` - Get user's products

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders/my` - Get user's orders

### Analytics

- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/matching/suggestions` - Get smart matches

## 🎨 UI Components

The application features a modern, professional design with:

- **Glass Morphism Effects**: Translucent elements with backdrop blur
- **Gradient Themes**: Blue-purple color scheme throughout
- **Smooth Animations**: CSS transitions and keyframe animations
- **Interactive Elements**: Hover effects and micro-interactions
- **Responsive Grid**: Adaptive layouts for all screen sizes
- **Professional Typography**: Inter font family with proper weights

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **CORS Protection**: Configured cross-origin resource sharing
- **Input Validation**: Pydantic models for API validation
- **Environment Variables**: Sensitive data stored securely

## 📱 Browser Support

- **Chrome** (recommended)
- **Firefox**
- **Safari**
- **Edge**
- **Mobile browsers**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Ravi Hadwani**

- GitHub: [@hadwaniravi009](https://github.com/hadwaniravi009)
- Email: hadwaniravi009@gmail.com

## 🙏 Acknowledgments

- FastAPI for the excellent backend framework
- React team for the frontend library
- Tailwind CSS for the utility-first CSS framework
- Radix UI for the headless components
- MongoDB for the database solution

---

**Built with ❤️ for sustainable construction and environmental solutions**
