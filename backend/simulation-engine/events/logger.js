function timestamp() {
  return new Date().toLocaleTimeString();
}

function info(message) {
  console.log(`[${timestamp()}] ℹ️  ${message}`);
}

function success(message) {
  console.log(`[${timestamp()}] 🚌 ${message}`);
}

function warn(message) {
  console.log(`[${timestamp()}] ⚠️  ${message}`);
}

function error(message) {
  console.log(`[${timestamp()}] ❌ ${message}`);
}

module.exports = { info, success, warn, error };