import { s3Client } from "../lib/s3-utils.js";
import { PutObjectCommand, type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token"
    };

    // Robust check for HTTP Method (Works for REST and HTTP APIs)
    const method = event.httpMethod || (event as any).requestContext?.http?.method;

    if (method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ""
        };
    }

    try {
        const body = event.body ? JSON.parse(event.body) : {};
        const { fileName, contentType } = body;

        if (!fileName) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "fileName is required" })
            };
        }

        const key = `video-uploads/${Date.now()}-${fileName}`;

        const input: PutObjectCommandInput = {
            Bucket: process.env.S3_BUCKET || process.env.BUCKET,
            Key: key,
            ContentType: contentType
        };

        const command = new PutObjectCommand(input);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                uploadUrl: url,
                key: key
            })
        };

    } catch (e) {
        console.error(`Error generating URL: ${e}`);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Could not generate upload URL" })
        };
    }
};

// i need to check out if all these things are working correctly and what is really happening before pushing these codes 
// more features that needs to be built in this : 
// adding auth for users that come for first time , probably using oauth , 
// work on the ui ig ? 
// adding rate limit . gotta add a rate limit for this 
// pricing can be added later ; first i just need to add rate limit so that the users abuse the storage , even though i doubt 
// also i need a link to serve to the users 
