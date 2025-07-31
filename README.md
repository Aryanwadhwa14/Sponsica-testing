# Sponsica Teams API

A real-time chat server with team management capabilities, built with Express.js and TypeScript.

## Project Structure

```
sponsica-testing/
├── chats/                    # Chat functionality
│   ├── chats.controller.ts
│   ├── chats.models.ts
│   ├── chats.routes.ts
│   └── socket.ts
├── teams/                    # Team management
│   ├── role.middleware.ts    # Role-based authorization
│   ├── teams.controller.ts   # Team business logic
│   ├── teams.model.ts        # Team data models
│   ├── teams.routes.ts       # Team API routes
│   └── user/                 # User management
│       ├── user.controller.ts
│       ├── user.model.ts
│       └── user.ts
├── prisma/                   # Database
│   ├── client.ts
│   └── schema.prisma
├── index.ts                  # Main server file
├── teams.test.ts             # Team API tests
└── package.json
```

## Quick Start

```bash
# Install dependencies
npm install

# Run the server
npm start

# Run in development mode
npm run dev

# Run tests
npm test

# Run only team tests
npm test -- teams.test.ts
```

## Testing

The project includes comprehensive tests for the Teams API:

- **Team creation and management**
- **Member addition/removal**
- **Role-based permissions**
- **Team analytics**
- **Team search functionality**

All tests use in-memory storage for fast execution and isolation.

## Key Features

- **Real-time chat** with WebSocket support
- **Team management** with role-based access control
- **User authentication** and authorization
- **RESTful API** design
- **TypeScript** for type safety
- **Jest** for testing

## 📝 API Endpoints

### Teams
- `GET /api/team/info` - Get team information
- `POST /api/team/create` - Create a new team
- `PUT /api/team/settings` - Update team settings
- `POST /api/team/members/add` - Add team member
- `DELETE /api/team/members/remove` - Remove team member
- `GET /api/team/analytics` - Get team analytics
- `GET /api/team/search` - Search teams

### Chats
- `GET /api/chat/*` - Chat-related endpoints


