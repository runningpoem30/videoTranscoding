import { RunTaskCommand, type RunTaskCommandInput } from "@aws-sdk/client-ecs";
import { ecsClient } from "../lib/s3-utils.js";

export const handler = async (event: any) => {
    try {
        // SQS wraps the S3 event in "body" as a JSON string
        const sqsRecord = event.Records[0];
        const s3Event = JSON.parse(sqsRecord.body);

        // Now access the S3 event data
        const bucket = s3Event.Records[0].s3.bucket.name;
        const key = decodeURIComponent(s3Event.Records[0].s3.object.key.replace(/\+/g, ' '));
        console.log(`Triggering Zylar Transcoder for: s3://${bucket}/${key}`);

        const input: RunTaskCommandInput = {
            cluster: process.env.CLUSTER,
            taskDefinition: "zylar-transcoder",
            launchType: "FARGATE",
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: process.env.SUBNETS ? process.env.SUBNETS.split(',') : [],
                    securityGroups: process.env.SECURITY_GROUPS ? process.env.SECURITY_GROUPS.split(',') : [],
                    assignPublicIp: "ENABLED",
                },
            },
            overrides: {
                containerOverrides: [
                    {
                        name: "zylar-transcoder",
                        environment: [
                            { name: "S3_BUCKET", value: bucket },
                            { name: "S3_KEY", value: key },
                            { name: 'DEST_BUCKET', value: 'zylar-processed-videos' }
                        ],
                    },
                ],
            },
        };

        const command = new RunTaskCommand(input);
        await ecsClient.send(command)
    }

    catch (e) {
        console.log(e)
    }
}
