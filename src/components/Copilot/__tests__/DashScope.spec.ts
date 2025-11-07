import { describe, it, expect, test } from 'vitest'

import {llm_chat} from '../DashScope'
import {ref} from "vue";

test('Chat', async () => {
    const llmUnderstandAnswerText = ref<string>('')
    await llm_chat("你是谁？", llmUnderstandAnswerText)
    console.log(llmUnderstandAnswerText)
    expect(1 + 2).toBe(3)
})