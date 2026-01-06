# RealField Pro

A high-fidelity construction management SaaS built with the "Anti-Gravity" philosophy - heavy data that feels weightless and fast.

## Features

- 🎨 **Golan Design System** - Custom dark theme with Obsidian background, infinite grid, and Bronze accents
- 📊 **Project Management** - Create, edit, and manage construction projects
- 📅 **Living Gantt Chart** - Interactive timeline with automatic late detection
- 💰 **Dynamic Budget** - Real-time budget tracking with pie charts
- 📝 **Report System** - Document progress with photos and PDF export
- 🔥 **Real-time Updates** - Firebase-powered live data synchronization

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Firebase** - Backend and real-time database

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/          # Main dashboard
│   └── projects/[id]/      # Project detail pages
├── components/             # React components
│   ├── modals/              # Modal dialogs
│   └── widgets/             # Living widgets (Gantt, Budget)
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and Firebase config
└── types/                  # TypeScript type definitions
```

## Key Features

### Global Dashboard
- View all projects sorted by last opened
- Create new projects with client and location info
- Edit project details and status
- Delete projects with confirmation

### Project Command Center
- View project timeline with Gantt chart
- Track budget allocation and spending
- Manage construction reports
- Real-time updates across all users

### Living Widgets

**Editable Gantt Chart:**
- Horizontal timeline bars for each phase
- Vertical "Today" line indicator  
- Automatic late detection (red coloring)
- Click to edit dates and status

**Dynamic Budget:**
- Interactive pie chart visualization
- Budget vs. spent tracking
- Segment-level management
- Color-coded categories

### Report System
- Create detailed progress reports
- Stop Work order toggle
- Photo grid with captions
- PDF export functionality
- Sortable by date

## Firebase Data Structure

```
projects/
  {projectId}/
    - name, client, address, status
    - phases[] (timeline data)
    - budget[] (budget segments)
    reports/
      {reportId}/
        - title, date, content
        - stopWork, photos[]
```

## Development

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## License

Private project - All rights reserved
