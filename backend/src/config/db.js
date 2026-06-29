import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

console.log("=== DB CONFIG ===");
console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    passwordLength: process.env.DB_PASSWORD?.length,
    passwordLastChar: process.env.DB_PASSWORD?.charCodeAt(process.env.DB_PASSWORD.length - 1)
});
console.log("=================");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
    console.log("Đã kết nối với PostgreSQL");
});

pool.on("error", (err) => {
    console.error("Lỗi PostgreSQL không mong muốn:", err);
});

export default {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    pool
};