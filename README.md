# Document Management Suite Frontend

## Project Overview

A comprehensive Next.js-based document management application built with modern web technologies. This application provides a complete solution for document storage, sharing, collaboration, and management with advanced PDF viewing capabilities, real-time notifications, and secure authentication.

## Key Features

### 📄 Document Management

- **PDF Upload & Storage**: Secure document upload with file validation (PDF only, 10MB limit)
- **Document Viewer**: Advanced PDF viewing with zoom controls, page navigation, and responsive design
- **Document Organization**: Categorized document management with metadata tracking
- **Version Control**: Document versioning and update capabilities
- **File Operations**: Download, delete, and update documents with proper permissions

### 🔐 Authentication & Security

- **Clerk Authentication**: Secure user authentication with sign-in/sign-up flows
- **JWT Token Management**: Secure API communication with token-based authentication
- **User Profile Management**: User profile pages with avatar support
- **Session Management**: Persistent user sessions with automatic token refresh

### 👥 Collaboration Features

- **Document Sharing**: Share documents with specific users and permission levels
- **Real-time Notifications**: Socket.IO integration for instant notifications
- **Comment System**: Add comments and annotations to documents
- **Access Control**: Granular permission system (view, edit, delete)

### 🎨 User Interface

- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark/Light Theme**: Theme switching with system preference detection
- **Modern UI Components**: Radix UI components with custom styling
- **Interactive Elements**: Smooth animations with Framer Motion
- **Accessibility**: WCAG compliant components and keyboard navigation

### 📊 Dashboard & Analytics

- **Document Statistics**: Overview of document metrics and usage
- **View, Comment and Share Document**: User's uploaded documents, shared documents to him and comment options
- **Notification Center**: Centralized notification management
- **Trash Management**: Soft delete with recovery options

## Prerequisites

- Node.js (version 20 or later)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/midul9797/document-management-suite-frontend.git
cd document-management-suite-frontend
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
# or
yarn install  --legacy-peer-deps
```

### 3. Environment Variables

1. Copy `envfile.example` to `.env.local`:

   ```bash
   cp envfile.example .env.local
   ```

2. Configure the following environment variables in `.env.local`:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

   # API Configuration (if using external API)
   NEXT_PUBLIC_API_URL=your_api_url_here
   ```

3. **Clerk Setup**:

   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your publishable key and secret key
   - Update the environment variables with your Clerk credentials

4. **Optional Configuration**:
   - Configure your backend API URL if using an external API
   - Set up Socket.IO server URL for real-time features

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
document-management-suite-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (withoutSidebar)/         # Public routes (login, signup)
│   │   │   ├── login/                # Authentication pages
│   │   │   └── signup/
│   │   ├── (withSidebar)/            # Protected routes with sidebar
│   │   │   └── dashboard/            # Main application dashboard
│   │   │       ├── documents/        # Document management
│   │   │       ├── notifications/    # Notification center
│   │   │       ├── profile/          # User profile
│   │   │       ├── settings/         # Application settings
│   │   │       └── trash/           # Deleted documents
│   │   ├── globals.css              # Global styles
│   │   └── layout.tsx               # Root layout
│   ├── components/                   # Reusable UI components
│   │   ├── ui/                      # Base UI components (Radix UI)
│   │   ├── DashboardSidebar.tsx     # Main navigation sidebar
│   │   ├── PdfViewer.tsx             # PDF document viewer
│   │   ├── FileUploadModal.tsx      # File upload interface
│   │   ├── ShareModal.tsx           # Document sharing modal
│   │   ├── CommentModal.tsx         # Document comments
│   │   └── NotificationItem.tsx     # Notification components
│   ├── hooks/                       # Custom React hooks
│   │   └── useNotificationSocket.ts # Socket.IO integration
│   ├── interfaces/                  # TypeScript type definitions
│   ├── lib/                         # Utility libraries
│   │   ├── utils.ts                 # Common utilities
│   │   └── countries.ts             # Country data
│   ├── shared/                      # Shared services
│   │   └── axios.ts                 # API client configuration
│   ├── zustand/                     # State management
│   │   └── store.ts                 # Global state store
│   └── theme/                       # Theme configuration
│       └── theme-provider.tsx      # Theme context provider
├── public/                          # Static assets
│   ├── pspdfkit-lib/               # PDF.js library files
│   └── pulikidz-icon-100x100.png   # Application logo
├── components.json                  # UI component configuration
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
└── package.json                     # Dependencies and scripts
```

### Key Directories

- **`src/app/`**: Next.js App Router with route groups for different layouts
- **`src/components/`**: Reusable UI components and business logic components
- **`src/components/ui/`**: Base UI components built on Radix UI primitives
- **`src/hooks/`**: Custom React hooks for shared logic
- **`src/lib/`**: Utility functions and helper libraries
- **`src/shared/`**: Shared services like API clients
- **`src/zustand/`**: Global state management with Zustand
- **`public/`**: Static assets including PDF.js library files

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration for code consistency
- Use functional components with hooks
- Implement proper error boundaries

### Component Architecture

- **UI Components**: Located in `src/components/ui/` - reusable base components
- **Feature Components**: Located in `src/components/` - business logic components
- **Custom Hooks**: Located in `src/hooks/` - shared logic
- **State Management**: Global state in `src/zustand/store.ts`

### File Naming Conventions

- Components: PascalCase (e.g., `FileUploadModal.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useNotificationSocket.ts`)
- Utilities: camelCase (e.g., `downloadFile.ts`)
- Pages: lowercase with hyphens (e.g., `page.tsx`)

## API Integration

The application integrates with a backend API for document management:

### Authentication Flow

1. User signs in through Clerk authentication
2. JWT token is obtained and stored
3. API requests include Authorization header with token
4. Token is automatically refreshed when needed

### Document Operations

- **Upload**: POST to `/document-metadata` with file data
- **Download**: GET to `/document-metadata/{id}/download`
- **Update**: PATCH to `/document-metadata/{id}`
- **Delete**: PATCH to `/document-metadata/delete/{id}`
- **Share**: POST to `/document-metadata/{id}/share`

### Real-time Features

- Socket.IO integration for live notifications
- Real-time document collaboration
- Instant notification delivery

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables for Production

Ensure all environment variables are properly configured:

- Clerk production keys
- API endpoints
- Socket.IO server URL

### Static Assets

The application includes PDF.js library files in the `public/pspdfkit-lib/` directory for PDF rendering capabilities.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.
