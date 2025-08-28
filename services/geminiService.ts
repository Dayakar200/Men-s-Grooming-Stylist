import { GoogleGenAI, Type } from "@google/genai";
import { StyleOptions, FaceShapeAnalysisResult, Hairstyle, BeardStyle } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This service is updated to accept the user's image to create an identity-preserving "after" image.
export const generateStyledImage = async (
  userImage: string, // The user's photo as a base64 data URL
  options: StyleOptions
): Promise<string> => {
  const { hairstyle, beardStyle, colorPrompt, textPrompt, referenceImage } = options;

  // Step 1: Analyze the user's face from their photo to preserve their identity.
  let identityPrompt = 'A photorealistic, front-facing studio portrait of a man. ';
  try {
    const userImagePart = {
      inlineData: {
        data: userImage.split(',')[1],
        mimeType: userImage.match(/data:(image\/.+?);/)?.[1] || 'image/jpeg',
      },
    };
    const identityTextPart = {
      text: "Analyze the person in this image. Describe their key facial features like face shape, skin tone, eye color, age range, and ethnicity. This description will be used to generate a new image of the same person. Be concise and descriptive. For example: 'A man in his late 20s with a square jaw, olive skin tone, and dark brown eyes'.",
    };
    const identityResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [userImagePart, identityTextPart] },
    });
    identityPrompt = `Create a photorealistic, front-facing studio portrait of a person who matches this description: "${identityResponse.text}". `;
  } catch (error) {
    console.error("Error analyzing user image for identity:", error);
    // Fallback to a generic prompt if analysis fails
  }

  // Step 2: Analyze the reference image for style inspiration (if provided).
  let referencePrompt = '';
  if (referenceImage) {
    try {
      const imagePart = {
        inlineData: {
          data: referenceImage.split(',')[1],
          mimeType: referenceImage.match(/data:(image\/.+?);/)?.[1] || 'image/jpeg',
        },
      };
      const textPart = {
        text: "Describe the hairstyle and beard style in this image in a concise and detailed manner, suitable as a prompt for an image generation AI. For example: 'A man with a high fade pompadour and a short boxed beard'.",
      };
      const visionResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, textPart] },
      });
      referencePrompt = visionResponse.text;
    } catch (error) {
        console.error("Error analyzing reference image:", error);
        referencePrompt = ''; 
    }
  }

  // Step 3: Construct the final, detailed prompt.
  let prompt = identityPrompt;
  
  if (referencePrompt) {
    prompt += `His style should be based on this description: "${referencePrompt}". `;
  }

  if (hairstyle !== 'None') {
    prompt += `The hairstyle is specifically a ${hairstyle.toLowerCase()}. `;
  }
  if (beardStyle !== 'None') {
    prompt += `The beard style is specifically a ${beardStyle.toLowerCase()}. `;
  } else if (hairstyle !== 'None') {
    prompt += `He is clean-shaven. `;
  }

  if (colorPrompt) {
    prompt += `The hair color must be ${colorPrompt.toLowerCase()}. `;
  }

  if (textPrompt) {
    prompt += `Follow these additional instructions: "${textPrompt}". `;
  }

  prompt += "The lighting should be professional and even. The background must be a neutral gray. The final image should be hyper-realistic and high-resolution, ensuring the person's identity from the original photo is preserved."

  // Step 4: Generate the final image.
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated. The response may have been blocked.");
    }
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    throw new Error("Failed to generate styled image. Please check the console for details.");
  }
};


const faceShapeAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    faceShape: { type: Type.STRING, description: "The detected face shape (e.g., Oval, Square, Round)." },
    description: { type: Type.STRING, description: "A brief, neutral description of the person's key facial features (e.g., 'A man in his 20s with sharp cheekbones, a defined jawline, and light brown hair.')." },
    reasoning: { type: Type.STRING, description: "Brief reasoning for the face shape classification." },
    recommendations: {
      type: Type.ARRAY,
      description: "A list of suitable style recommendations.",
      items: {
        type: Type.OBJECT,
        properties: {
          hairstyle: { type: Type.STRING, enum: Object.values(Hairstyle), description: "The recommended hairstyle." },
          beardStyle: { type: Type.STRING, enum: Object.values(BeardStyle), description: "The recommended beard style." },
          reason: { type: Type.STRING, description: "Why this style combination is recommended for the detected face shape." }
        },
        required: ["hairstyle", "beardStyle", "reason"]
      }
    }
  },
  required: ["faceShape", "description", "reasoning", "recommendations"]
};


export const analyzeFaceShape = async (userImage: string): Promise<FaceShapeAnalysisResult> => {
  const imagePart = {
    inlineData: {
      data: userImage.split(',')[1],
      mimeType: userImage.match(/data:(image\/.+?);/)?.[1] || 'image/jpeg',
    },
  };

  const prompt = `Analyze the user's face in the provided image. Determine their face shape (e.g., Oval, Square, Round, Heart, Diamond). Provide a neutral, objective description of their key features. Then, recommend 3-4 hairstyle and beard combinations that would complement their face shape. For each recommendation, provide a brief reason. Return the entire analysis in a JSON object that conforms to the provided schema. Do not include any markdown or commentary outside of the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: faceShapeAnalysisSchema,
      }
    });
    
    const resultJson = response.text;
    const result = JSON.parse(resultJson);
    
    if (result && result.faceShape && result.recommendations) {
        return result as FaceShapeAnalysisResult;
    } else {
        throw new Error("AI response did not match the expected format.");
    }

  } catch (error) {
    console.error("Error analyzing face shape with Gemini:", error);
    throw new Error("Failed to analyze face shape. The AI model may be temporarily unavailable or the request was blocked.");
  }
};
