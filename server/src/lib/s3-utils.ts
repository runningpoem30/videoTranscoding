import { S3Client } from "@aws-sdk/client-s3";
const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION } = process.env;

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !AWS_REGION) {
    throw new Error("Missing AWS Credentials in .env file");
}

export const s3Client = new S3Client({ 
    region : AWS_REGION 
});

