import dotenv from "dotenv";

export interface Config {
  MONGO_DB_DATABASE: string;
  MONGO_DB_HOST: string;
  MONGO_DB_PORT: string;
  JWT_SECRET: string;
  PORT: string;
  LOG_LEVEL: string;
}

export const loadConfig = (extraOptions: Partial<Config> = {}) => {
  return {
    ...dotenv.config().parsed,
    ...process.env,
    ...extraOptions,
  } as Config;
};
