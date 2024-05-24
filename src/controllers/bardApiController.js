const { DiscussServiceClient } = require('@google-ai/generativelanguage');
const { GoogleAuth } = require('google-auth-library');

const MODEL_NAME = "models/chat-bison-001";
const API_KEY = process.env.BARD_API_KEY;

const client = new DiscussServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});



const bardApiHandler = async(req, res) => {
    try {
        if(!req.query.ques){
            return res.status(400).json({ message: "bad request" });
        }
        console.log("Ai Bot Recieved Msg");
        let messages = [{ content: req.query.ques }];
        

        try {
            const result = await new Promise((resolve, reject) => {
                client.generateMessage({
                    // required, which model to use to generate the result
                    model: MODEL_NAME,
                    // optional, 0.0 always uses the highest-probability result
                    temperature: 0.25,
                    // optional, how many candidate results to generate
                    candidateCount: 1,
                    // optional, number of most probable tokens to consider for generation
                    top_k: 40,
                    // optional, for nucleus sampling decoding strategy
                    top_p: 0.95,
                    prompt: {
                        messages: messages,
                    },
                    }).then(result => {
                        resolve(result);
                    }).catch((error) => {
                        reject(error);
                    })
            });
            
            // console.log("First Response:", result[0].candidates[0]?.content);

            messages.push({ content: result[0].candidates[0]?.content });
            // console.log(JSON.stringify(result, null, 2));
            res.status(200).json({ resp: messages })

        } catch (error) {
            console.error("BARD API error:", error);
            res.status(210).json({ message: "No Response" });  
        }
  
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" }); 
    }
}

module.exports = {bardApiHandler};