import type { Listing } from '../types/Listing';

interface GeminiGenerateRequest {
  price: number;
  condition: Listing['condition'];
  imageDataUrl: string;
  furnitureType?: string;
  location?: string;
}

interface GeminiGenerateResult {
  title: string;
  description: string;
}

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiErrorPayload {
  error?: {
    message?: string;
  };
}

interface GeminiGeneratePayload extends GeminiErrorPayload {
  candidates?: GeminiCandidate[];
}

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const parseImageDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !match[1] || !match[2]) {
    throw new Error(
      'Uploaded image is invalid. Please upload or retake the photo and try again.',
    );
  }

  return {
    mimeType: match[1],
    data: match[2],
  };
};

const stripJsonFences = (text: string) =>
  text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

const parseModelOutput = (text: string): GeminiGenerateResult => {
  const cleanedText = stripJsonFences(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanedText);
  } catch {
    throw new Error('Gemini returned an unexpected response format. Please try again.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  const result = parsed as Partial<GeminiGenerateResult>;
  const title = result.title?.trim();
  const description = result.description?.trim();

  if (!title || !description) {
    throw new Error('Gemini response is missing title or description. Please try again.');
  }

  return { title, description };
};

const buildPrompt = (payload: GeminiGenerateRequest): string => {
  const furnitureType = payload.furnitureType?.trim() || 'unspecified furniture type';
  const location = payload.location?.trim() || 'unspecified location';

  return `You are writing a DormDeals marketplace listing for college students.
Create an attractive, clear title and description based on the image and metadata.

Listing details:
- Furniture type: ${furnitureType}
- Condition: ${payload.condition}
- Price: $${payload.price.toFixed(2)}
- Location: ${location}

Output requirements:
- Return valid JSON only.
- Use this exact schema: {"title": string, "description": string}
- Title: 4-12 words, specific and appealing.
- Description: 2-4 short sentences, mention value, condition, and practical details visible from the image.
- Do not include markdown or code fences.`;
};

export async function generateListingCopyFromImage(
  payload: GeminiGenerateRequest,
): Promise<GeminiGenerateResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'Gemini API key is missing. Add VITE_GEMINI_API_KEY to .env.local and restart the app.',
    );
  }

  const image = parseImageDataUrl(payload.imageDataUrl);

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: buildPrompt(payload),
            },
            {
              inlineData: {
                mimeType: image.mimeType,
                data: image.data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        mediaResolution: 'MEDIA_RESOLUTION_MEDIUM',
      },
    }),
  });

  if (!response.ok) {
    let errorMessage = `Gemini request failed with status ${response.status}.`;
    try {
      const errorPayload = (await response.json()) as GeminiErrorPayload;
      if (errorPayload.error?.message) {
        errorMessage = errorPayload.error.message;
      }
    } catch {
      // Keep default fallback message when non-JSON error body is returned.
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as GeminiGeneratePayload;
  const responseText =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text?.trim())
      .filter((text): text is string => Boolean(text))
      .join('\n') ?? '';

  if (!responseText) {
    throw new Error('Gemini returned no text output. Please try again.');
  }

  return parseModelOutput(responseText);
}
