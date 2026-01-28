import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { s3Client } from "../lib/s3-utils.js"
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { spawn } from "child_process";


async function downloadFromS3(bucket: string, key: string, destination: string) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command)

    const stream = response.Body as Readable;
    return new Promise((resolve, reject) => {
        const fileWriter = fs.createWriteStream(destination);
        stream.pipe(fileWriter);
        fileWriter.on('finish', resolve);
        fileWriter.off('error', reject);
    })

}



async function transcodingRawS3Video(inputPath: string, outputDir: string) {

    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-i', inputPath,

            '-filter_complex',
            '[0:v]split=5[v1][v2][v3][v4][v5];' +
            '[v1]scale=-2:1080[v1out];' +
            '[v2]scale=-2:720[v2out];' +
            '[v3]scale=-2:480[v3out];' +
            '[v4]scale=-2:360[v4out];' +
            '[v5]scale=-2:240[v5out]',

            '-map', '[v1out]', '-c:v:0', 'libx264', '-b:v:0', '5000k',
            '-map', '[v2out]', '-c:v:1', 'libx264', '-b:v:1', '2800k',
            '-map', '[v3out]', '-c:v:2', 'libx264', '-b:v:2', '1400k',
            '-map', '[v4out]', '-c:v:3', 'libx264', '-b:v:3', '1000k',
            '-map', '[v5out]', '-c:v:4', 'libx264', '-b:v:4', '800k',

            '-map', '0:a', '-c:a', 'aac', '-b:a', '128k',

            '-f', 'hls',
            '-hls_time', '10',
            '-hls_playlist_type', 'vod',
            '-master_pl_name', 'master.m3u8',
            '-var_stream_map', 'v:0,a:0 v:1,a:0 v:2,a:0 v:3,a:0 v:4,a:0',
            '-hls_segment_filename', `${outputDir}/v%v/segment_%03d.ts`,
            `${outputDir}/v%v/index.m3u8`,
        ]);
        ffmpeg.on('close', (code) => {
            if (code === 0) resolve(null);
            else reject(`ffmpeg failed withc code${code}`)
        })
    })
}


async function uploadFolderToS3(localDirPath: string, s3Bucket: string, s3Prefix: string) {
    const items = fs.readdirSync(localDirPath);

    for (const item of items) {
        const localPath = path.join(localDirPath, item);
        const s3Key = path.join(s3Prefix, item);

        if (fs.statSync(localPath).isDirectory()) {

            await uploadFolderToS3(localPath, s3Bucket, s3Key);
        } else {

            const fileStream = fs.createReadStream(localPath);
            await s3Client.send(new PutObjectCommand({
                Bucket: s3Bucket,
                Key: s3Key,
                Body: fileStream,

                ContentType: s3Key.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/MP2T'
            }));
        }
    }
}


async function run() {
    const BUCKET = process.env.S3_BUCKET!;
    const KEY = process.env.S3_KEY!;
    const DEST_BUCKET = process.env.DEST_BUCKET!;

    const inputPath = '/tmp/input_video.mp4';
    const outputDir = '/tmp/output';

    try {
        // Create output directory and variant subdirectories for HLS segments
        fs.mkdirSync(outputDir, { recursive: true });
        for (let i = 0; i < 5; i++) {
            fs.mkdirSync(`${outputDir}/v${i}`, { recursive: true });
        }

        console.log("Stage 1: Downloading...");
        await downloadFromS3(BUCKET, KEY, inputPath);

        console.log("Stage 2: Transcoding...");
        await transcodingRawS3Video(inputPath, outputDir);


        console.log("Stage 3: Uploading to new bucket...");

        const folderName = path.parse(KEY).name;
        await uploadFolderToS3(outputDir, DEST_BUCKET, `processed/${folderName}`);

        console.log("SUCCESS: Video is now live!");
    } catch (err) {
        console.error("FAILED:", err);
        process.exit(1);
    }
}

run();