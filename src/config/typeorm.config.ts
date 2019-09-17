import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const SOURCE_PATH = process.env.NODE_ENV === 'production' ? 'dist' : 'src';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME,
    url: process.env.DB_URL,
    entities: [`${__dirname}/../**/*.entity.{js,ts}`],
    synchronize: true,
    username: 'teymurjava',
    password: 'Pa$$w0rd_1986',
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
