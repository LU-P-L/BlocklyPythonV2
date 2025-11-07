import {log4TSProvider} from "@/components/Utils/Logger";

const logger = log4TSProvider.getLogger("InitManagement");

export class InitManagement{
  async loadCase(jxbCaseLoader: any) {
    const config = await fetch('case/jxb-config.json');
    const jxb_config = await config.json();
    for(let item of jxb_config["init"]) {
      const { filename, loader } = item;
      fetch(`case/${filename}`).then(function(response) {
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        return response.text();
      }).then(function(data) {
        jxbCaseLoader[loader](data)
      }).catch(function(err) {
        logger.error(`加载文件${filename}出现异常`, err);
      });
    }
  }
}