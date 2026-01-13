# AWM Store - Frontend

This is the frontend of the AWM Store e-commerce platform, built with Next.js and featuring a vibrant red and golden Gen Z aesthetic with glowing animations.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **UI Components**: Custom built with Tailwind CSS

## Features

- Modern, vibrant UI with red and golden theme
- Glowing animations and effects throughout the application
- Responsive design for all device sizes
- Product browsing and search functionality
- Shopping cart management
- User authentication (admin/agent roles)
- Admin dashboard with analytics
- Agent dashboard with commission tracking
- Checkout process with multiple payment options

## Color Scheme

The application features a distinctive red and golden color palette with glowing effects:
- Primary: Red (#F05454)
- Secondary: Golden Yellow (#D4AF37)
- Accent: Various shades of red and gold with glowing animations

## Directory Structure

```
client/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── agent/        # Agent dashboard pages
│   │   ├── api/          # Client-side API routes
│   │   ├── cart/         # Shopping cart page
│   │   ├── checkout/     # Checkout page
│   │   ├── login/        # Login page
│   │   ├── shop/         # Main shop page
│   │   ├── product/      # Product detail pages
│   │   └── ...           # Other pages
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility functions
│   └── styles/           # Global styles
├── public/               # Static assets
├── package.json          # Dependencies and scripts
└── tailwind.config.js    # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd a-world-marketing/client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the client directory with the following variables:
```
NEXT_PUBLIC_API_URL=http://localhost:5002
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Lint the codebase

## API Integration

The frontend communicates with the backend API server. By default, it expects the backend to be running on `http://localhost:5002`.

## Key Pages

- `/shop` - Main product browsing page
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/login` - Authentication page
- `/admin/*` - Admin dashboard and management pages
- `/agent/*` - Agent dashboard and tracking pages

## Authentication

The application supports role-based authentication:
- Admin users: Full access to admin dashboard
- Agent users: Access to agent dashboard and commission tracking
- No customer login (customers can browse and purchase without account)

## Styling

All pages feature the distinctive red and golden theme with animated backgrounds and glowing elements. The theme is consistently applied across all components using Tailwind CSS utility classes and custom CSS animations.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.