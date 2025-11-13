import { defineStore } from 'pinia';
import { log4TSProvider } from '@/components/Utils/Logger';

const logger = log4TSProvider.getLogger('HFModelManager');

export const useModelManagerStore = defineStore('ModelManager', {
    state: () => {
        return {
          worker: null as Worker | null,
          modelOptions: [
            { label: 'DeepSeek-R1-Distill-Qwen-1.5B-ONNX', value: 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX' },
          ],
          messageCallback: null as ((data: any) => void) | null,
        }
    },
    actions: {
        initModelWorker() {
          if (!this.worker) {
            logger.info('创建worker');
            this.worker = new Worker(new URL('./HFModel-worker.js', import.meta.url), {
              type: 'module',
            })
            this.worker.postMessage({ type: 'check' });
            
            const onMessageReceived = (e: any) => {
              if (e.data.status === "progress") {
                return;
              }
              
              // 处理流式返回
              if (e.data.status === "start" || e.data.status === "update" || e.data.status === "complete") {
                if (this.messageCallback) {
                  this.messageCallback(e.data);
                }
              }
              
              console.log("Message received from worker", e.data);
            }
            
            const onErrorReceived = (e: any) => {
                console.error("Error received from worker", e);
            }
            
            this.worker.addEventListener("message", onMessageReceived);
            this.worker.addEventListener("error", onErrorReceived);
          }
        },
        
        setMessageCallback(callback: (data: any) => void) {
          this.messageCallback = callback;
        },

        loadModel(modelId: string) {
          logger.info(`加载模型: ${modelId}`);
          if (!this.worker) {
            logger.error('worker未初始化');
            return;
          }
          this.worker.postMessage({ type: 'load', data: { model_id: modelId } });
        },

        chatModelUse(modelId: string, messages: { role: string, content: string }[]) {
          logger.info(`发送消息给模型: ${modelId} ${messages}`);
          if (!this.worker) {
            logger.error('worker未初始化');
            return;
          }
          this.worker.postMessage({ type: 'generate', data: { model_id: modelId, messages } });
        }
    }
})