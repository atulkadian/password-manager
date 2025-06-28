# Personal Password Manager

A minimalist, self-hosted password manager with client-side encryption and dark/light theme support. Replace your insecure tools like WhatsApp or Telegram saved messages. Open-source and contributions welcome!

## Features

- 🔐 **End-to-End Encryption**: Passwords are encrypted on your device before being stored
- 🔑 **Password Generator**: Generate strong, unique passwords with customizable options
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌙 **Dark/Light Theme**: Toggle between themes with system preference support
- 📊 **Security Dashboard**: Monitor weak and reused passwords
- 🏷️ **Categories**: Organize passwords with custom categories
- 🔍 **Search & Filter**: Quickly find passwords with advanced search

## Security Features

- Client-side AES-256 encryption with PBKDF2 key derivation
- Master password never stored on server
- Rate limiting and brute-force protection
- Secure session management with JWT
- CSRF protection and secure headers
- Input validation and sanitization

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Encryption**: CryptoJS (AES-256)
- **UI**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or cloud)
- pnpm

### 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/atulkadian/password-vault
   cd securevault
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Then open `.env` and update the following:

   ```env
   MONGODB_URI=mongodb://localhost:27017/securevault
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secret-key-here
   ```

4. **Start MongoDB**

   If you're using **local MongoDB**, make sure it's running:

   ```bash
   mongod
   ```

   Or, if you're using **MongoDB Atlas**, update `MONGODB_URI` in `.env` with your connection string.

5. **Run the development server**

   ```bash
   pnpm run dev
   ```

6. **Open your browser**

   Visit: [http://localhost:3000](http://localhost:3000)

## Usage

### Creating an Account

1. Click "Get Started" on the homepage
2. Fill in your details including:
   - **Account Password**: For logging into the app
   - **Master Password**: For encrypting your passwords (12+ characters)
3. **Important**: Keep your master password safe - it cannot be recovered!

## Docker

TODO

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

TBD
