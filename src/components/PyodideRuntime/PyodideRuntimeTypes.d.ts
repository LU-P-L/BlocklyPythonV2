export interface PyodidePackageInfo {
    name: string;
    channel: string;
}

export type StdInputCallback = () => any;
export type StdOutputCallback = (output: string) => void;
export type StdErrorCallback = (error: string) => void;
