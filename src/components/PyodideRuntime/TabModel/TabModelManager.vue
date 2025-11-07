<template>
  <div>
    <n-button @click="() => (modelLoadModalShow = true)">加载模型</n-button>
    <!-- <n-button @click="refreshModelList">刷新模型列表</n-button> -->
    <n-data-table :bordered="false" :columns="modelColumns" :data="modelList" />
    <!-- 选择加载模型 -->
    <n-modal
      v-model:show="modelLoadModalShow"
      preset="dialog"
      title="加载模型"
      positive-text="确认"
      negative-text="取消"
      @positive-click="modelLoadCallback"
    >
      <n-alert title="提示" type="info"> 选择要加载的Hugging Face模型 </n-alert>
      <n-select v-model:value="modelLoadSelected" :options="modelOptions" placeholder="选择模型" />
    </n-modal>
    <!-- 聊天 -->
    <n-modal
      v-model:show="chatModalVisible"
      preset="dialog"
      title="与模型对话"
      :style="{ width: '600px' }"
    >
      <div class="chat-container" style="height: 400px; display: flex; flex-direction: column;">
        <!-- 聊天历史记录 -->
        <div class="chat-history" style="flex: 1; overflow-y: auto; padding: 16px;">
          <div
            v-for="(msg, index) in chatHistory"
            :key="index"
            :class="['message', msg.role]"
            style="margin-bottom: 12px;"
          >
            <n-text :type="msg.role === 'assistant' ? 'info' : 'primary'">
              {{ msg.role === 'assistant' ? '助手' : '我' }}:
            </n-text>
            <div class="message-content">{{ msg.content }}</div>
          </div>
        </div>
        <!-- 输入区域 -->
        <div class="chat-input" style="padding: 16px; border-top: 1px solid #eee;">
          <n-input-group>
            <n-input
              v-model:value="chatMessage"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              placeholder="输入消息..."
              :disabled="isGenerating"
              @keyup.enter.prevent="chatMessageSend"
            />
            <n-button
              type="primary"
              :disabled="isGenerating"
              @click="chatMessageSend"
            >
              {{ isGenerating ? '生成中...' : '发送' }}
            </n-button>
          </n-input-group>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { NButton, NAlert, NDataTable, NModal, NSelect, NInputGroup, NInput, NText, c } from "naive-ui";
import { h, ref, shallowRef, toValue, onMounted } from "vue";
import { log4TSProvider } from '@/components/Utils/Logger'
import { useModelManagerStore } from './ModelManager';
import { storeToRefs } from "pinia";

const logger = log4TSProvider.getLogger('PyodideRuntime.TabHuggingFaceManage')

const modelManagerStore = useModelManagerStore();

const { modelOptions } = storeToRefs(modelManagerStore);
const { loadModel, chatModelUse } = modelManagerStore;

// 模型管理面板
const modelColumns = ref([
  {
    title: '模型名称',
    key: 'modelName'
  },
  {
    title: '操作',
    key: 'modelActions',
    render(row: any) {
      return h('div', {
        style: 'display: flex; gap: 8px;'
      }, [
        // 聊天按钮
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => {
              chatModelShow(row.modelName)
            }
          },
          { default: () => '聊天' }
        ),
        // 原有的卸载按钮
        h(
          NButton,
          {
            size: 'small',
            onClick: () => {
              logger.info("卸载模型", row.modelName)
              // unloadModel(row.modelName)
            }
          },
          { default: () => '卸载' }
        )
      ])
    }
  }
])
const modelList = ref<any[]>([]);
// 模型加载
const modelLoadModalShow = ref(false)
const modelLoadSelected = ref<string | null>(null);
const modelLoadCallback = () => {
  if (modelLoadSelected.value) {
    logger.info(`加载模型: ${modelLoadSelected.value}`);
    loadModel(modelLoadSelected.value);
    modelList.value.push({ modelName: modelLoadSelected.value });
  }
}
// 聊天模态框相关
const chatModalVisible = ref(false);
const chatModelName = ref("");
const chatHistory = ref<{ role: string; content: string }[]>([]);
const chatMessage = ref("");
const isGenerating = ref(false);

const chatModelShow = (modelName: string) => {
  chatModalVisible.value = true;
  chatModelName.value = modelName;
  chatHistory.value = [
    { role: "assistant", content: `你好，我是${modelName}模型，有什么可以帮你的吗？` },
  ];
};

const chatMessageSend = () => {
  if (chatMessage.value.trim() === "" || isGenerating.value) return;
  
  chatHistory.value.push({ role: "user", content: chatMessage.value });
  const message = chatMessage.value;
  chatMessage.value = "";
  
  chatModelUse(chatModelName.value, JSON.parse(JSON.stringify(chatHistory.value)));
};

onMounted(() => {
  modelManagerStore.setMessageCallback((data) => {
    switch (data.status) {
      case 'start':
        isGenerating.value = true;
        chatHistory.value.push({ role: "assistant", content: "" });
        break;
        
      case 'update':
        const lastMessage = chatHistory.value[chatHistory.value.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content += data.output;
        }
        break;
        
      case 'complete':
        isGenerating.value = false;
        break;
    }
  });
});
</script>

<style scoped lang="scss">
.message {
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.message.user {
  background-color: #f0f9ff;
  margin-left: 20%;
}

.message.assistant {
  background-color: #f0fdf4;
  margin-right: 20%;
}

.message-content {
  margin-top: 4px;
  white-space: pre-wrap;
}
</style>