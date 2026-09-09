export class AIClient {
    constructor(apiKey) {
        this.apiKey = apiKey || localStorage.getItem('gemini_api_key') || localStorage.getItem('GEMINI_API_KEY') || '';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }

    async generatePresentation(topic) {
        const fullPrompt = `Создай красивую презентацию на тему: "${topic}". Придумай структуру, сделай текст для слайдов интересным. Около 5-8 слайдов.`;
        
        const systemInstruction = `Вы — эксперт по созданию презентаций. 
Ответьте ТОЛЬКО валидным JSON без маркдаун оберток. Соблюдайте следующую структуру строго:
{
  "title": "Название презентации",
  "theme": {
    "backgroundColor": "#ffffff",
    "textColor": "#000000",
    "accentColor": "#38bdf8"
  },
  "slides": [
    {
      "layout": "title-content", // Варианты: title, title-content, two-columns, image-right, image-left
      "title": "Заголовок",
      "content": "Текст слайда (используйте <br> для переноса строк)",
      "list": ["Пункт 1", "Пункт 2"],
      "imageIdea": "Краткое описание для картинки, если layout содержит image"
    }
  ]
}
Обязательно включите поле slides как массив объектов.`;

        const requestBody = {
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: { 
                temperature: 0.7, 
                responseMimeType: "application/json" 
            }
        };

        const data = await this._fetchGemini(requestBody);
        
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Safety parsing in case Gemini ignores responseMimeType
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
            rawText = rawText.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(rawText);
        if (!parsed || !Array.isArray(parsed.slides)) {
            throw new Error('ИИ вернул неверный формат структуры презентации.');
        }

        return parsed;
    }

    async editContent(context, instruction) {
        const systemInstruction = `Вы — AI ассистент в редакторе презентаций.
Помогите пользователю улучшить, сократить или перевести текст.
Отвечайте кратко, профессионально и по сути, без лишних вступлений, верните только результат.`;

        const requestBody = {
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: `Контекст: ${context}\nЗапрос: ${instruction}` }] }],
            generationConfig: { temperature: 0.7 }
        };

        const data = await this._fetchGemini(requestBody);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    async _fetchGemini(body) {
        const res = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            throw new Error(res.status === 400 || res.status === 403 
                ? 'Неверный API ключ или доступ запрещен' 
                : `Ошибка сети: ${res.status}`);
        }

        return await res.json();
    }
}
