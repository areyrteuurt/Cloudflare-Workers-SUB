// 默认配置
const DEFAULT_CONFIG = {
  // 订阅设置
  TOKEN: 'auto', // 默认访问token
  GUEST_TOKEN: 'guest', // 访客token
  SUB_NAME: 'Workers-SUB Subscription', // 订阅名称
  CACHE_TTL: 3600, // 缓存时间1小时
  MAX_NODES: 500, // 最大节点数量
  
  // 订阅转换API
  SUB_API: 'https://subapi.cmliussss.net',
  SUB_CONFIG: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini',
  
  // UI设置
  PAGE_TITLE: 'Workers-SUB Subscription',
  PAGE_DESCRIPTION: '一个基于Cloudflare Workers的订阅转换工具',
  THEME_COLOR: '#3498db',
  
  // 节点处理
  ENABLE_STATS: true, // 启用节点统计
  TIMEOUT: 10000, // 请求超时时间(毫秒)
  RETRY_COUNT: 2, // 请求重试次数
  
  // 安全设置
  ENABLE_RATE_LIMIT: true, // 启用速率限制
  RATE_LIMIT: 100, // 每小时最大请求数
  
  // 分流规则设置
  CUSTOM_RULES_ENABLED: true, // 启用自定义分流规则
}

// 内置分流规则
const DEFAULT_RULES = {
  direct: [
    'DOMAIN-SUFFIX,local',
    'IP-CIDR,10.0.0.0/8',
    'IP-CIDR,127.0.0.0/8',
    'IP-CIDR,172.16.0.0/12',
    'IP-CIDR,192.168.0.0/16',
    'GEOIP,CN,DIRECT',
    'DOMAIN-SUFFIX,cn',
  ],
  proxy: [
    'DOMAIN-SUFFIX,google.com',
    'DOMAIN-SUFFIX,youtube.com',
    'DOMAIN-SUFFIX,github.com',
    'DOMAIN-SUFFIX,twitter.com',
    'DOMAIN-SUFFIX,facebook.com',
    'DOMAIN-SUFFIX,instagram.com',
  ],
  reject: [
    'DOMAIN-SUFFIX,ad.com',
    'DOMAIN-SUFFIX,ads.com',
    'DOMAIN-KEYWORD,ads',
    'DOMAIN-KEYWORD,tracking',
  ]
}

// 支持的订阅格式
const SUPPORTED_FORMATS = {
  base64: 'text/plain; charset=utf-8',
  clash: 'application/yaml; charset=utf-8',
  singbox: 'application/json; charset=utf-8',
  clash_meta: 'application/yaml; charset=utf-8',
  shadowrocket: 'text/plain; charset=utf-8'
}

export { DEFAULT_CONFIG, DEFAULT_RULES, SUPPORTED_FORMATS }
