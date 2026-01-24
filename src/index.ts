import { SQSClient  , ReceiveMessageCommand , DeleteMessageCommand} from "@aws-sdk/client-sqs";
import type {S3Event} from "aws-lambda"
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
        try{
            for (const message of Messages){
            const { MessageId , Body} = message;
            console.log(`Message Receied` , {MessageId , Body});
            
            //validating the message 
            if(!Body) continue;
            const event = JSON.parse(Body) as S3Event; 

           if(event.Records?.length) {
            if((event as any).Event == "s3:TestEvent"){
                console.log("received the s3 test even . this needs to be ignored")
                continue;
            }

            console.log(`received empty or unknown event structure`)
            return;
           }

           for (const record of event.Records){
            const {eventName , s3} = record;
            const {bucket , object : {
                key 
            }} = s3
           }

           // now we need to spin up the docker container



        } 
        }
        catch(error){
            console.log(error);
        }

      
    }
}


// in traditional code you would usually write while(true) loop to poll sqs . but here we dont need to do that 

// pollers use the same receive api i used , but they run on aws internal servers , when they find a message they bundle them into a json object 
// and then this object is directly pushed inside the event 


//event --> this is the whole wrapper 
//.Records is an array because aws might pick up 10 messages at once 
// [0].body --> this is the acutal string that is put into the queue 








export const handler = async(event : any ) => {
    //first of you dont need to get the client 

    for (const record of event.Records){

    }
}

{"Records":
    [{"eventVersion":"2.1",
        "eventSource":"aws:s3",
        "awsRegion":"us-east-1",
        "eventTime":"2026-01-21T11:24:42.212Z",
        "eventName":"ObjectCreated:Put",
        "userIdentity":{"principalId":"A3OGR1BI53RX6N"},
        "requestParameters":{"sourceIPAddress":"223.181.104.219"},"responseElements":{"x-amz-request-id":"YEG5KH4AS5VR7EEX","x-amz-id-2":"1lvWj6SSGdsZKvJW4YLd9tE6vsZ5JRqQiH7noILNf6mY01Y26uPYk23BCDmsC6zi64TnNsYKES4HSjTi0a/iCSvhm8cm+pvP"},
        "s3":{ 
            "s3SchemaVersion":"1.0",
            "configurationId":"addingsqsins3bucket",
            "bucket":{"name":"transcoding-videos.goarya.dev",
                "ownerIdentity":{"principalId":"A3OGR1BI53RX6N"},"arn":"arn:aws:s3:::transcoding-videos.goarya.dev"},
                "object":{
                    "key":"test1.mp4",
                    "size":3034946,
                    "eTag":"21f5a5308bb4af429e44408713f81371","sequencer":"006970B77A23F9637D"
                }
        }}]

}









// we need a object storage 
// aws account -> s3 service --> simple storage service 
// we have buckets in this simple storage service
// we store user's data inside it 
