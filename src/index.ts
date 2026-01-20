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


// this code is basically traditionally writtein 
// i need to convert this to a serverless


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

main()


/// in a non serverless architecture , i will have to do the following things :
// server kleba padega
// os install 
// deployments
// scale up and scale down 
// scaling up 
// pricing per hour 
// website is still running so ill keep getting charged 




// serverless me 
// tum bas code likho 
// you dont have to worry about infrastructure 
// amazon will decide everything 
// i dont have to worry about anything 
// i dont have a server . i just have to code 
// isme rate per invocation hota hai 
// jab ek user aayega iss par ---> jab api call karega ---> aws mera code ko start karega --> line by line execute karega and then sleep ho jayega
// scaling isme automatic hoti hai 
// code sleep state me hoga ;
// agar 1000 users aagye , mere code ke multiple copies bna dega , bahot sarae functions parallely execute hone lagega 
// then again sleep state me chala jayega 


// drawbacks 
// this is stateless 
// cold start this is slow 

 





