import React, { useState, type ChangeEvent } from 'react';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const BACKEND_URL = "https://bc1opubda1.execute-api.us-east-1.amazonaws.com/upload";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const uploadToS3 = async () => {
    if (!file) return alert("Please select a file first!");

    try {

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type
        })
      });
      console.log(file.type)

      const { uploadUrl } = await response.json();

      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { "Content-Type": file.type }
      });

      if (s3Response.ok) {
        console.log("Upload successful! S3 is now notifying SQS...");
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadToS3}>Upload Video</button>
    </div>
  );
}

