import { NextRequest, NextResponse } from "next/server";
import { generateTextResponse, generateImageAndTextResponse, ChatMessage } from "@/app/utils/gemini";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { messages, imageData, language = 'en', showStepByStep = true } = data;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    let response: string;
    
    // Add language and step-by-step preference to the prompt
    const lastMessageIndex = messages.length - 1;
    let enhancedPrompt = messages[lastMessageIndex].content;
    
    // Add step-by-step instruction if enabled
    if (showStepByStep) {
      enhancedPrompt += "\n\nPlease provide a detailed step-by-step explanation in your answer.";
    } else {
      enhancedPrompt += "\n\nPlease provide a concise answer without detailed steps.";
    }
    
    // Define languageMap outside the conditional block so it's available throughout the function
    const languageMap: {[key: string]: string} = {
      'bn': 'Bengali (Bangla)',
      'hi': 'Hindi',
      'ar': 'Arabic'
    };
    
    // Add language instruction if not English - make this more prominent in the prompt
    if (language !== 'en') {
      const languageName = languageMap[language] || language;
      enhancedPrompt = `IMPORTANT: Respond only in ${languageName} language.\n\n${enhancedPrompt}`;
    }
    
    // Create enhanced messages with our modified prompt
    const enhancedMessages = [...messages];
    enhancedMessages[lastMessageIndex] = {
      ...messages[lastMessageIndex],
      content: enhancedPrompt
    };

    // Add a system message to enforce language preference if not English
    if (language !== 'en') {
      enhancedMessages.unshift({
        role: 'user',
        content: `This conversation must be in ${languageMap[language] || language} language. Do not translate any response back to English.`
      });
    }

    if (imageData) {
      response = await generateImageAndTextResponse(enhancedMessages, imageData);
    } else {
      response = await generateTextResponse(enhancedMessages);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
} 