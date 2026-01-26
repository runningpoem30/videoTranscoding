import { S3Client } from "@aws-sdk/client-s3";
import { ECSClient } from "@aws-sdk/client-ecs";

const region = process.env.AWS_REGION || "us-east-1";


export const s3Client = new S3Client({ region });
export const ecsClient = new ECSClient({ region });