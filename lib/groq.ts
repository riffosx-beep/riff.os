export async function generateAIResponse(
    systemPrompt: string,
    userPrompt: string
): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured')
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.75,
            max_tokens: 8000,
            response_format: { type: 'json_object' },
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Groq API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
}

export async function generateStructuredResponse<T>(
    systemPrompt: string,
    userPrompt: string,
    schemaDescription: string
): Promise<T> {
    const jsonPrompt = `${systemPrompt}\n\nIMPORTANT: You must output ONLY valid JSON matching this structure: ${schemaDescription}. Do not include any text outside the JSON object.`

    const content = await generateAIResponse(jsonPrompt, userPrompt)

    try {
        return JSON.parse(content) as T
    } catch (e) {
        console.error('Failed to parse AI response:', content)
        throw new Error('AI response was not valid JSON')
    }
}
