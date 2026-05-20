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
}
