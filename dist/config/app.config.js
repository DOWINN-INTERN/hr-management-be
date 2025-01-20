"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
exports.appConfig = {
    port: process.env.PORT || 3000,
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nestjs_app',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'Sd_;Lms:%LD|Ac6=?6CoS<C]etO*+c&6[`Ll2ppSP01xI`m9ftyn*og*dY27?p_',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },
};
