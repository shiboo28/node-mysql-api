import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import config from '../config.json';

const db: any = {};

export default db;

initialize();

async function initialize() {
    const url = process.env.DATABASE_URL || process.env.MYSQL_URL;
    let sequelize;

    if (url) {
        sequelize = new Sequelize(url, {
            dialect: 'mysql',
            dialectOptions: {
                ssl: false
            },
            logging: false
        });
    } else {
        const { host, port, user, password, database } = (config as any).database;
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        sequelize = new Sequelize(database, user, password, { dialect: 'mysql', logging: false });
    }

    const accountModel = require('../accounts/account.model');
    const refreshTokenModel = require('../accounts/refresh-token.model');

    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    await sequelize.sync();
    console.log('Database initialized');

    // Auto-promote admin@lab7.com to Admin if it exists
    try {
        const adminAccount = await db.Account.findOne({ where: { email: 'admin@lab7.com' } });
        if (adminAccount && adminAccount.role !== 'Admin') {
            adminAccount.role = 'Admin';
            await adminAccount.save();
            console.log("🚀 Automatically promoted admin@lab7.com to Admin!");
        }

        // Auto-verify all existing unverified Users
        const [updatedRows] = await db.Account.update(
            { verified: new Date(), verificationToken: null },
            { where: { role: 'User', verified: null } }
        );
        if (updatedRows > 0) {
            console.log(`🚀 Automatically verified ${updatedRows} existing unverified Users!`);
        }
    } catch (err: any) {
        console.error('Failed to initialize database defaults:', err.message);
    }
}
