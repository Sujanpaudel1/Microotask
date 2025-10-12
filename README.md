# MicroTask - Task Marketplace Platform

A fully functional task marketplace website similar to Upwork or Fiverr, but focused on micro tasks rather than jobs. Built with Next.js, TypeScript, and Tailwind CSS with Nepali localization.

## 🚀 Features

### For Clients
- **Post Tasks**: Create detailed task listings with budgets, deadlines, and skill requirements
- **Browse Freelancers**: Find skilled professionals with ratings and reviews
- **Manage Projects**: Dashboard to track posted tasks and proposals
- **Secure Payments**: NPR-based pricing with clear budget ranges

### For Freelancers
- **Find Tasks**: Browse available tasks with advanced filtering
- **Submit Proposals**: Apply to tasks with custom proposals and pricing
- **Build Profile**: Showcase skills, ratings, and completed tasks
- **Earn Money**: Get paid for completed tasks

### Platform Features
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Search & Filter**: Advanced search and filtering capabilities
- **User Dashboard**: Comprehensive dashboard for managing activities
- **Real-time Updates**: Dynamic content updates and notifications
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **Development**: Turbopack for fast development

## 📱 Pages & Components

### Main Pages
- **Home Page** (`/`): Hero section, featured tasks, how it works
- **Tasks Page** (`/tasks`): Browse and search all available tasks
- **Task Details** (`/tasks/[id]`): Detailed task view with proposal submission
- **Post Task** (`/post-task`): Create new task listings
- **Freelancers** (`/freelancers`): Browse freelancer profiles
- **Dashboard** (`/dashboard`): User activity and management

### Key Components
- **Navbar**: Navigation with search functionality
- **TaskCard**: Task listing card with all essential info
- **Footer**: Comprehensive site footer with links
- **Various Forms**: Task posting, proposal submission

## 💰 Currency & Localization

- **Currency**: Nepali Rupees (NPR) throughout the platform
- **Names**: Uses authentic Nepali names (Priya Sharma, Rajesh Thapa, etc.)
- **Pricing**: Realistic NPR amounts (NPR 10,000 - NPR 120,000 range)

## 🎨 Design Features

- **Color Scheme**: Professional blue-based theme
- **Typography**: Clean, readable fonts with proper hierarchy
- **Cards**: Shadow-based card design for content organization
- **Responsive**: Mobile-first responsive design
- **Accessibility**: Focus states and proper contrast ratios

## 🚀 Getting Started

1. **Install Dependencies**:
```bash
npm install
```

2. **Run Development Server**:
```bash
npm run dev
```

3. **Open in Browser**:
Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # User dashboard
│   ├── freelancers/       # Freelancer browsing
│   ├── post-task/         # Task creation
│   ├── tasks/             # Task browsing & details
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   └── TaskCard.tsx
├── lib/                   # Utilities and data
│   ├── mockData.ts        # Sample data
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript definitions
    └── index.ts
```

## 🎯 Key Features Implementation

### Task Management
- Task creation with detailed forms
- Category-based organization
- Skill requirement matching
- Budget range specification
- Deadline management

### User Experience
- Intuitive navigation
- Quick search functionality
- Advanced filtering options
- Responsive design
- Professional UI components

### Business Logic
- Proposal submission system
- Rating and review system
- Task status management
- User verification system
- Payment tracking

## 🔧 Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 Future Enhancements

- Real-time messaging system
- Payment gateway integration
- Advanced user profiles
- File upload functionality
- Email notifications
- Admin panel
- API endpoints
- Database integration

## 📄 License

This project is built for demonstration purposes and showcases a complete task marketplace implementation.

---

**MicroTask** - Connecting talent with opportunities, one task at a time! 🚀
