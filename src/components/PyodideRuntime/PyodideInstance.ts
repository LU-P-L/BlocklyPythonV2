import { defineStore } from 'pinia'
import { loadPyodide, type PyodideInterface } from "pyodide";
import { log4TSProvider } from "@/components/Utils/Logger";
import { s0aDaLC2h8eNcTk } from '@/components/S0aDaLC2h8eNcTk';
import type { PyodidePackageInfo, StdInputCallback, StdOutputCallback, StdErrorCallback } from './PyodideRuntimeTypes';
import type { TreeOption } from 'naive-ui';

const logger = log4TSProvider.getLogger("PyodideInstance")

export const usePyodideInstanceStore = defineStore('pyodideInstance', {
    state: () => ({
        pyodide: null as PyodideInterface | null,
        pyodideStdInputFactory: () => (() => prompt()),
        pyodideStdOutputFactory: () => ((output: string) => { logger.info("标准输出", output) }),
        pyodideStdErrorFactory: () => ((error: string) => { logger.info("标准错误", error) }),
        isInitialized: false
    }),

    getters: {
        isPyodideReady(): boolean {
            return this.isInitialized && this.pyodide !== null;
        }
    },

    actions: {
        async initPyodide(pyodide_path: string) {
            try {
                logger.info(`初始化pyodide: ${pyodide_path}`);
                this.pyodide = await loadPyodide({
                    indexURL: pyodide_path
                });
                
                // 创建必要的文件系统目录
                this.pyodide.FS.mkdirTree('/data/local');
                this.pyodide.FS.mkdirTree('/data/mount');
                
                this.isInitialized = true;
                logger.info('Pyodide初始化成功');
            } catch (error) {
                logger.error('Pyodide初始化失败:', error);
                throw error;
            }
        },

        async installPackage(package_name: string): Promise<void> {
            if (!this.isPyodideReady) {
                throw new Error('Pyodide未初始化');
            }

            logger.info(`开始安装包: ${package_name}`);
            try {
                await this.pyodide?.loadPackage(package_name, {
                    messageCallback: (msg) => logger.debug('Package installation:', msg),
                    errorCallback: (err) => logger.error('Package installation error:', err),
                    checkIntegrity: true
                });
                logger.info(`包 ${package_name} 安装成功`);
            } catch (error) {
                logger.error(`包 ${package_name} 安装失败:`, error);
                throw error;
            }
        },

        getLoadedPackages(): PyodidePackageInfo[] {
            if (!this.isPyodideReady || !this.pyodide?.loadedPackages) {
                return [];
            }
            return Object.entries(this.pyodide.loadedPackages).map(([name, channel]) => ({ name, channel }));
        },

        getFSDir(path: string): TreeOption[] | undefined {
            if (!this.isPyodideReady) return undefined;

            try {
                return this.pyodide?.FS.readdir(path)
                    .filter((name: string) => name !== '.' && name !== '..')
                    .map((name: string) => {
                        const fullPath = `${path}/${name}`;
                        const stat = this.pyodide?.FS.stat(fullPath);
                        return {
                            label: name,
                            key: fullPath,
                            isLeaf: !this.pyodide?.FS.isDir(stat.mode)
                        };
                    });
            } catch (error) {
                logger.error(`读取目录 ${path} 失败:`, error);
                throw error;
            }
        },

        writeFSFile(path: string, value: Uint8Array) {
            this.pyodide?.FS.writeFile(path, value)
        },

        async mountNativeFS(path: string, dirHandle: any) {
            return await this.pyodide?.mountNativeFS(path, dirHandle)
        },

        async runPythonCode(prog: string, preProg: string): Promise<void> {
            if (!s0aDaLC2h8eNcTk()) return;
            if (!this.isPyodideReady) {
                throw new Error("Pyodide未初始化");
            }

            const stdin = this.pyodideStdInputFactory() as StdInputCallback;
            const stdout = this.pyodideStdOutputFactory() as StdOutputCallback;
            const stderr = this.pyodideStdErrorFactory() as StdErrorCallback;
            this.pyodide?.setStdin({ stdin });
            this.pyodide?.setStdout({ batched: stdout });
            this.pyodide?.setStderr({ batched: stderr });

            const namespace = this.pyodide?.globals.get('dict')();

            try {
                this.pyodide?.runPython(preProg, { globals: namespace });
                await this.pyodide?.runPythonAsync(prog, { globals: namespace });
            } catch (error: any) {
                error.toString().split('\n').forEach((line: string) => stderr(line));
                logger.error("Python执行异常", { error, preProg, prog});
            } finally {
                namespace.destroy();
            }
        },
    },
});

