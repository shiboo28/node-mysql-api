import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import config from '../config.json';

const db: any = {};

export default db;

initialize();

async function initialize() {
    let host = (config as any).database.host;
    let port = (config as any).database.port;
    let user = (config as any).database.user;
    let password = (config as any).database.password;
    let database = (config as any).database.database;

    const url = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PRIVATE_URL;
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
        if (process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST) {
            host = process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST;
        }
        if (process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT) {
            port = parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10);
        }
        if (process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER) {
            user = process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER;
        }
        if (process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD) {
            password = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
        }
        if (process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_DATABASE) {
            database = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_DATABASE;
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
    } catch (err) {
        console.error('Database connection / initialization failed:', err);
        throw err;
    }

    const accountModel = require('../accounts/account.model');
    const refreshTokenModel = require('../accounts/refresh-token.model');

    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    await sequelize.sync();
    console.log('Database initialized');
}
