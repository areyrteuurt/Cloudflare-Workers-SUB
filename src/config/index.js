// 默认配置
const DEFAULT_CONFIG = {
  // 订阅设置
  TOKEN: 'auto', // 默认访问token
  GUEST_TOKEN: 'guest', // 访客token
  SUB_NAME: 'Workers-SUB Subscription', // 订阅名称
  
  // 订阅转换API
  SUB_API: 'https://subapi.cmliussss.net',
  SUB_CONFIG: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini',
  
  // UI设置
  PAGE_TITLE: 'Workers-SUB Subscription',
  PAGE_DESCRIPTION: '一个基于Cloudflare Workers的订阅转换工具',
  THEME_COLOR: '#3498db',
  
  // 节点处理
  CACHE_TTL: 3600, // 缓存时间1小时
  MAX_NODES: 500, // 最大节点数量
  ENABLE_STATS: true, // 启用节点统计
}

// 内置分流规则
const DEFAULT_RULES = {
  direct: [
    'DOMAIN-SUFFIX,local',
    'IP-CIDR,10.0.0.0/8',
    'IP-CIDR,127.0.0.0/8',
    'IP-CIDR,172.16.0.0/12',
    'IP-CIDR,192.168.0.0/16',
  ],
  proxy: [
    'DOMAIN-SUFFIX,google.com',
    'DOMAIN-SUFFIX,youtube.com',
    'DOMAIN-SUFFIX,github.com',
  ],
  reject: [
    'DOMAIN-SUFFIX,ad.com',
    'DOMAIN-SUFFIX,ads.com',
  ]
}

export { DEFAULT_CONFIG, DEFAULT_RULES }
