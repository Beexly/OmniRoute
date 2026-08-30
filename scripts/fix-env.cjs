const fs = require('fs');
const envPath = process.argv[2] || '.env';
let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
function setOrAppend(key, val) {
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(env)) {
    env = env.replace(re, `${key}=${val}`);
  } else {
    env += `\n${key}=${val}\n`;
  }
}
setOrAppend('JWT_SECRET', require('crypto').randomBytes(32).toString('hex'));
setOrAppend('API_KEY_SECRET', require('crypto').randomBytes(32).toString('hex'));
setOrAppend('REQUIRE_API_KEY', 'false');
setOrAppend('OMNIROUTE_SERVER_HOST', '127.0.0.1');
fs.writeFileSync(envPath, env);
console.log('Wrote', envPath, 'size:', env.length, 'lines:', env.split('\n').length);
