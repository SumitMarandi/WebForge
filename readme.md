# WebForge

A modern, intuitive web builder application that allows users to create beautiful websites without coding knowledge. Built with React, TypeScript, and Supabase.

## Features

- **Drag & Drop Interface**: Intuitive visual editor for building web pages
- **Pre-built Templates**: Professional templates for various industries
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Real-time Preview**: See changes instantly as you build
- **Export Options**: Download your website as HTML/CSS/JS files
- **User Authentication**: Secure login and user management
- **Subscription System**: Tiered plans with Cashfree payment integration
- **Cloud Storage**: Save and manage your projects in the cloud

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments**: Cashfree Payment Gateway
- **Deployment**: Vercel (Frontend), Supabase (Backend)
- **UI Components**: Custom components with Lucide React icons

## Project Structure

```
webforge/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── utils/      # Utility functions
│   │   ├── data/       # Static data and templates
│   │   └── styles/     # CSS and styling
│   └── package.json
└── backend/            # Supabase configuration
    └── supabase/
        ├── migrations/ # Database migrations
        └── functions/  # Edge functions
```

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Cashfree account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webforge
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` and configure with your Supabase and Cashfree credentials

4. **Start development server**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Apply database migrations**
   ```bash
   cd backend
   supabase db push
   ```

3. **Deploy Edge Functions**
   ```bash
   ./deploy-subscriptions.sh
   ```

## Subscription Plans

- **Free Plan**: ₹0 - 3 websites, 3 pages per site
- **Pro Plan**: ₹299/month or ₹2,990/year - 10 websites, 5 pages per site
- **Business Plan**: ₹999/month or ₹9,990/year - Unlimited websites and pages

## Documentation

- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `TESTING_CHECKLIST.md` - Testing procedures and checklist
- `backend/deploy-subscriptions.sh` - Automated deployment script

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details