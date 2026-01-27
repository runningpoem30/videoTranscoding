import {GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../lib/s3-utils.js";
import { spawn } from 'child_process';
import fs from 'fs';
import { Readable } from 'stream';
import path from 'path';


// i need to download the video from the s3 bucket first and then pass it to the container to the main transcoding engine 
async function downloadFromS3(bucket:string , key:string , localPath : string){
    const command = new GetObjectCommand({Bucket : bucket , Key : key});
    const response = await s3Client.send(command);
    const stream = response.Body as Readable ; 

    return new Promise((resolve , reject) => {
        const writer = fs.createWriteStream(localPath);
        stream.pipe(writer);
        writer.on('finish' , resolve);
        writer.off('error' , reject)
    })
}

// transcoding the videos
async function transcodeAllResolutions(inputPath: string, outputDir: string) {
    return new Promise((resolve, reject) => {
        const args = [
            '-i', inputPath,
            '-filter_complex', 
            // 1. Split the input into 5 streams, 2. Scale each stream
            '[0:v]split=5[v1][v2][v3][v4][v5];' + // taking the first input video stream and splitting it into 3 identical virtual copies 
           
            '[v1]scale=-2:1080[v1out];' + // take v1 and scale it to 1080p height 

            '[v2)scale=-2:720[v2out];' +
            '[v3]scale=-2:480[v3out];' +
            '[v4]scale=-2:360[v4out];' +
            '[v5]scale=-2:240[v5out]',
            
            
            '-map', '[v1out]', '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast', path.join(outputDir, '1080p.mp4'),
            '-map', '[v2out]', '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast', path.join(outputDir, '720p.mp4'),
            '-map', '[v3out]', '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast', path.join(outputDir, '480p.mp4'),
            '-map', '[v4out]', '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast', path.join(outputDir, '360p.mp4'),
            '-map', '[v5out]', '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast', path.join(outputDir, '240p.mp4'),
            
            // Map audio to all outputs (stream copy to save CPU)
            '-map', '0:a', '-c:a', 'aac', '-b:a', '128k', 
            '-y' // Overwrite existing
        ];

        const ffmpeg = spawn('ffmpeg', args);

        ffmpeg.stderr.on('data', (data) => {
            console.log(`FFmpeg: ${data}`);
        });

        ffmpeg.on('close', (code) => {
            code === 0 ? resolve(true) : reject(new Error(`Exit code ${code}`));
        });
    });
}


