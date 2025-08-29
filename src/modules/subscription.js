import { parseNode, nodeStats } from '../utils/parser.js'
import { httpGet } from '../utils/http.js'
import { base64Encode, base64Decode } from '../utils/crypto.js'

// 处理订阅内容
class SubscriptionHandler {
  constructor(env) {
    this.env = env
    this.nodes = []
    this.cache = null
  }
  
  // 添加节点链接
  async addLink(link) {
    try {
      if (link.startsWith('http')) {
        // 处理订阅链接
        const content = await httpGet(link)
        const nodes = this.parseSubscribeContent(content)
        this.nodes.push(...nodes)
      } else if (link.startsWith('vmess://') || link.startsWith('vless://') || 
                 link.startsWith('trojan://') || link.startsWith('ss://')) {
        // 处理单个节点
        const node = parseNode(link)
        if (node) this.nodes.push(node)
      }
    } catch (e) {
      console.error('Failed to process link:', link, e)
    }
  }
  
  // 解析订阅内容
  parseSubscribeContent(content) {
    try {
      // 尝试Base64解码
      const decoded = base64Decode(content)
      if (decoded && decoded.includes('vmess://') || decoded.includes('vless://')) {
        return decoded.split('\n')
          .filter(line => line.trim() && (line.startsWith('vmess://') || line.startsWith('vless://')))
          .map(parseNode)
          .filter(Boolean)
      }
      
      // 直接解析为节点列表
      return content.split('\n')
        .filter(line => line.trim() && (line.startsWith('vmess://') || line.startsWith('vless://')))
        .map(parseNode)
        .filter(Boolean)
    } catch (e) {
      console.error('Failed to parse subscribe content:', e)
      return []
    }
  }
  
  // 生成订阅内容
  generateSubscribeContent(format = 'base64') {
    // 限制节点数量
    const nodes = this.nodes.slice(0, this.env.MAX_NODES || 500)
    
    if (format === 'base64') {
      const nodeLinks = nodes.map(node => this.generateNodeLink(node)).join('\n')
      return base64Encode(nodeLinks)
    } else {
      // 其他格式转换
      return this.convertFormat(nodes, format)
    }
  }
  
  // 生成节点链接
  generateNodeLink(node) {
    if (node.type === 'vmess') {
      return `vmess://${base64Encode(JSON.stringify(node.config))}`
    } else if (node.type === 'vless') {
      return `vless://${node.config.uuid}@${node.config.address}:${node.config.port}?encryption=none&security=${node.config.security}&type=ws&path=${encodeURIComponent(node.config.path)}&host=${node.config.host}#${encodeURIComponent(node.config.remark)}`
    }
    return ''
  }
  
  // 转换格式
  convertFormat(nodes, format) {
    // 简化的格式转换逻辑
    if (format === 'clash') {
      return this.generateClashConfig(nodes)
    } else if (format === 'singbox') {
      return this.generateSingboxConfig(nodes)
    }
    return this.generateBase64Content(nodes)
  }
  
  // 生成Clash配置
  generateClashConfig(nodes) {
    const config = {
      port: 7890,
      'socks-port': 7891,
      'allow-lan': true,
      mode: 'Rule',
      proxies: [],
      'proxy-groups': [
        {
          name: '🚀 Auto',
          type: 'url-test',
          proxies: nodes.map((_, i) => `Node-${i+1}`),
          url: 'http://www.gstatic.com/generate_204',
          interval: 300
        }
      ],
      rules: [
        'DOMAIN-SUFFIX,local,DIRECT',
        'IP-CIDR,10.0.0.0/8,DIRECT',
        'GEOIP,CN,DIRECT',
        'MATCH,🚀 Auto'
      ]
    }
    
    nodes.forEach((node, i) => {
      config.proxies.push({
        name: `Node-${i+1}`,
        type: node.type === 'vmess' ? 'vmess' : 'vless',
        server: node.config.address,
        port: node.config.port,
        uuid: node.config.uuid,
        alterId: node.config.alterId || 0,
        cipher: 'auto',
        tls: node.config.security === 'tls',
        'skip-cert-verify': true,
        network: node.config.network || 'ws',
        'ws-path': node.config.path,
        'ws-headers': { Host: node.config.host }
      })
    })
    
    return JSON.stringify(config, null, 2)
  }
  
  // 获取节点统计信息
  getStats() {
    return nodeStats(this.nodes)
  }
  
  // 清空节点
  clear() {
    this.nodes = []
  }
}

export { SubscriptionHandler }
