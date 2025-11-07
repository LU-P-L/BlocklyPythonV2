import {llm_chat as qwen_chat} from './DashScope'
import {llm_chat as gpt3_chat} from './Openai'

export default (model_name: any)=> {
    if(model_name === 'qwen') {
        return qwen_chat
    } else {
        return gpt3_chat
    }
}