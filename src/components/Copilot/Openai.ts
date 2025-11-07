import OpenAI from 'openai'

const apiKey = window.OPENAI_APIKEY || 'sk-fb16c52f3d814f0baa2ed0b5f76e3058'
const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
})
export const llm_chat = async (question, answer) => {
    const stream = await openai.chat.completions.create({
        messages: [{ role: 'user', content: question }],
        model: 'gpt-3.5-turbo',
        stream: true
    })
    for await (const chunk of stream) {
        answer.value += chunk.choices[0]?.delta?.content
    }
}