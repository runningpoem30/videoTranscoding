import { s3Client } from "../lib/s3-utils.js";
import { PutObjectCommand, type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body = event.body ? JSON.parse(event.body) : {};
        const { fileName, contentType } = body;

        if (!fileName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "fileName is required" })
            };
        }

        const key = `video-uploads/${Date.now()}-${fileName}`;

        const input: PutObjectCommandInput = {
            Bucket: process.env.BUCKET,
            Key: key,
            ContentType: contentType
        };

        const command = new PutObjectCommand(input);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

       
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                uploadUrl: url,
                key: key
            })
        };

    } catch (e) {
        console.error(`Error generating URL: ${e}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not generate upload URL" })
        };
    }
};