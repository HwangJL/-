
import { GoogleGenAI } from "@google/genai";

// Initialize the client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to convert various image sources (Data URL, Remote URL) to the format required by Gemini API.
 * Returns { inlineData: { data: string, mimeType: string } }
 */
const prepareImageForApi = async (imageUrl: string): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  // 1. Handle Data URLs
  if (imageUrl.startsWith('data:')) {
    const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return {
        inlineData: {
          mimeType: matches[1],
          data: matches[2]
        }
      };
    }
  }
  
  // 2. Handle Remote URLs (fetch and convert)
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const matches = base64data.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          resolve({
            inlineData: {
              mimeType: matches[1] || 'image/jpeg', // Fallback mime type
              data: matches[2]
            }
          });
        } else {
            reject(new Error('Failed to parse fetched image blob as base64'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error processing image URL for API:", error);
    throw new Error("Unable to process image source. Please try uploading an image instead of using a preset if this persists.");
  }
};

/**
 * Generates an image based on a text prompt (Scene or Style generation).
 */
export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Generates 3 composition images based on the scene and style.
 */
export const generateCompositions = async (
  sceneUrl: string,
  numPeople: number,
  styleDescription: string
): Promise<string[]> => {
  const ai = getAiClient();
  
  const imagePart = await prepareImageForApi(sceneUrl);
  
  // Define 3 variations of prompts for variety
  const prompts = [
    `Create a photorealistic composite image based on the provided scene. Add ${numPeople} model(s) wearing ${styleDescription}. Pose: Natural and casual standing pose. Maintain the background details.`,
    `Create a photorealistic composite image based on the provided scene. Add ${numPeople} model(s) wearing ${styleDescription}. Pose: Dynamic interaction with the environment (e.g. walking or sitting). Maintain the background details.`,
    `Create a photorealistic composite image based on the provided scene. Add ${numPeople} model(s) wearing ${styleDescription}. Pose: Artistic composition, close-up or interesting angle. Maintain the background details.`
  ];

  try {
    // Execute in parallel
    const promises = prompts.map(async (prompt) => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt }
                ]
            }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(url => url !== null) as string[];
    
    if (validResults.length === 0) {
        throw new Error("Failed to generate any composition images.");
    }
    return validResults;
  } catch (error) {
    console.error("Error generating compositions:", error);
    throw error;
  }
};

/**
 * Generates posing and composition advice based on text metadata.
 */
export const generateAdvice = async (sceneDesc: string, numPeople: number, styleDesc: string): Promise<string> => {
  const ai = getAiClient();
  
  const prompt = `
    作为一名专业摄影师，请根据以下信息提供拍摄建议：
    场景：${sceneDesc}
    人数：${numPeople}人
    风格：${styleDesc}
    
    请用中文给出：
    1. 针对此场景和风格的推荐站位。
    2. 具体的动作与表情指导。
    3. 提升照片氛围感的构图技巧。
    
    回答请简洁明了，语气专业亲切，不要超过200字。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt }
        ]
      }
    });

    return response.text || "暂无建议";
  } catch (error) {
    console.error("Error generating advice:", error);
    return "抱歉，生成建议时出现错误。建议您根据光线和场景自然调整站位。";
  }
};
