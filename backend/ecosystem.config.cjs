module.exports = {
    apps: [
        {
            name: "duhoctgg-backend",

            script: "./src/app.js",

            cwd: "/home/deploy/apps/duhoctgg/repo/backend",

            interpreter: "node",

            instances: 1,

            exec_mode: "fork",

            autorestart: true,

            watch: false,

            max_memory_restart: "500M",

            env: {
                NODE_ENV: "production"
            }
        }
    ]
};