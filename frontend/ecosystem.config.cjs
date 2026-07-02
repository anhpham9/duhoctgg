module.exports = {
    apps: [
        {
            name: "duhoctgg-frontend",

            script: ".output/server/index.mjs",

            cwd: "/home/deploy/apps/duhoctgg/repo/frontend",

            interpreter: "/usr/bin/node",

            instances: 1,

            exec_mode: "fork",

            autorestart: true,

            watch: false,

            max_memory_restart: "800M",

            env: {
                NODE_ENV: "production",
                PORT: 3000,
                HOST: "127.0.0.1",

                NITRO_HOST: "127.0.0.1",

                NITRO_PORT: 3000
            }
        }
    ]
}