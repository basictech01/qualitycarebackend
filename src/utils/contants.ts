export const PORT = 3001
export const JWT_AUTH_SECRET='xxxxxxx';
export const JWT_REFRESH_SECRET='xxxx';
export const JWT_AUTH_EXPIRATION = 60*60*24*7; // 1 week

export const IV_ENCRYPTION_SECRET = 'xxxxx';
export const REGISTRATION_ENCRYPTION_SECRET =  'xxxxx';

export const AWS_REGION = 'auto'
export const AWS_ACCESS_KEY_ID = 'xxxxxx'
export const AWS_SECRET_ACCESS_KEY = 'xxxxxx'
export const AWS_ENDPOINT_URL_S3 = 'xxxxx'
export const AWS_S3_BUCKET = 'xxxxx'

export const AWS_FILE_LOCATION = `xxxxxxxx`

export const FILE_CREATION_SECRET_KEY = 'xxxxx'
export const MYSQL_DB_CONFIG_NEW = {
    'host':'mysql',
    'user':'temp',
    'password':'password',
    'port': 3306,
    'database':'qualitycare',
    'connection_limit':100
}