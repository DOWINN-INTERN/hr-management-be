# Workforce 360

![Workforce 360 Logo](https://via.placeholder.com/200x60?text=Workforce+360)

## Table of Contents

- [Workforce 360](#workforce-360)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Architecture](#architecture)
  - [Technologies](#technologies)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Configuration](#environment-configuration)
  - [Documentation](#documentation)
    - [Compodoc](#compodoc)
  - [Project Structure](#project-structure)
  - [Development Workflow](#development-workflow)
    - [Code Generation](#code-generation)
    - [Custom Controllers](#custom-controllers)
    - [Gateway Generation](#gateway-generation)
  - [Custom Schematics](#custom-schematics)
  - [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Queue Management](#queue-management)
  - [Contributing](#contributing)
    - [Coding Standards](#coding-standards)
  - [Deployment](#deployment)
    - [Production Build](#production-build)
    - [Environment Variables](#environment-variables)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)

## Introduction

Workforce 360 is a comprehensive Human Resource Management System built with NestJS, TypeScript, and TypeORM. The system allows organizations to manage employees, departments, branches, attendance, shifts, payroll processing, and more with a robust permission and role-based access control system.

## Features

- **Organization Management**: Multi-tenant architecture for managing organizations, branches, and departments
- **Employee Management**: Complete employee lifecycle management
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Time & Attendance**: Track employee attendance with biometric integration
- **Shift Management**: Create and manage work schedules
- **Payroll Processing**: Automated payroll calculations with customizable components
- **Document Management**: Store and manage employee documents
- **Compliance Management**: Track compliance requirements
- **Real-time Notifications**: WebSocket-based notifications
- **Comprehensive API**: Well-documented RESTful endpoints for all operations
- **Audit Logging**: Track all system activities for compliance

## Architecture

Workforce 360 follows a modular architecture based on domain-driven design principles. The system is divided into multiple modules that handle specific business domains:

```text
┌─────────────────────────────────────────────────────────┐
│                      Client Apps                        │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                       API Gateway                       │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                     Core Modules                        │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ Account     │ Employee    │ Organization│ Attendance    │
│ Management  │ Management  │ Management  │ Management    │
└─────────────┴─────────────┴─────────────┴───────────────┘
┌─────────────┬─────────────┬─────────────┬───────────────┐
│ Shift       │ Payroll     │ Documents   │ Compliance    │
│ Management  │ Management  │ Management  │ Management    │
└─────────────┴─────────────┴─────────────┴───────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                Common & Shared Components               │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ Guards      │ Interceptors│ Decorators  │ DTOs          │
└─────────────┴─────────────┴─────────────┴───────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                       Database                          │
└─────────────────────────────────────────────────────────┘
```

## Technologies

- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: MySQL
- **Authentication**: JWT, Passport
- **Documentation**: Compodoc, Swagger, Scalar API Reference
- **Queue Management**: Bull with Redis
- **WebSockets**: Socket.io
- **Validation**: Class-validator
- **Testing**: Jest
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v8+)
- MySQL (v8+)
- Redis (for queue management)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/workforce360.git
   cd workforce360
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. Run database migrations:

   ```bash
   npm run migration:run
   ```

5. Start the application:

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

### Environment Configuration

Key environment variables include:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`: Database connection settings
- `ACCESS_TOKEN_SECRET`: Secret for JWT token signing
- `PORT`: Application port (default: 3000)
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins
- `EMAIL_*`: Email service configuration

See `.env` file for full configuration options.

## Documentation

### Compodoc

We use Compodoc for code documentation. To generate and view documentation:

```bash
# Build documentation
npm run docs:build

# View documentation (without rebuilding)
npm run docs:serve

# Build and serve documentation with auto-reload
npm run docs:watch

# Build and serve (with custom port)
npm run docs
```

Access the documentation at [http://localhost:8081](http://localhost:8081) by default.

## Project Structure

```text
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── config/                    # Configuration files
├── common/                    # Shared utilities, guards, interceptors
│   ├── decorators/            # Custom decorators
│   ├── dtos/                  # Data Transfer Objects
│   ├── entities/              # Base entities
│   ├── enums/                 # Enumerations
│   ├── factories/             # Factory functions
│   ├── filters/               # Exception filters
│   ├── guards/                # Authentication guards
│   ├── helpers/               # Helper functions
│   ├── interceptors/          # Request/response interceptors
│   └── interfaces/            # TypeScript interfaces
├── database/                  # Database configuration and migrations
├── modules/                   # Feature modules
│   ├── account-management/    # User accounts and authentication
│   ├── attendance-management/ # Time and attendance tracking
│   ├── employee-management/   # Employee data management
│   ├── organization-management/# Organizations, branches, departments
│   ├── payroll-management/    # Payroll processing
│   ├── shift-management/      # Work schedules
│   ├── compliance-management/ # Compliance tracking
│   ├── documents/             # Document management
│   ├── notifications/         # User notifications
│   └── files/                 # File uploads
└── bull/                      # Queue management
```

## Development Workflow

### Code Generation

We use NestJS CLI and custom schematics for code generation:

```bash
# Generate a new module
nest g mo modules/your-feature

# Generate a controller
nest g co modules/your-feature

# Generate a service
nest g s modules/your-feature
```

### Custom Controllers

For standard CRUD operations, use our custom controller generator:

```bash
# Generate a standard controller with CRUD operations
nest g -c general-controller your-feature
```

### Gateway Generation

For WebSocket gateways, use our custom gateway generator:

```bash
nest g -c gateway your-feature
```

## Custom Schematics

The project includes custom schematics to streamline development:

- `general-controller`: Generates a controller with standardized CRUD operations
- `gateway`: Generates WebSocket gateway with authentication

## API Reference

API documentation is available through:

1. **Swagger UI**: Access at `/api` when the application is running
2. **Scalar API Reference**: Access at `/reference` for an enhanced API documentation experience

## Authentication

The system uses JWT-based authentication. To authenticate:

1. **Login**: POST to `/api/account/auth/login` with credentials
2. **Google OAuth**: GET `/api/account/auth/google`
3. **Use JWT Token**: Include the token in the Authorization header as `Bearer <token>`

## Queue Management

Background processing uses Bull queues with Redis:

- **Notifications Queue**: Processing notifications
- **Payroll Processing Queue**: Background payroll calculations
- **Schedule Generation Queue**: Generating work schedules
- **Work Hour Calculation Queue**: Processing attendance data

Monitor queues at `/api/admin/queues`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to your branch: `git push origin feature/my-feature`
5. Create a pull request

### Coding Standards

- Follow the established TypeScript coding style
- Use decorators for cross-cutting concerns
- Document public APIs with JSDoc comments
- Write tests for new features

## Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Ensure all required environment variables are set in production environments.

## Troubleshooting

### Common Issues

- **Database Connection Issues**: Verify database credentials in `.env`
- **Queue Processing Issues**: Ensure Redis is running and properly configured

---

Built with ❤️ by the Workforce 360 Team
