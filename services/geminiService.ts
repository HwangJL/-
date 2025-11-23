
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

const COMPOSITION_TYPES = [
  { key: 'center', label: '对称/中心构图', prompt: 'Symmetrical center composition, balanced and stable.' },
  { key: 'thirds', label: '三分法构图', prompt: 'Rule of thirds composition, subject off-center.' },
  { key: 'diagonal', label: '对角线动态', prompt: 'Diagonal lines composition, dynamic and energetic.' },
  { key: 'low_angle', label: '低角度仰拍', prompt: 'Low angle shot looking up, imposing and tall.' },
  { key: 'close_up', label: '情绪特写', prompt: 'Close-up shot, focus on emotion and details.' },
  { key: 'wide', label: '广角环境', prompt: 'Wide angle environmental shot, showing the scene scale.' },
];

/**
 * Generates 6 composition images and corresponding advice.
 */
export const generatePhotoGuide = async (
  sceneUrl: string,
  sceneDesc: string,
  numPeople: number,
  styleDesc: string
): Promise<{ image: string; advice: string; label: string }[]> => {
  const ai = getAiClient();
  
  const imagePart = await prepareImageForApi(sceneUrl);

  try {
    const promises = COMPOSITION_TYPES.map(async (type) => {
        // 1. Generate Image
        const imgPrompt = `Create a photorealistic composite image. ${type.prompt} Based on the provided scene. Add ${numPeople} model(s) wearing ${styleDesc}. Maintain the background details. High quality.`;
        
        const imgPromise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    imagePart,
                    { text: imgPrompt }
                ]
            }
        }).then(res => {
            for (const part of res.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
            }
            return null;
        }).catch(e => {
            console.error(`Error generating image for ${type.key}:`, e);
            return null;
        });

        // 2. Generate Advice
        // Expanded prompt for comprehensive photography advice
        const advicePrompt = `
          作为一名专业摄影师，请针对以下情况提供详细的中文拍摄指导。
          场景：${sceneDesc}
          人数：${numPeople}人
          风格：${styleDesc}
          构图方式：${type.label} (${type.prompt})
          
          请按以下格式清晰输出（包含emoji）：
          📍 **站位**：[简短具体的站位建议]
          💃 **动作**：[动作与表情指导]
          📐 **角度**：[推荐的拍摄角度与机位高度]
          💡 **光线**：[光线运用建议]
          🖼️ **构图**：[为什么要这样构图的技巧解析]

          保持语气专业且富有鼓励性，总字数控制在150字以内。
        `;
        
        const advicePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: advicePrompt }] }
        }).then(res => res.text || "暂无建议").catch(() => "暂无建议");

        const [img, advice] = await Promise.all([imgPromise, advicePromise]);
        
        return {
            image: img,
            advice: advice,
            label: type.label
        };
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(r => r.image !== null) as { image: string; advice: string; label: string }[];
    
    if (validResults.length === 0) {
        throw new Error("Failed to generate any composition images.");
    }
    return validResults;

  } catch (error) {
    console.error("Error generating compositions:", error);
    throw error;
  }
};
