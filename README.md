# Catalyst Demo

A serverless application built with **Zoho Catalyst** platform, featuring a React frontend and Node.js serverless functions.

## 🚀 Project Structure

```
catalyst-demo/
├── catalyst.json           # Catalyst configuration
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   └── ...
│   ├── public/
│   └── package.json
└── functions/             # Serverless functions
    └── demo_function/
        ├── index.js       # Function handler
        ├── catalyst-config.json
        └── package.json
```

## 📋 Prerequisites

- Node.js (v14 or higher)
- Zoho Catalyst CLI
- npm or yarn

## 🛠️ Installation

1. **Install Catalyst CLI** (if not already installed):
   ```bash
   npm install -g zcatalyst-cli
   ```

2. **Install dependencies**:
   ```bash
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

## 🚀 Getting Started

### Development Mode

Start the local development server:

```bash
catalyst serve
```

This will start:
- React app at `http://localhost:3000`
- Catalyst functions locally

### Stop the Server

To stop all Catalyst services:

```bash
catalyst serve:stop
```

Or press `Ctrl+C` in the terminal running the serve command.

## 🧪 Available Scripts

### Client Scripts

From the `client/` directory:

```bash
npm start    # Run development server
npm test     # Run tests
npm build    # Build for production
```

## 📦 Tech Stack

### Frontend
- **React** 19.2.0
- **React Scripts** 5.0.1
- **Testing Library** for Jest/React
- **Web Vitals** for performance monitoring

### Backend
- **Zoho Catalyst** serverless platform
- **Node.js** 16
- **zcatalyst-sdk-node** - Catalyst SDK

## 🔧 Catalyst Functions

### demo_function

A basic I/O function that demonstrates:
- Writing responses with `basicIO.write()`
- Reading arguments with `basicIO.getArgument()`
- Context management with `context.close()`

## 📝 Configuration

- `catalyst.json` - Main Catalyst project configuration
- `functions/demo_function/catalyst-config.json` - Function-specific settings
- `client/package.json` - React app dependencies and scripts

## 🚢 Deployment

To deploy to Zoho Catalyst:

```bash
catalyst deploy
```

## 📚 Learn More

- [Zoho Catalyst Documentation](https://catalyst.zoho.com/help/)
- [React Documentation](https://react.dev/)
- [Catalyst CLI Reference](https://catalyst.zoho.com/help/cli-reference.html)

## 📄 License

This project is a demo application for learning Zoho Catalyst.

## 👤 Author

Created by: user1@demo1.itotcloud.in
