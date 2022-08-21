/** 环境变量 */
export type IEnv = {
  MONGO_URI: string;
  MONGO_DB_NAME: string;
  MONGO_PORT: number;
  MONGO_USER: string;
  MONGO_PASS: string;
  MONGO_VOLUMES: string;
  MONGO_AUTH_SOURCE: string;
};

/** 配置 */
export type IConfig = IEnv;
