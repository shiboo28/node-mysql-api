import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import config from '../config.json';

const db: any = {
    initialized: false,
    error: null
};

export default db;

initialize();

async function initialize() {
    let host = (config as any).database.host;
    let port = (config as any).database.port;
    let user = (config as any).database.user;
    let password = (config as any).database.password;
    let database = (config as any).database.database;

    const rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PRIVATE_URL;
    const url = rawUrl ? rawUrl.replace(/\r/g, '').trim() : undefined;
    if (url) {
        try {
            const parsedUrl = new URL(url);
            host = parsedUrl.hostname;
            port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306;
            user = decodeURIComponent(parsedUrl.username);
            password = decodeURIComponent(parsedUrl.password);
            database = decodeURIComponent(parsedUrl.pathname.substring(1));
        } catch (err) {
            console.error('Failed to parse database connection URL:', err);
        }
    } else {
        const rawHost = process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST;
        if (rawHost) {
            host = rawHost.replace(/\r/g, '').trim();
        }
        const rawPort = process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT;
        if (rawPort) {
            port = parseInt(rawPort.replace(/\r/g, '').trim(), 10);
        }
        const rawUser = process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER;
        if (rawUser) {
            user = rawUser.replace(/\r/g, '').trim();
        }
        const rawPassword = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
        if (rawPassword) {
            password = rawPassword.replace(/\r/g, '').trim();
        }
        const rawDatabase = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_DATABASE;
        if (rawDatabase) {
            database = rawDatabase.replace(/\r/g, '').trim();
        }
    }

    console.log(`Connecting to database at Host: ${host}, Port: ${port}, User: ${user}, Database: ${database}`);

    let sequelize;
    try {
        // Create database if it does not exist
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();

        // Connect to database
        sequelize = new Sequelize(database, user, password, {
            host,
            port,
            dialect: 'mysql',
            logging: false,
            dialectOptions: {
                ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : false
            }
        });

        const accountModel = require('../accounts/account.model');
        const refreshTokenModel = require('../accounts/refresh-token.model');

        db.Account = accountModel(sequelize);
        db.RefreshToken = refreshTokenModel(sequelize);

        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
        db.RefreshToken.belongsTo(db.Account);

        await sequelize.sync();

        // Auto-promote admin@lab7.com to Admin if it exists
        try {
            const adminAccount = await db.Account.findOne({ where: { email: 'admin@lab7.com' } });
            if (adminAccount && adminAccount.role !== 'Admin') {
                adminAccount.role = 'Admin';
                await adminAccount.save();
                console.log("🚀 Automatically promoted admin@lab7.com to Admin!");
            }
        } catch (err: any) {
            console.error('Failed to auto-promote admin@lab7.com:', err.message);
        }

        // Auto-verify all existing unverified accounts on startup
        try {
            const [updatedRows] = await db.Account.update(
                { verified: new Date(), verificationToken: null },
                { where: { verified: null } }
            );
            if (updatedRows > 0) {
                console.log(`🚀 Automatically verified ${updatedRows} existing unverified account(s)!`);
            }
        } catch (err: any) {
            console.error('Failed to auto-verify accounts:', err.message);
        }

        db.initialized = true;
        console.log('Database initialized successfully');
    } catch (err: any) {
        db.error = err.message || String(err);
        console.error('Database connection / initialization failed:', err);
    }
    }
}
