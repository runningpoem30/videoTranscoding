import { PutObjectCommand , GetObjectCommand } from "@aws-sdk/client-s3"
import {s3Client} from "../lib/s3-utils.js"
import fs from "fs" ; 
import path from "path";
import { Readable } from "stream";
import { spawn } from "child_process";


async function downloadFromS3(bucket : string , key : string , destination : string ){
    const command = new GetObjectCommand({Bucket : bucket , Key : key});
    const response = await s3Client.send(command)

    const stream  = response.Body as Readable;
    return new Promise((resolve , reject) => {
        const fileWriter = fs.createWriteStream(destination);
        stream.pipe(fileWriter);
        fileWriter.on('finish' , resolve) ; 
        fileWriter.off('error' , reject);
    })

}



async function transcodingRawS3Video(inputPath : string , outputDir : string){
  const ffmpeg = spawn('ffmpeg' , [
    'i' , inputPath , 
    '-filter_complex' , '[0:v]split=5[v1][v2][v3][v4][v5]; [v1]scale=-2:1080[vout]; [v2]scale=-2:720[vout]; [v3]scale=-2:480[vout]; [v4]scale=-2:360[vout]; [v5]scale=-2:240'

  ])
}



async function uploadToS3(bucket : string , key : string){

}


//m3u8 is nothing but a text file , it gives instruction to the browser and video plaer what files to download and in what order nothing else