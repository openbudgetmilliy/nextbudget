/**
 * PM2. 4GB / 2vCPU droplet, ikki brend.
 *
 * · `instances: 2` — 2 vCPU, har biriga bitta. Ko'proq qilish foyda bermaydi,
 *   trafikning 97% Cloudflare edge'da to'xtaydi.
 * · Worker HAR BRENDGA BITTA va `instances: 1` bo'lishi shart — ikkita worker
 *   bir Redis navbatidan LPOP qilsa batch'lar bo'linib ketadi (yo'qolmaydi,
 *   lekin sessiya/event tartibi buziladi va INSERT'lar ko'payadi).
 * · `node_args: --env-file=.env` — PM2 .env ni o'zi o'qimaydi. Next `npm start`
 *   uchun o'zi o'qiydi, worker uchun esa aynan shu kerak.
 */
module.exports = {
  apps: [
    {
      name: 'sp-web',
      cwd: '/var/www/starspaymee',
      script: 'npm',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '400M',
      min_uptime: '20s',
      max_restarts: 10,
      kill_timeout: 8000,
      wait_ready: false,
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        // Node 22: heap'ni 400M restart limitiga moslaymiz
        NODE_OPTIONS: '--max-old-space-size=320',
      },
    },
    {
      name: 'sp-worker',
      cwd: '/var/www/starspaymee',
      script: 'worker/dist/worker/flush.js',
      node_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '200M',
      min_uptime: '20s',
      kill_timeout: 12000, // shutdown() joriy batch'ni tugatishga vaqt kerak
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'brand-b-web',
      cwd: '/var/www/brand-b',
      script: 'npm',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '400M',
      kill_timeout: 8000,
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=320',
      },
    },
    {
      name: 'brand-b-worker',
      cwd: '/var/www/brand-b',
      script: 'worker/dist/worker/flush.js',
      node_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '200M',
      kill_timeout: 12000,
      env: { NODE_ENV: 'production' },
    },
  ],
};
