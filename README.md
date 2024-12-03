# Document Management Suite Frontend

## Project Overview

A Next.js-based frontend application for document management with advanced features and integrations.

## Explanation Video:

https://drive.google.com/file/d/1Y2j7PMZKpYwzk90PNI2VaIU3Vc16vYdP/view?usp=sharing

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

1. Rename `envfile.example` to `.env.local`
2. It contains the required environment variables

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Dependencies

### Main Libraries

- Next.js 15
- React 19
- Clerk Authentication
- Radix UI Components
- Tailwind CSS
- Zod (Schema Validation)
- Zustand (State Management)

### Key Integrations

- PDFTron WebViewer
- Socket.IO Client
- JWT Decoding
- Axios for API requests
