import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'moonshot_secret_access_token';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'moonshot_secret_refresh_token';

export { PORT, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET };
