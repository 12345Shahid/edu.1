import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variables
const API_KEY = process.env.GOOGLE_API_KEY || "";

if (!API_KEY) {
  console.warn("GOOGLE_API_KEY is not defined in environment variables");
}

// Initialize the API
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  files?: string[];
}

export async function generateTextResponse(messages: ChatMessage[]) {
  try {
    // Create a chat session
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
    });

    // Generate response
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error generating text response:", error);
    throw error;
  }
}

export async function generateImageAndTextResponse(messages: ChatMessage[], imageBase64: string) {
  try {
    // For image content, we need to use the vision model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Get the last message
    const lastMessage = messages[messages.length - 1];
    
    // Create a prompt that includes both text and image
    const prompt = {
      contents: [
        {
          role: "user",
          parts: [
            { text: lastMessage.content || "What's in this image?" },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }
      ]
    };
    
    // Generate content with the image
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error generating response with image:", error);
    throw error;
  }
} 