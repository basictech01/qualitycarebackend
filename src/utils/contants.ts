export const PORT = 3001
export const MONGODB_URL = "mongodb+srv://prapande:distributeddsn@cluster0.byqvp.mongodb.net/dsnDEV?retryWrites=true&w=majority"
export const JWT_AUTH_SECRET='md2389rhnSA#2331';
export const JWT_REFRESH_SECRET='md2389rhnSA#2331';
export const JWT_AUTH_EXPIRATION = 60*60*24*7; // 1 week

export const IV_ENCRYPTION_SECRET = '1234567890123456';
export const REGISTRATION_ENCRYPTION_SECRET =  '954c1d2d1a5290a876ffe7d7854e0a841b27236cd48ce93fe02b51921f35a62d';

export const MYSQL_DB_CONFIG_NEW = {
    'host':'mysql',
    'user':'temp',
    'password':'password',
    'port': 3306,
    'database':'qualitycare',
    'connection_limit':100
}