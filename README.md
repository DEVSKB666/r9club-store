# 🎵 R9Club Store - Digital Asset Platform

![Project Banner](https://www.r9clubradio.com/assets/images/logo.png?v=1)

BADGES_PLACEHOLDER

> **The Ultimate Marketplace for DJ Loops, Beats, and Music Samples.**  
> Built with modern web technologies, delivering a premium, high-performance, and secure digital shopping experience.

---

## ✨ Key Features

### 👤 User Experience

- **Modern Dark UI**: sleek, responsive design with glassmorphism effects.
- **Secure Authentication**: Discord OAuth & Credentials login via NextAuth.
- **Dynamic Profile**: Users can customize profiles and upload avatars.
- **Shopping Cart**: Real-time cart management with state persistence.
- **Digital Wallet**: Top-up system with credit balance.
- **Instant Downloads**: Secure, tokenized download links for purchased assets.

### 🛡️ Admin Dashboard

- **Comprehensive Analytics**: Track sales, users, and revenue.
- **User Management**: Manage accounts, roles, and credit balances.
- **Product Management**: Create, edit, and organize digital products.
- **Transaction Monitor**: Verify slips and transaction history.
- **System Config**: Manage site settings and banner announcements.

### 💳 Payment & Security

- **Slip Verification**: Automated/Manual bank slip checking (Slip2Go integration).
- **Secure Storage**: Image/File uploads managed with secure pathing.
- **Role-Based Access**: Strict separation between User and Admin privileges.

---

## 🛠️ Tech Stack

| Category     | Technologies                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Core**     | ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) |
| **Styling**  | ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC) ![Headless UI](https://img.shields.io/badge/Headless_UI-1.7-66E3FF)                                          |
| **Backend**  | ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748) ![Node.js](https://img.shields.io/badge/Node.js-18-339933)                                                           |
| **Database** | ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1)                                                                                                                        |
| **Auth**     | ![NextAuth](https://img.shields.io/badge/NextAuth.js-4.0-A555EC)                                                                                                               |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/DEVSKB666/r9club-store.git
cd r9club-store
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL="mysql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."
UPLOAD_DIR="./public/uploads"
```

### 4. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app in action!

---

## 📂 Project Structure

```
src/
├── app/              # App Router Pages & API Routes
├── components/       # Reusable UI Components
│   ├── ui/           # Buttons, Inputs, Cards
│   └── layout/       # Header, Sidebar, Footer
├── lib/              # Utilities (Prisma, Auth, Formatters)
├── stores/           # Zustand State Management (Cart, Credits)
└── types/            # TypeScript Interfaces
```

---

## 🤝 Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

---

<p align="center">
  Built with ❤️ by <b>DEVSKB666</b>
</p>
