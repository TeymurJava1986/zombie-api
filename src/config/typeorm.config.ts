import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const SOURCE_PATH = process.env.NODE_ENV === 'production' ? 'dist' : 'src';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'standoff',
    entities: [`${__dirname}/../**/*.entity.{js,ts}`],
    synchronize: true,
    username: 'postgres',
    password: 'postgres',
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
