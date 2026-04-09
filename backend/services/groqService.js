import Groq from 'groq-sdk';

let groq;

function getClient() {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

const SYSTEM_PROMPT = `You are Sage — a thoughtful, knowledgeable AI assistant with a calm, nature-inspired personality. 

Your traits:
- Wise but approachable, like a wise forest sage
- Clear, well-structured responses using markdown when helpful
- Honest about uncertainty, never fabricating facts
- Warm and encouraging without being sycophantic
- When analyzing images, describe them thoroughly and answer questions about them precisely

When you have retrieved context from the conversation history (RAG context), use it to give more accurate, contextually aware answers. Always prioritize this context when relevant.

Format your responses beautifully:
- Use **bold** for key terms
- Use bullet points and numbered lists when listing things
- Use code blocks for any code
- Use headers (##) for long structured answers
- Keep responses concise unless depth is needed`;

// Text + optional RAG context chat
export async function chatWithGroq(messages, ragContext = []) {
  const client = getClient();

  let systemWithRAG = SYSTEM_PROMPT;
  if (ragContext.length > 0) {
    systemWithRAG += `\n\n--- RELEVANT CONTEXT FROM CONVERSATION HISTORY (RAG) ---\n${ragContext.join('\n\n')}\n--- END CONTEXT ---`;
  }

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemWithRAG },
      ...messages
    ],
    max_tokens: 2048,
    temperature: 0.7,
    stream: false
  });

  return completion.choices[0].message.content;
}

// Vision: analyze image with text prompt
export async function analyzeImageWithGroq(base64Image, mimeType, userText, conversationMessages = []) {
  const client = getClient();

  const visionMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationMessages.slice(-6), // recent context
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`
          }
        },
        {
          type: 'text',
          text: userText || 'Please analyze this image and describe what you see in detail.'
        }
      ]
    }
  ];

  const completion = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: visionMessages,
    max_tokens: 1024,
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}

// Generate a chat title
export async function generateTitle(firstMessage) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'Generate a very short (3-5 words max) title for a chat that starts with this message. Only output the title, nothing else.' },
      { role: 'user', content: firstMessage }
    ],
    max_tokens: 20,
    temperature: 0.5
  });
  return completion.choices[0].message.content.trim().replace(/["']/g, '');
}
