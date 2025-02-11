import Database from "better-sqlite3";
import { DB_PATH } from "../constants";

export const dbConnection = new Database(DB_PATH, { verbose: console.log });
