import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

const db: any = {};

export default db;

initialize();

async function initialize() {
    const url = process.env.DATABASE_URL || process.env.MYSQL_URL;
    
    if (!url) throw new Error('DATABASE_URL or MYSQL_URL environment variable is required');

    const sequelize = new Sequelize(url, {
        dialect: 'mysql',
        dialectOptions: {
            ssl: false
        }
    });

    const accountModel = require('../accounts/account.model');
    const refreshTokenModel = require('../accounts/refresh-token.model');

    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    await sequelize.sync();
    console.log('Database initialized');
}
