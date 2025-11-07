import './assets/main.css'

import {createApp, defineAsyncComponent} from 'vue'
import { createPinia } from 'pinia'
import {log4TSProvider} from "@/components/Utils/Logger";
import router from './router'

if (import.meta.env.MODE === 'development') {
    const App = defineAsyncComponent(() =>
        import("./App.vue")
    )
    const app = createApp(App)
    app.use(createPinia())
    router.addRoute({ path: '/', name: 'home', component: () => import('@/views/BasicAllView.vue') })
    router.addRoute({ path: '/llm', component: () => import('@/views/BasicAllView.vue') })
    router.addRoute({ path: '/py', component: () => import('@/views/BasicPyView.vue') })
    router.addRoute({ path: '/tf', component: () => import('@/views/BasicTfView.vue') })
    app.use(router)
    app.mount('#app')
} else if (import.meta.env.MODE === 'prod-py') {
    const App = defineAsyncComponent(() =>
        import("./views/BasicPyView.vue")
    )
    const app = createApp(App)
    app.use(createPinia())
    router.addRoute({ path: '/', name: 'home', component: () => import('./views/BasicPyView.vue') })
    app.use(router)
    app.mount('#app')
} else if (import.meta.env.MODE === 'prod-tf') {
    const App = defineAsyncComponent(() =>
        import("./views/BasicTfView.vue")
    )
    const app = createApp(App)
    app.use(createPinia())
    router.addRoute({ path: '/', name: 'home', component: () => import('./views/BasicTfView.vue') })
    app.use(router)
    app.mount('#app')
}
const logger = log4TSProvider.getLogger('Main')
logger.info(`blockly-python项目，UI-CORE-VERSION: ${__APP_VERSION__} \nProjectManager: LiYue \nAuthor: ChrisJaunes、wxp0502、cindyismeaooo、starkingd(HuangGuoMing); `)
logger.info(`版本到期时间为: ${new Date(1731194687305 + 5 * 30 * 24 * 60* 60 * 1000).toLocaleDateString()}, 请到期前及时升级` )