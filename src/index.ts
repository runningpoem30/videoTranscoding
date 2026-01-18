import { SQSClient  , ReceiveMessageCommand , DeleteMessageCommand} from "@aws-sdk/client-sqs";
import * as dotenv from 'dotenv';
dotenv.config();

const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION } = process.env;

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !AWS_REGION) {
    throw new Error("Missing AWS Credentials in .env file");
}

const client = new SQSClient({
    region: AWS_REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
    }
});


async function main(){
    const command = new ReceiveMessageCommand({
        QueueUrl : process.env.SQS_QUEUE_URL,
        MaxNumberOfMessages : 1 , 
        WaitTimeSeconds : 20
    });

    while(true){
        const  { Messages } = await client.send(command)
        if(!Messages){
            console.log(`no message in queue`);
            continue;
        }

        for (const message of Messages){
            const { MessageId , Body} = message;
            console.log(`Message Receied` , {MessageId , Body});


            //spinning up the docker image and inside that processing the ffmpeg code.  
            // when container starts , it will read the s3 bucket and key from the environment variables (and pass it tothe lambda function)

            //downloading the raw file and spawning ffmpeg as a child process
        } 
    }
}

main()