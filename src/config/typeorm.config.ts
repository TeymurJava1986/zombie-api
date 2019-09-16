import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const SOURCE_PATH = process.env.NODE_ENV === 'production' ? 'dist' : 'src';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'mongodb',
    host: process.env.DB_HOST,
    port: 27017,
    database: process.env.DB_NAME,
    url: process.env.DB_URL,
    entities: [`${__dirname}/../**/*.entity.{js,ts}`],
    synchronize: true,
    useNewUrlParser: true,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    useUnifiedTopology: true,
    ssl: process.env.DB_USE_SSL === 'true',
};

// export const typeOrmConfig: TypeOrmModuleOptions = {
//     type: 'mongodb',
//     host: 'localhost',
//     port: 27017,
//     database: 'standoff',
//     entities: [`${__dirname}/../**/*.entity.ts`, `${__dirname}/../**/*.entity.js`],
//     synchronize: true,
//     useNewUrlParser: true,
//     username: '',
//     password: '',
//     useUnifiedTopology: true,
//     ssl: false,
// };
