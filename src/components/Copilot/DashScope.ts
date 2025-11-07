/*
    通义千问文档： https://help.aliyun.com/zh/dashscope/developer-reference/use-qwen-by-api?spm=a2c4g.11186623.0.0.1a2917d9VKZi2F
 */
import OpenAI from 'openai'

const apiKey = window.QWEN_APIKEY || 'sk-fb16c52f3d814f0baa2ed0b5f76e3058'
const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: "http://localhost:4000/qwen-model-api/compatible-mode/v1",
    // baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    dangerouslyAllowBrowser: true
})
export const llm_chat = async (question, answer) => {
    const stream = await openai.chat.completions.create({
        messages: [{ role: 'user', content: question }],
        model: 'qwen-turbo',
        stream: true
    })
    for await (const chunk of stream) {
        answer.value += chunk.choices[0]?.delta?.content
    }
}
