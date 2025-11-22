import 'dotenv/config'; 


const getGeminiResponse = async(prompt) => {
    try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role : "user" , 
                  parts: [{ text: prompt }]
                }
              ]
            })
          }
        );
    
        const data = await response.json();
        console.log(data.candidates[0].content.parts[0].text);
        return data.candidates[0].content.parts[0].text;
      } catch (err) {
        console.error(`Here is something errored: ${err}`);
        res.status(500).send("Error calling Gemini API");
      }
}

export default getGeminiResponse;