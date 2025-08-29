import { base64Decode, isValidBase64 } from './crypto.js'

// 解析节点链接 - 增强版
function parseNode(link) {
  if (!link || typeof link !== 'string' || link.trim() === '') {
    return null
  }
  
  try {
    const trimmedLink = link.trim()
    
    if (trimmedLink.startsWith('vmess://')) {
      return parseVmessNode(trimmedLink)
    } else if (trimmedLink.startsWith('vless://')) {
      return parseVlessNode(trimmedLink)
    } else if (trimmedLink.startsWith('trojan://')) {
      return parseTrojanNode(trimmedLink)
    } else if (trimmedLink.startsWith('ss://')) {
      return parseSSNode(trimmedLink)
    } else {
      console.warn('Unsupported node type:', trimmedLink.substring(0, 10) + '...')
    }
  } catch (e) {
    console.error('Failed to parse node:', link.substring(0, 50) + '...', e)
  }
  
  return null
}

// 解析VMess节点 - 增强版
function parseVmessNode(link) {
  try {
    const base64Str = link.substring(8)
    
    // 确保是有效的Base64字符串
    if (!isValidBase64(base64Str)) {
      console.warn('Invalid base64 for VMess node')
      return null
    }
    
    const decoded = base64Decode(base64Str)
    if (!decoded || decoded.trim() === '') {
      console.warn('Empty decoded VMess config')
      return null
    }
    
    const config = JSON.parse(decoded)
    
    return {
      type: 'vmess',
      config: {
        address: config.add || config.host || '',
        port: parseInt(config.port) || 443,
        uuid: config.id || '',
        alterId: parseInt(config.aid) || 0,
        network: config.net || 'tcp',
        path: config.path || '',
        host: config.host || '',
        security: config.tls === 'tls' || config.security === 'tls' ? 'tls' : 'none',
        remark: config.ps || config.remark || 'VMess Node'
      }
    }
  } catch (e) {
    console.error('Failed to parse VMess node:', e)
    return null
  }
}

// 解析VLESS节点 - 增强版
function parseVlessNode(link) {
  try {
    const url = new URL(link)
    const remark = url.hash ? decodeURIComponent(url.hash.substring(1)) : 'VLESS Node'
    
    // 提取searchParams中的配置
    const params = url.searchParams
    
    return {
      type: 'vless',
      config: {
        address: url.hostname,
        port: parseInt(url.port) || 443,
        uuid: url.username || '',
        network: params.get('type') || 'tcp',
        path: params.get('path') || '',
        host: params.get('host') || url.hostname,
        security: params.get('security') || params.get('encryption') || 'none',
        sni: params.get('sni') || '',
        flow: params.get('flow') || '',
        remark: remark
      }
    }
  } catch (e) {
    console.error('Failed to parse VLESS node:', e)
    return null
  }
}

// 解析Trojan节点
function parseTrojanNode(link) {
  try {
    const url = new URL(link)
    const remark = url.hash ? decodeURIComponent(url.hash.substring(1)) : 'Trojan Node'
    const [password] = url.username.split('?') // 处理可能的额外参数
    const params = url.searchParams
    
    return {
      type: 'trojan',
      config: {
        address: url.hostname,
        port: parseInt(url.port) || 443,
        password: password || '',
        security: params.get('security') || 'tls',
        sni: params.get('sni') || url.hostname,
        path: params.get('path') || '',
        host: params.get('host') || '',
        remark: remark
      }
    }
  } catch (e) {
    console.error('Failed to parse Trojan node:', e)
    return null
  }
}

// 解析Shadowsocks节点
function parseSSNode(link) {
  try {
    // 格式: ss://base64(加密方式:密码)@地址:端口#备注
    const parts = link.substring(5).split('@')
    
    if (parts.length !== 2) {
      return null
    }
    
    let [encodedConfig, addressPart] = parts
    let methodPassword, remark = 'Shadowsocks Node'
    
    // 处理可能的URL编码
    try {
      encodedConfig = decodeURIComponent(encodedConfig)
    } catch (e) {
      // 忽略解码错误
    }
    
    // 解析加密方式和密码
    const decodedConfig = base64Decode(encodedConfig)
    if (decodedConfig) {
      methodPassword = decodedConfig
    } else {
      // 可能是原始格式
      methodPassword = encodedConfig
    }
    
    // 解析地址、端口和备注
    const addressParts = addressPart.split('#')
    const [addressPort] = addressParts
    
    if (addressParts.length > 1) {
      remark = decodeURIComponent(addressParts[1])
    }
    
    const [address, portStr] = addressPort.split(':')
    const port = parseInt(portStr) || 8080
    
    // 解析加密方式和密码
    const [method, password] = methodPassword.split(':')
    
    if (!method || !password || !address) {
      return null
    }
    
    return {
      type: 'ss',
      config: {
        address: address,
        port: port,
        method: method,
        password: password,
        remark: remark
      }
    }
  } catch (e) {
    console.error('Failed to parse SS node:', e)
    return null
  }
}

// 节点统计信息 - 优化版
function nodeStats(nodes) {
  const stats = {
    total: 0,
    byType: {},
    byCountry: {},
    valid: 0,
    invalid: 0
  }
  
  if (!nodes || !Array.isArray(nodes)) {
    return stats
  }
  
  nodes.forEach(node => {
    stats.total++
    
    if (node && node.type && node.config && node.config.address) {
      stats.valid++
      
      // 统计类型
      stats.byType[node.type] = (stats.byType[node.type] || 0) + 1
      
      // 尝试统计国家（从域名或IP推断）
      const address = node.config.address
      if (address.includes('.')) {
        const parts = address.split('.')
        if (parts.length > 1) {
          const tld = parts[parts.length - 1].toLowerCase()
          if (tld.length === 2) { // 假设2字符的TLD通常是国家代码
            stats.byCountry[tld] = (stats.byCountry[tld] || 0) + 1
          }
        }
      }
    } else {
      stats.invalid++
    }
  })
  
  return stats
}

// 验证节点有效性
function validateNode(node) {
  if (!node || typeof node !== 'object') {
    return false
  }
  
  const requiredFields = ['type', 'config']
  for (const field of requiredFields) {
    if (!node[field]) {
      return false
    }
  }
  
  const { type, config } = node
  
  // 根据节点类型验证必要字段
  const typeConfigs = {
    vmess: ['address', 'port', 'uuid'],
    vless: ['address', 'port', 'uuid'],
    trojan: ['address', 'port', 'password'],
    ss: ['address', 'port', 'method', 'password']
  }
  
  const requiredConfigFields = typeConfigs[type] || []
  for (const field of requiredConfigFields) {
    if (!config[field]) {
      return false
    }
  }
  
  return true
}

export { parseNode, nodeStats, validateNode }
