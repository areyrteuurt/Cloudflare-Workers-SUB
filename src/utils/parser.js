import { base64Decode } from './crypto.js'

// 解析节点链接
function parseNode(link) {
  if (!link) return null
  
  try {
    if (link.startsWith('vmess://')) {
      return parseVmessNode(link)
    } else if (link.startsWith('vless://')) {
      return parseVlessNode(link)
    } else if (link.startsWith('trojan://')) {
      return parseTrojanNode(link)
    } else if (link.startsWith('ss://')) {
      return parseSSNode(link)
    }
  } catch (e) {
    console.error('Failed to parse node:', link, e)
    return null
  }
  
  return null
}

// 解析VMess节点
function parseVmessNode(link) {
  try {
    const base64Str = link.substring(8)
    const decoded = base64Decode(base64Str)
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
        security: config.tls === 'tls' ? 'tls' : 'none',
        remark: config.ps || 'VMess Node'
      }
    }
  } catch (e) {
    console.error('Failed to parse VMess node:', e)
    return null
  }
}

// 解析VLESS节点
function parseVlessNode(link) {
  try {
    const url = new URL(link)
    const remark = decodeURIComponent(url.hash.substring(1) || 'VLESS Node')
    
    return {
      type: 'vless',
      config: {
        address: url.hostname,
        port: parseInt(url.port) || 443,
        uuid: url.username,
        network: url.searchParams.get('type') || 'tcp',
        path: url.searchParams.get('path') || '',
        host: url.searchParams.get('host') || url.hostname,
        security: url.searchParams.get('security') || 'none',
        remark: remark
      }
    }
  } catch (e) {
    console.error('Failed to parse VLESS node:', e)
    return null
  }
}

// 节点统计信息
function nodeStats(nodes) {
  const types = {}
  let total = 0
  
  nodes.forEach(node => {
    if (node && node.type) {
      types[node.type] = (types[node.type] || 0) + 1
      total++
    }
  })
  
  return {
    total,
    byType: types
  }
}

export { parseNode, nodeStats }
