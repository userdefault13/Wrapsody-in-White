# Wrapsody in White

Mobile gift wrapping services booking platform built with Nuxt 3, Tailwind CSS, and MongoDB.

## Features

- 🎁 Customer booking system with calendar and time slot selection
- 📅 Admin dashboard for managing bookings
- 🔐 MetaMask authentication for admin access
- 📊 Availability scheduling (day-of-week and specific dates)
- 💾 MongoDB database integration
- 📱 Responsive design

## Setup

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- MetaMask browser extension (for admin access)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=wrapsody-in-white
```

For MongoDB Atlas (cloud):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

3. Start MongoDB (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

4. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000`

## Database Collections

- `bookings` - Customer booking records
- `availability` - Schedule availability (day-of-week and specific dates)

## Admin Access

1. Visit `/admin/login`
2. Connect with MetaMask
3. Whitelisted wallet address: `0x2127aa7265d573aa467f1d73554d17890b872e76`

## Deployment

The app is ready for deployment on Vercel. Make sure to:
1. Set environment variables in Vercel dashboard
2. Configure MongoDB Atlas connection string
3. Deploy using `npm run build`
