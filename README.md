# 💰 ExpenseFlow - Advanced Expense Tracking App

<div align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.79.1-blue.svg" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-53.0.0-black.svg" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-11.10.0-orange.svg" alt="Firebase" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</div>

## 🚀 Overview

**ExpenseFlow** is a comprehensive, production-ready expense tracking application built with React Native and Expo. It features advanced social capabilities, intelligent insights, and a beautiful Instagram-inspired UI design. Perfect for individuals and groups who want to manage their finances efficiently.

## ✨ Key Features

### 📊 **Core Expense Management**
- ✅ **Add/Edit/Delete Expenses** - Complete CRUD operations with rich metadata
- ✅ **Expense Categories** - 20+ predefined categories with custom category support
- ✅ **Multi-Currency Support** - 12 major currencies with automatic conversion
- ✅ **Receipt Scanning** - Camera integration with OCR processing (mobile only)
- ✅ **Tags System** - Flexible tagging for better organization
- ✅ **Recurring Expenses** - Daily, weekly, monthly, yearly recurring transactions
- ✅ **Bulk Operations** - Select multiple expenses for batch operations
- ✅ **Advanced Search** - Multi-criteria filtering with saved filter presets
- ✅ **Expense Templates** - Reusable templates for common expenses

### 💰 **Income Tracking**
- ✅ **Income Management** - Track multiple income sources
- ✅ **Income Categories** - 13 predefined income categories
- ✅ **Recurring Income** - Set up recurring income streams
- ✅ **Income vs Expense Analysis** - Compare earnings vs spending

### 🎯 **Budget Management**
- ✅ **Budget Creation** - Set budgets by category and time period
- ✅ **Budget Tracking** - Real-time budget vs actual spending
- ✅ **Budget Alerts** - Notifications for budget thresholds
- ✅ **Budget Performance** - Visual progress indicators
- ✅ **Multiple Periods** - Weekly, monthly, quarterly, yearly budgets
- ✅ **Budget Rollover** - Carry unused budget to next period

### 👥 **Social Features**
- ✅ **Friend Management** - Add friends via email with request system
- ✅ **Group Expenses** - Create groups for shared expense management
- ✅ **Expense Splitting** - Split bills equally, by amount, or percentage
- ✅ **Debt Tracking** - Track who owes what to whom with net balances
- ✅ **Payment Requests** - Send payment reminders with custom messages
- ✅ **Social Activity Feed** - Real-time updates on friend activities
- ✅ **Group Management** - Add/remove members, manage group settings

### 📈 **Reports & Analytics**
- ✅ **Interactive Charts** - Pie charts, bar charts, trend analysis
- ✅ **Spending Insights** - AI-powered spending pattern analysis
- ✅ **Category Breakdown** - Detailed spending by category
- ✅ **Monthly Trends** - 6-month spending and income trends
- ✅ **Budget Performance** - Visual budget vs actual comparisons
- ✅ **Custom Date Ranges** - Flexible reporting periods
- ✅ **Data Export** - Export to CSV, PDF, JSON formats

### 🔔 **Smart Notifications**
- ✅ **Budget Alerts** - Threshold and exceeded notifications
- ✅ **Spending Insights** - AI-generated recommendations
- ✅ **Payment Reminders** - Automated payment due notifications
- ✅ **Achievement Badges** - Gamification for financial goals

### ⚙️ **Settings & Preferences**
- ✅ **Dark/Light Theme** - Beautiful theme switching
- ✅ **Currency Settings** - Default currency preferences
- ✅ **Notification Preferences** - Granular notification controls
- ✅ **Data Backup** - Automatic cloud backup
- ✅ **Account Management** - Profile settings and security
- ✅ **Data Export/Import** - Complete data portability

## 🎨 Design System

### **Instagram-Inspired UI**
- **Modern Gradient Design** - Beautiful color gradients throughout
- **Card-Based Layout** - Clean, organized information architecture
- **Smooth Animations** - Micro-interactions and transitions
- **Responsive Design** - Works perfectly on all screen sizes
- **Accessibility** - WCAG compliant with proper contrast ratios

### **Color Palette**
```typescript
Light Theme:
- Primary: #10B981 (Emerald)
- Secondary: #3B82F6 (Blue)
- Accent: #8B5CF6 (Purple)
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)

Dark Theme:
- Automatically adapts with proper contrast
- Maintains brand consistency
```

## 🏗️ Technical Architecture

### **Frontend Stack**
- **React Native 0.79.1** - Latest stable version
- **Expo 53.0.0** - Managed workflow for rapid development
- **TypeScript 5.8.3** - Full type safety
- **Expo Router 5.0.2** - File-based navigation
- **React Native Reanimated** - Smooth animations
- **Lucide React Native** - Beautiful icon system

### **Backend & Database**
- **Firebase Authentication** - Secure user management
- **Cloud Firestore** - Real-time NoSQL database
- **Firebase Storage** - Receipt and file storage
- **Real-time Subscriptions** - Live data synchronization

### **Key Libraries**
```json
{
  "expo-camera": "Camera integration for receipt scanning",
  "expo-linear-gradient": "Beautiful gradient backgrounds",
  "react-native-reanimated": "Smooth animations",
  "lucide-react-native": "Consistent icon system",
  "@expo-google-fonts/inter": "Professional typography",
  "date-fns": "Date manipulation and formatting",
  "zod": "Runtime type validation"
}
```

## 📱 Screenshots & Features

### **Dashboard**
- **Financial Overview** - Monthly spending, income, and savings
- **Quick Actions** - Fast access to common tasks
- **Recent Activity** - Latest transactions and updates
- **Smart Insights** - AI-powered financial recommendations

### **Expense Management**
- **Advanced Filtering** - Multi-criteria search and filtering
- **Bulk Operations** - Select and modify multiple expenses
- **Receipt Scanning** - Camera integration for receipt capture
- **Template System** - Reusable expense templates

### **Social Features**
- **Group Management** - Create and manage expense groups
- **Debt Tracking** - Visual debt overview with payment requests
- **Activity Feed** - Social timeline of friend activities
- **Split Calculator** - Intelligent bill splitting

### **Reports & Analytics**
- **Interactive Charts** - Touch-enabled data visualization
- **Trend Analysis** - Historical spending patterns
- **Budget Performance** - Visual budget tracking
- **Export Options** - Multiple export formats

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/expenseflow.git
cd expenseflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
```bash
# Update config/firebase.ts with your Firebase config
# Enable Authentication, Firestore, and Storage in Firebase Console
```

4. **Start the development server**
```bash
npm run dev
```

5. **Run on device/simulator**
```bash
# iOS
npx expo run:ios

# Android  
npx expo run:android

# Web
npx expo start --web
```

## 🔧 Configuration

### **Firebase Setup**
1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Enable Storage for receipt uploads
5. Update `config/firebase.ts` with your config

### **Environment Variables**
```bash
# Create .env file
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

## 📊 Feature Implementation Status

### ✅ **Completed Features (100%)**

#### **Core Functionality**
- [x] User Authentication (Email/Password)
- [x] Expense CRUD Operations
- [x] Income Tracking
- [x] Budget Management
- [x] Category Management
- [x] Multi-Currency Support
- [x] Receipt Scanning (Mobile)
- [x] Tags System
- [x] Recurring Transactions

#### **Advanced Features**
- [x] Bulk Operations
- [x] Advanced Filtering
- [x] Expense Templates
- [x] Search Functionality
- [x] Data Export (CSV, PDF, JSON)
- [x] Real-time Synchronization

#### **Social Features**
- [x] Friend Management
- [x] Group Expenses
- [x] Expense Splitting (Equal, Amount, Percentage)
- [x] Debt Tracking
- [x] Payment Requests
- [x] Social Activity Feed
- [x] Group Management

#### **Analytics & Reports**
- [x] Interactive Charts
- [x] Spending Insights
- [x] Budget Performance
- [x] Category Analysis
- [x] Trend Analysis
- [x] Custom Date Ranges

#### **UI/UX**
- [x] Dark/Light Theme
- [x] Instagram-inspired Design
- [x] Smooth Animations
- [x] Responsive Layout
- [x] Accessibility Features
- [x] Loading States
- [x] Error Handling

#### **Settings & Preferences**
- [x] Account Management
- [x] Notification Settings
- [x] Currency Preferences
- [x] Data Backup
- [x] Privacy Controls

## 🎯 Future Enhancements

### **Planned Features**
- [ ] **AI-Powered Insights** - Machine learning for spending predictions
- [ ] **Investment Tracking** - Portfolio management integration
- [ ] **Bill Reminders** - Automated bill payment reminders
- [ ] **Merchant Integration** - Direct bank account linking
- [ ] **Cryptocurrency Support** - Track crypto transactions
- [ ] **Tax Reporting** - Generate tax-ready reports
- [ ] **Subscription Tracking** - Monitor recurring subscriptions
- [ ] **Goal Setting** - Financial goal tracking and achievements

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **Firebase Team** - For the robust backend services
- **Lucide Icons** - For the beautiful icon system
- **React Native Community** - For the excellent libraries and support

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/expenseflow/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/expenseflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/expenseflow/discussions)
- **Email**: support@expenseflow.app

---

<div align="center">
  <p>Made with ❤️ by the ExpenseFlow Team</p>
  <p>⭐ Star us on GitHub if you find this project useful!</p>
</div>