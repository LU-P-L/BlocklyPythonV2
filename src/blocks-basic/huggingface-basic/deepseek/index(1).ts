import { ref } from "vue";

import { env } from '@huggingface/transformers';
env.cacheDir = '~/models/';

let worker = ref<Worker | null>(null);
if (!worker.value) {
    console.log("Creating worker");
    worker.value = new Worker(new URL("./deepseek-r1-worker.js", import.meta.url), {
      type: "module",
    });
    console.log("Worker created");
    console.log(worker.value);
    worker.value.postMessage({ type: "check" }); // Do a feature check
}
const onMessageReceived = (e: any) => {
    if (e.data.status === "progress") {
        // console.log("Worker feature check", e.data);
        return;
    } else {
        console.log("Message received from worker", e.data);
    }
}
const onErrorReceived = (e: any) => {
    console.error("Error received from worker", e);
}
worker.value.addEventListener("message", onMessageReceived);
worker.value.addEventListener("error", onErrorReceived);
worker.value.postMessage({ type: "load" });
export const dsSendMessage = () => {
    worker.value.postMessage({ type: "generate", data: [{ role: "user", content: "你是谁？" }] })
}
