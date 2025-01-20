# Project Title: NestJS User Authentication System

## Description
This project is a user authentication system built with NestJS, TypeScript, TypeORM, and MySQL. It provides functionalities for user registration, login, and role-based access control. The application is structured to include guards, validation, error handling, and various other features to ensure security and maintainability.

## Features
- User registration and login
- JWT authentication
- Role-based access control
- Input validation using DTOs
- Custom exception filters
- Logging and caching mechanisms
- Rate limiting for enhanced security

## Technologies Used
- NestJS
- TypeScript
- TypeORM
- MySQL
- JWT
- Class-validator
- Class-transformer

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd nestjs-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and configure your database connection:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=yourpassword
   DB_DATABASE=yourdatabase
   JWT_SECRET=your_jwt_secret
   ```

4. Run database migrations (if applicable):
   ```
   npm run typeorm migration:run
   ```

5. Start the application:
   ```
   npm run start
   ```

## Usage
- **Register a new user**: Send a POST request to `/auth/register` with the required fields.
- **Login**: Send a POST request to `/auth/login` with username and password.
- **Access protected routes**: Use the JWT token received upon login in the Authorization header.

## Testing
Run the end-to-end tests using:
```
npm run test:e2e
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.