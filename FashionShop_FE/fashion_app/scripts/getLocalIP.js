// scripts/getLocalIP.js
const os = require('os');

const getApiUrl = () => {
  const networkInterfaces = os.networkInterfaces();
  
  // Lọc tất cả IP, loại trừ virtual adapters
  const realIPs = [];
  
  for (const name in networkInterfaces) {
    // Bỏ qua virtual network adapters
    if (name.includes('VirtualBox') || 
        name.includes('VMware') || 
        name.includes('Hyper-V') ||
        name.includes('vEthernet')) {
      continue;
    }
    
    for (const iface of networkInterfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        realIPs.push({
          name: name,
          address: iface.address
        });
      }
    }
  }
  
  
  // Ưu tiên IP 192.168.x.x trong dải subnet /24 phổ biến
  const wifiIP = realIPs.find(item => 
    item.address.startsWith('192.168.') && 
    !item.address.startsWith('192.168.174.') && // Loại VMware
    !item.address.startsWith('192.168.56.')     // Loại VirtualBox
  );
  
  const selectedIP = wifiIP ? wifiIP.address : (realIPs[0]?.address || 'localhost');
  
  
  return `http://${selectedIP}:8085/api`;
};

module.exports = { getApiUrl };