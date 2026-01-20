awss3bucket -> https://us-east-1.console.aws.amazon.com/s3/buckets/transcoding-videos.goarya.dev?region=us-east-1&tab=objects

sqsqueue -> https://us-east-1.console.aws.amazon.com/sqs/v3/home?region=us-east-1#/queues/https%3A%2F%2Fsqs.us-east-1.amazonaws.com%2F391755178883%2Ftranscodings3bucket


 


 // hey s3 if there is an obejct that is uploaded to you , please upload that in 


 arn:aws:s3:::transcoding-videos.goarya.dev



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