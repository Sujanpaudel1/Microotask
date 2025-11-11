# MicroTask Platform# MicroTask - Task Marketplace Platform



A modern freelance marketplace connecting clients with talented freelancers for small to medium-sized projects. Built with Next.js, React, and SQLite.A fully functional task marketplace website similar to Upwork or Fiverr, but focused on micro tasks rather than jobs. Built with Next.js, TypeScript, and Tailwind CSS with Nepali localization.



---## 🚀 Features



## 🚀 What This Platform Does### For Clients

- **Post Tasks**: Create detailed task listings with budgets, deadlines, and skill requirements

MicroTask is a complete freelancing platform where clients can post tasks and freelancers can bid on projects they're interested in. Think of it as a streamlined version of Upwork or Fiverr, focused on quick, efficient project collaboration.- **Browse Freelancers**: Find skilled professionals with ratings and reviews

- **Manage Projects**: Dashboard to track posted tasks and proposals

### For Clients- **Secure Payments**: NPR-based pricing with clear budget ranges

- **Post Tasks:** Describe your project, set a budget, and choose the difficulty level

- **Review Proposals:** Get multiple proposals from qualified freelancers### For Freelancers

- **Hire Talent:** Accept the best proposal and start working- **Find Tasks**: Browse available tasks with advanced filtering

- **Communicate:** Chat directly with freelancers through built-in messaging- **Submit Proposals**: Apply to tasks with custom proposals and pricing

- **Track Progress:** Monitor your active projects from the dashboard- **Build Profile**: Showcase skills, ratings, and completed tasks

- **Leave Reviews:** Rate freelancers after project completion- **Earn Money**: Get paid for completed tasks



### For Freelancers### Platform Features

- **Browse Opportunities:** Find tasks that match your skills and interests- **Modern UI/UX**: Clean, responsive design with Tailwind CSS

- **Submit Proposals:** Bid on projects with custom proposals- **Search & Filter**: Advanced search and filtering capabilities

- **Build Your Portfolio:** Showcase your skills and past work- **User Dashboard**: Comprehensive dashboard for managing activities

- **Get Hired:** Receive notifications when clients accept your proposals- **Real-time Updates**: Dynamic content updates and notifications

- **Chat with Clients:** Discuss project details through real-time messaging- **Mobile Responsive**: Works seamlessly on all devices

- **Earn Reputation:** Build your profile with positive reviews and ratings

## 🛠️ Technology Stack

---

- **Frontend**: Next.js 15.5.4 with App Router

## ✨ Key Features- **Language**: TypeScript

- **Styling**: Tailwind CSS 4.0

### 🔐 User Authentication- **Icons**: Lucide React

- Secure signup and login system- **Fonts**: Geist Sans & Geist Mono

- Password encryption with bcrypt- **Development**: Turbopack for fast development

- JWT-based session management

- Protected routes and API endpoints## 📱 Pages & Components



### 📋 Task Management### Main Pages

- Create and browse tasks across 20+ categories- **Home Page** (`/`): Hero section, featured tasks, how it works

- Filter by difficulty (Beginner, Intermediate, Expert)- **Tasks Page** (`/tasks`): Browse and search all available tasks

- Track task status (Open, In Progress, Completed, Cancelled)- **Task Details** (`/tasks/[id]`): Detailed task view with proposal submission

- Detailed task pages with full descriptions- **Post Task** (`/post-task`): Create new task listings

- **Freelancers** (`/freelancers`): Browse freelancer profiles

### 💼 Proposal System- **Dashboard** (`/dashboard`): User activity and management

- Freelancers submit proposals with custom pricing and timelines

- Clients review and compare multiple proposals### Key Components

- Accept/reject proposals with one click- **Navbar**: Navigation with search functionality

- Automatic notifications on proposal status changes- **TaskCard**: Task listing card with all essential info

- **Footer**: Comprehensive site footer with links

### 💬 Real-Time Messaging- **Various Forms**: Task posting, proposal submission

- Direct messaging between clients and freelancers

- Conversation history organized by task## 💰 Currency & Localization

- Unread message notifications

- Auto-refresh every 3 seconds for near real-time experience- **Currency**: Nepali Rupees (NPR) throughout the platform

- Message threading with timestamps- **Names**: Uses authentic Nepali names (Priya Sharma, Rajesh Thapa, etc.)

- **Pricing**: Realistic NPR amounts (NPR 10,000 - NPR 120,000 range)

### ⭐ Reviews & Ratings

- 5-star rating system## 🎨 Design Features

- Written reviews with detailed feedback

- Average ratings displayed on user profiles- **Color Scheme**: Professional blue-based theme

- Helps build trust in the community- **Typography**: Clean, readable fonts with proper hierarchy

- **Cards**: Shadow-based card design for content organization

### 🔖 Bookmarks & Saved Tasks- **Responsive**: Mobile-first responsive design

- Save interesting tasks for later- **Accessibility**: Focus states and proper contrast ratios

- Quick access to bookmarked projects

- Easy bookmark management## 🚀 Getting Started



### 🔔 Notifications1. **Install Dependencies**:

- Real-time notifications for important events```bash

- New proposal notificationsnpm install

- Message alerts```

- Task status updates

- Mark all as read functionality2. **Run Development Server**:

```bash

### 👤 User Profilesnpm run dev

- Customizable profile pages```

- Skills showcase

- Bio and description3. **Open in Browser**:

- Profile picture uploadNavigate to [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

- Work history and statistics

## 📁 Project Structure

### 📊 Dashboard

- Overview of your activity```

- Active tasks at a glancesrc/

- Recent notifications├── app/                    # Next.js App Router pages

- Quick stats (earnings, tasks completed, proposals sent)│   ├── dashboard/         # User dashboard

│   ├── freelancers/       # Freelancer browsing

---│   ├── post-task/         # Task creation

│   ├── tasks/             # Task browsing & details

## 🛠️ Technology Stack│   ├── layout.tsx         # Root layout

│   ├── page.tsx           # Home page

### Frontend│   └── globals.css        # Global styles

- **Next.js 15** - React framework with App Router├── components/            # Reusable components

- **React 19** - UI components and hooks│   ├── Footer.tsx

- **TypeScript** - Type-safe code│   ├── Navbar.tsx

- **Tailwind CSS 4** - Modern, responsive styling│   └── TaskCard.tsx

- **Lucide Icons** - Beautiful, consistent icons├── lib/                   # Utilities and data

│   ├── mockData.ts        # Sample data

### Backend│   └── utils.ts           # Helper functions

- **Next.js API Routes** - Serverless API endpoints└── types/                 # TypeScript definitions

- **SQLite** - Lightweight, file-based database    └── index.ts

- **Better-SQLite3** - Synchronous SQLite bindings for Node.js```

- **JWT** - Secure authentication tokens

- **Bcrypt** - Password hashing## 🎯 Key Features Implementation



### Development Tools### Task Management

- **Turbopack** - Fast build system- Task creation with detailed forms

- **ESLint** - Code linting- Category-based organization

- **PostCSS** - CSS processing- Skill requirement matching

- Budget range specification

---- Deadline management



## 📁 Project Structure### User Experience

- Intuitive navigation

```- Quick search functionality

Microtask/- Advanced filtering options

├── src/- Responsive design

│   ├── app/                    # Next.js pages and routes- Professional UI components

│   │   ├── api/               # API endpoints

│   │   │   ├── auth/         # Authentication APIs### Business Logic

│   │   │   ├── tasks/        # Task management APIs- Proposal submission system

│   │   │   ├── messages/     # Messaging APIs- Rating and review system

│   │   │   ├── bookmarks/    # Bookmark APIs- Task status management

│   │   │   └── reviews/      # Review APIs- User verification system

│   │   ├── dashboard/        # Dashboard page- Payment tracking

│   │   ├── tasks/           # Task browsing and details

│   │   ├── messages/        # Messaging interface## 🔧 Scripts

│   │   ├── freelancers/     # Freelancer directory

│   │   └── profile/         # User profile page- `npm run dev` - Start development server with Turbopack

│   ├── components/           # Reusable UI components- `npm run build` - Build for production

│   │   ├── Navbar.tsx       # Navigation bar- `npm run start` - Start production server

│   │   ├── TaskCard.tsx     # Task display card- `npm run lint` - Run ESLint

│   │   └── Footer.tsx       # Footer component

│   ├── lib/                 # Utilities and helpers## 🌟 Future Enhancements

│   │   ├── auth.ts         # Authentication utilities

│   │   ├── database-sqlite.ts  # Database connection- Real-time messaging system

│   │   └── constants.ts    # Platform constants- Payment gateway integration

│   └── types/              # TypeScript type definitions- Advanced user profiles

├── scripts/                # Database setup scripts- File upload functionality

├── public/                 # Static assets- Email notifications

└── microtask.db           # SQLite database file- Admin panel

```- API endpoints

- Database integration

---

## 📄 License

## 🚦 Getting Started

This project is built for demonstration purposes and showcases a complete task marketplace implementation.

### Prerequisites

- Node.js 18+ installed---

- npm or yarn package manager

**MicroTask** - Connecting talent with opportunities, one task at a time! 🚀

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sujanpaudel1/Microotask.git
   cd Microotask
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

4. **Initialize the database**
   
   The database tables are created automatically, but you can run setup scripts:
   ```bash
   node scripts/setup-db.ts
   node scripts/create-messaging-tables.js
   node scripts/create-saved-tasks-table.js
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000`

---

## 🎯 How It Works

### The Complete Workflow

1. **Sign Up**
   - New users create an account with email and password
   - Choose between client or freelancer role (or both!)

2. **Post a Task** (Clients)
   - Fill in task details: title, description, category, budget
   - Set difficulty level and deadline
   - Task goes live immediately

3. **Browse Tasks** (Freelancers)
   - Search through available tasks
   - Filter by category, difficulty, or budget
   - Bookmark interesting tasks for later

4. **Submit Proposal** (Freelancers)
   - Write a compelling proposal
   - Set your price and delivery time
   - Submit and wait for client response

5. **Review Proposals** (Clients)
   - See all proposals on your task
   - Compare freelancer profiles, ratings, and pricing
   - Accept the best fit for your project

6. **Start Collaboration**
   - Accepted freelancer gets notified
   - Both parties can message each other
   - Discuss project details and requirements

7. **Complete Task**
   - Freelancer delivers the work
   - Client marks task as complete
   - Both parties leave reviews

8. **Build Reputation**
   - Positive reviews increase visibility
   - Higher ratings = more opportunities
   - Grow your freelance career!

---

## 🔒 Security Features

- **Password Hashing:** All passwords encrypted with bcrypt
- **JWT Tokens:** Secure, HttpOnly cookies for session management
- **API Authentication:** All sensitive endpoints require authentication
- **SQL Injection Protection:** Parameterized queries throughout
- **CSRF Protection:** Built-in Next.js security measures
- **XSS Prevention:** React's automatic escaping

---

## 📱 Responsive Design

The platform works seamlessly across all devices:
- **Desktop:** Full-featured experience with split panels
- **Tablet:** Optimized layout for medium screens
- **Mobile:** Touch-friendly interface with collapsible navigation

---

## 🎨 Categories Supported

We support 20+ task categories including:
- Web Development
- Mobile Development
- Graphic Design
- Content Writing
- Digital Marketing
- Video Editing
- UI/UX Design
- Data Entry
- Virtual Assistance
- Translation
- And many more!

---

## 📊 Database Schema

### Core Tables
- **users** - User accounts and profiles
- **tasks** - Posted tasks and projects
- **proposals** - Freelancer bids on tasks
- **conversations** - Message threads
- **messages** - Individual messages
- **reviews** - User ratings and feedback
- **notifications** - System notifications
- **saved_tasks** - Bookmarked tasks

### Key Relationships
- Users can post multiple tasks
- Tasks can have multiple proposals
- Users can have multiple conversations
- Each conversation contains many messages
- Reviews are tied to completed tasks

---

## 🚀 Performance Optimizations

- **Next.js 15 Turbopack:** Lightning-fast builds
- **Image Optimization:** Automatic WebP/AVIF conversion
- **Code Splitting:** Load only what's needed
- **Gzip Compression:** Reduced file sizes
- **Database Indexing:** Fast query performance
- **Efficient Polling:** Smart message refresh (3s intervals)

---

## 🔄 Real-Time Features

### Messaging System
- Messages update every 3 seconds automatically
- Unread count refreshes in real-time
- Smooth, non-intrusive updates
- Optimized to prevent unnecessary re-renders

### Notifications
- Instant notification on new events
- Badge counters update automatically
- Click to view detailed information

---

## 🧪 Testing

Run the included test scripts to verify functionality:

```bash
# Test authentication
node scripts/test-auth.js

# Test messaging system
node scripts/test-messaging.js

# Test bookmarks
node scripts/test-bookmarks.js
```

---

## 📈 Future Enhancements

Planned features for upcoming releases:
- **Payment Integration:** Stripe/PayPal for secure transactions
- **Email Verification:** Enhanced security with email confirmation
- **File Attachments:** Share files in messages
- **Advanced Search:** Filter by multiple criteria
- **Admin Dashboard:** Platform management tools
- **Analytics:** Detailed insights and reports
- **Mobile App:** Native iOS and Android apps
- **WebSocket Support:** True real-time messaging

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Developer

**Sujan Paudel**
- GitHub: [@Sujanpaudel1](https://github.com/Sujanpaudel1)
- Email: sujan@curllabs.com

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices. Special thanks to the open-source community for amazing tools like Next.js, React, and Tailwind CSS.

---

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Contact the developer via email

---

## 🎉 Start Building Your Freelance Empire Today!

Whether you're a client looking for talent or a freelancer seeking opportunities, MicroTask provides the platform to make it happen. Simple, efficient, and powerful.

**Ready to get started?** Follow the installation steps above and launch your local instance in minutes!

---

*Built with ❤️ using Next.js and modern web technologies*
