import { SQSClient  , ReceiveMessageCommand , DeleteMessageCommand} from "@aws-sdk/client-sqs";
import {S3Client , PutObjectCommand , type PutObjectCommandInput} from "@aws-sdk/client-s3"
import type {S3Event} from "aws-lambda";
import { getSignedUrl} from '@aws-sdk/s3-request-presigner';
import cors from 'cors';
import express from 'express'
import * as dotenv from 'dotenv';

dotenv.config();


const app = express()
const PORT = process.env.PORT
app.use(express.json()); 
app.use(cors())

const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION } = process.env;

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !AWS_REGION) {
    throw new Error("Missing AWS Credentials in .env file");
}

const s3Client = new S3Client({ 
    region : AWS_REGION , 
    credentials : {
        accessKeyId : ACCESS_KEY_ID , 
        secretAccessKey : SECRET_ACCESS_KEY
    },
    requestChecksumCalculation: "WHEN_REQUIRED", 
    responseChecksumValidation: "WHEN_REQUIRED"
});


//get the object first and then check it ig 

app.post('/upload' , async (req , res) => {
    try{

        //we take the filename and content type from the user
        const {fileName , contentType} = req.body; 


        if (!fileName) {
            return res.status(400).json({ error: "fileName is required" });
        }


        const key = `video-uploads/${Date.now()}-${fileName}`

    
        const input : PutObjectCommandInput = {
        Bucket : process.env.BUCKET , 
        Key : key,
        ContentType : contentType
    };

    const response = new PutObjectCommand(input)

    const url = await getSignedUrl(s3Client , response as any  , {expiresIn : 3600})

    return res.status(200).json({
        uploadUrl : url , 
        key : key 
    })

    }


    catch(e) {
       console.error(`Error generating URL: ${e}`);
        res.status(500).json({ error: "Could not generate upload URL" });
    }
    
})


app.listen(PORT , () => {console.log(`Port is listening on ${PORT}`)})










