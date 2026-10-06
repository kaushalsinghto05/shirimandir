import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'shirimandir_sacred_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'rzp_test_webhook_secret_key_9921',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || null,
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local', // 'local' or 's3'
    s3Endpoint: process.env.S3_ENDPOINT || '',
    s3Bucket: process.env.S3_BUCKET || 'shirimandir-proofs',
    s3AccessKey: process.env.S3_ACCESS_KEY || '',
    s3SecretKey: process.env.S3_SECRET_KEY || '',
    publicBaseUrl: process.env.PUBLIC_STORAGE_URL || 'http://localhost:5000/uploads'
  }
};
