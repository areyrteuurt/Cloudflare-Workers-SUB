import { parseNode, nodeStats, validateNode } from '../utils/parser.js'
import { httpGet, batchHttpGet } from '../utils/http.js'
import { base64Encode, base64Decode } from '../utils/crypto.js'
import { DEFAULT_RULES } from '../config/index.js'

// 处理订阅内容 - 增强版
class SubscriptionHandler {
  constructor(env) {
    this.env = env || {}
    this.nodes = []
    this.cache = null
    this.cacheTime = 0
    this.maxNodes = this.env.MAX_NODES || 500
  }
  
  // 添加节点链接 - 增强版
  async addLink(link) {
    if (!link || typeof link !== 'string' || link.trim() === '') {
      console.warn('Invalid link format')
      return false
    }
    
    try {
      const trimmedLink = link.trim()
      
      if (trimmedLink.startsWith('http')) {
        // 处理订阅链接
        const content = await httpGet(trimmedLink, {
          timeout: this.env.TIMEOUT || 10000,
          retryCount: this.env.RETRY_COUNT || 2
        })
        
        const nodes = this.parseSubscribeContent(content)
        if (nodes && nodes.length > 0) {
          this.nodes.push(...nodes)
          return true
        }
      } else if (trimmedLink.startsWith('vmess://') || 
                trimmedLink.startsWith('vless://') || 
                trimmedLink.startsWith('trojan://') || 
                trimmedLink.startsWith('ss://')) {
        // 处理单个节点
        const node = parseNode(trimmedLink)
        if (node && validateNode(node)) {
          this.nodes.push(node)
          return true
        }
      }
      
      return false
    } catch (e) {
      console.error('Failed to process link:', link.substring(0, 50) + '...', e)
      return false
    }
  }
  
  // 批量添加节点链接
  async addLinks(links) {
    if (!Array.isArray(links)) {
      return { success: 0, failed: 0 }
    }
    
    let successCount = 0
    let failedCount = 0
    
    // 对链接进行分类处理
    const httpLinks = []
    const nodeLinks = []
    
    for (const link of links) {
      if (link && typeof link === 'string' && link.trim() !== '') {
        const trimmedLink = link.trim()
        if (trimmedLink.startsWith('http')) {
          httpLinks.push(trimmedLink)
        } else if (trimmedLink.startsWith('vmess://') || 
                  trimmedLink.startsWith('vless://') || 
                  trimmedLink.startsWith('trojan://') || 
                  trimmedLink.startsWith('ss://')) {
          nodeLinks.push(trimmedLink)
        }
      }
    }
    
    // 并行处理HTTP订阅链接
    if (httpLinks.length > 0) {
      const results = await batchHttpGet(httpLinks, {
        concurrency: 3, // 控制并发数，避免请求过多
        timeout: this.env.TIMEOUT || 10000
      })
      
      for (const result of results) {
        if (result.success) {
          const nodes = this.parseSubscribeContent(result.data)
          if (nodes && nodes.length > 0) {
            this.nodes.push(...nodes)
            successCount++
          } else {
            failedCount++
          }
        } else {
          failedCount++
        }
      }
    }
    
    // 处理单个节点链接
    for (const link of nodeLinks) {
      const node = parseNode(link)
      if (node && validateNode(node)) {
        this.nodes.push(node)
        successCount++
      } else {
        failedCount++
      }
    }
    
    return { success: successCount, failed: failedCount }
  }
  
  // 解析订阅内容 - 增强版
  parseSubscribeContent(content) {
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return []
    }
    
    try {
      const trimmedContent = content.trim()
      const nodes = []
      
      // 尝试多种可能的订阅格式
      const formats = [
        // 1. 尝试直接作为节点列表解析
        () => {
          const lines = trimmedContent.split(/[\r\n]+/)
          return lines
            .filter(line => line.trim() && (
              line.startsWith('vmess://') || 
              line.startsWith('vless://') || 
              line.startsWith('trojan://') || 
              line.startsWith('ss://')
            ))
            .map(parseNode)
            .filter(node => node && validateNode(node))
        },
        
        // 2. 尝试Base64解码后解析
        () => {
          try {
            const decoded = base64Decode(trimmedContent)
            if (decoded && decoded.length > 0) {
              const lines = decoded.split(/[\r\n]+/)
              return lines
                .filter(line => line.trim() && (
                  line.startsWith('vmess://') || 
                  line.startsWith('vless://') || 
                  line.startsWith('trojan://') || 
                  line.startsWith('ss://')
                ))
                .map(parseNode)
                .filter(node => node && validateNode(node))
            }
            return []
          } catch (e) {
            return []
          }
        },
        
        // 3. 尝试YAML/Clash配置格式解析
        () => {
          try {
            // 简单检测是否为Clash配置
            if (trimmedContent.includes('proxies:') && trimmedContent.includes('proxy-groups:')) {
              // 这里可以添加更复杂的Clash配置解析逻辑
              // 目前简化处理，直接返回空数组
              return []
            }
            return []
          } catch (e) {
            return []
          }
        }
      ]
      
      // 尝试每种格式，直到找到有效的节点
      for (const formatFn of formats) {
        const formatNodes = formatFn()
        if (formatNodes && formatNodes.length > 0) {
          nodes.push(...formatNodes)
          break // 找到有效格式后停止尝试
        }
      }
      
      // 去重处理
      return this.deduplicateNodes(nodes)
    } catch (e) {
      console.error('Failed to parse subscribe content:', e)
      return []
    }
  }
  
  // 节点去重
  deduplicateNodes(nodes) {
    const seen = new Set()
    const uniqueNodes = []
    
    for (const node of nodes) {
      if (!node || !node.config || !node.type) continue
      
      // 根据节点类型生成唯一标识
      let identifier = ''
      
      switch (node.type) {
        case 'vmess':
          identifier = `${node.type}-${node.config.uuid}-${node.config.address}-${node.config.port}`
          break
        case 'vless':
          identifier = `${node.type}-${node.config.uuid}-${node.config.address}-${node.config.port}`
          break
        case 'trojan':
          identifier = `${node.type}-${node.config.password}-${node.config.address}-${node.config.port}`
          break
        case 'ss':
          identifier = `${node.type}-${node.config.method}-${node.config.password}-${node.config.address}-${node.config.port}`
          break
        default:
          identifier = `${node.type}-${node.config.address}-${node.config.port}`
      }
      
      if (!seen.has(identifier)) {
        seen.add(identifier)
        uniqueNodes.push(node)
      }
    }
    
    return uniqueNodes
  }
  
  // 生成订阅内容 - 增强版
  generateSubscribeContent(format = 'base64', options = {}) {
    try {
      // 限制节点数量
      const nodes = this.nodes.slice(0, this.maxNodes)
      
      // 根据格式生成不同的订阅内容
      switch (format.toLowerCase()) {
        case 'base64':
          return this.generateBase64Content(nodes)
        case 'clash':
          return this.generateClashConfig(nodes, options)
        case 'clash_meta':
          return this.generateClashMetaConfig(nodes, options)
        case 'singbox':
          return this.generateSingboxConfig(nodes, options)
        case 'shadowrocket':
          return this.generateShadowrocketConfig(nodes)
        default:
          return this.generateBase64Content(nodes)
      }
    } catch (error) {
      console.error('Failed to generate subscribe content:', error)
      // 生成错误订阅内容，包含错误信息
      const errorInfo = base64Encode(`Error: ${error.message || 'Unknown error occurred'}`)
      return errorInfo
    }
  }
  
  // 生成Base64格式内容
  generateBase64Content(nodes) {
    const nodeLinks = nodes.map(node => this.generateNodeLink(node))
      .filter(link => link && link.trim() !== '')
      .join('\n')
    
    return base64Encode(nodeLinks)
  }
  
  // 生成节点链接
  generateNodeLink(node) {
    if (!node || !node.type || !node.config) {
      return ''
    }
    
    try {
      switch (node.type) {
        case 'vmess':
          return this.generateVmessLink(node.config)
        case 'vless':
          return this.generateVlessLink(node.config)
        case 'trojan':
          return this.generateTrojanLink(node.config)
        case 'ss':
          return this.generateSSLink(node.config)
        default:
          return ''
      }
    } catch (error) {
      console.error('Failed to generate node link:', error)
      return ''
    }
  }
  
  // 生成VMess链接
  generateVmessLink(config) {
    const vmessConfig = {
      v: '2',
      ps: config.remark || 'VMess Node',
      add: config.address || '',
      port: config.port || 443,
      id: config.uuid || '',
      aid: config.alterId || 0,
      net: config.network || 'tcp',
      type: 'none',
      host: config.host || '',
      path: config.path || '',
      tls: config.security === 'tls' ? 'tls' : '',
      sni: config.sni || '',
      alpn: config.alpn || ''
    }
    
    return `vmess://${base64Encode(JSON.stringify(vmessConfig))}`
  }
  
  // 生成VLESS链接
  generateVlessLink(config) {
    const searchParams = new URLSearchParams()
    if (config.network) searchParams.set('type', config.network)
    if (config.security) searchParams.set('security', config.security)
    if (config.path) searchParams.set('path', config.path)
    if (config.host) searchParams.set('host', config.host)
    if (config.sni) searchParams.set('sni', config.sni)
    if (config.flow) searchParams.set('flow', config.flow)
    
    const searchStr = searchParams.toString() ? `?${searchParams.toString()}` : ''
    const remark = config.remark ? `#${encodeURIComponent(config.remark)}` : ''
    
    return `vless://${config.uuid}@${config.address}:${config.port}${searchStr}${remark}`
  }
  
  // 生成Trojan链接
  generateTrojanLink(config) {
    const searchParams = new URLSearchParams()
    if (config.security) searchParams.set('security', config.security)
    if (config.sni) searchParams.set('sni', config.sni)
    if (config.path) searchParams.set('path', config.path)
    if (config.host) searchParams.set('host', config.host)
    
    const searchStr = searchParams.toString() ? `?${searchParams.toString()}` : ''
    const remark = config.remark ? `#${encodeURIComponent(config.remark)}` : ''
    
    return `trojan://${config.password}@${config.address}:${config.port}${searchStr}${remark}`
  }
  
  // 生成Shadowsocks链接
  generateSSLink(config) {
    const methodPassword = `${config.method}:${config.password}`
    const encoded = base64Encode(methodPassword)
    const remark = config.remark ? `#${encodeURIComponent(config.remark)}` : ''
    
    return `ss://${encoded}@${config.address}:${config.port}${remark}`
  }
  
  // 生成Clash配置
  generateClashConfig(nodes, options = {}) {
    const config = {
      port: options.port || 7890,
      'socks-port': options.socksPort || 7891,
      'redir-port': options.redirPort || 7892,
      'allow-lan': options.allowLan || true,
      'mode': options.mode || 'Rule',
      'log-level': options.logLevel || 'warning',
      'external-controller': options.controller || '127.0.0.1:9090',
      proxies: [],
      'proxy-groups': [
        {
          name: '🚀 节点选择',
          type: 'select',
          proxies: ['♻️ 自动选择', 'DIRECT']
        },
        {
          name: '♻️ 自动选择',
          type: 'url-test',
          'proxies': [],
          'url': 'http://www.gstatic.com/generate_204',
          'interval': 300
        }
      ],
      rules: this.generateRules(options.rules)
    }
    
    // 添加所有节点到proxies和自动选择组
    nodes.forEach((node, i) => {
      if (!node || !node.config) return
      
      const proxyName = node.config.remark || `${node.type.toUpperCase()} Node ${i + 1}`
      
      let proxyConfig = null
      
      switch (node.type) {
        case 'vmess':
          proxyConfig = {
            name: proxyName,
            type: 'vmess',
            server: node.config.address,
            port: node.config.port,
            uuid: node.config.uuid,
            alterId: node.config.alterId || 0,
            cipher: 'auto',
            tls: node.config.security === 'tls',
            'skip-cert-verify': true,
            network: node.config.network || 'tcp',
            'ws-path': node.config.path,
            'ws-headers': node.config.host ? { Host: node.config.host } : {}
          }
          break
        case 'vless':
          proxyConfig = {
            name: proxyName,
            type: 'vless',
            server: node.config.address,
            port: node.config.port,
            uuid: node.config.uuid,
            cipher: 'auto',
            tls: node.config.security === 'tls',
            'skip-cert-verify': true,
            network: node.config.network || 'tcp',
            'ws-path': node.config.path,
            'ws-headers': node.config.host ? { Host: node.config.host } : {}
          }
          break
        case 'trojan':
          proxyConfig = {
            name: proxyName,
            type: 'trojan',
            server: node.config.address,
            port: node.config.port,
            password: node.config.password,
            tls: node.config.security === 'tls',
            'skip-cert-verify': true,
            sni: node.config.sni || node.config.address,
            'ws-path': node.config.path,
            'ws-headers': node.config.host ? { Host: node.config.host } : {}
          }
          break
        case 'ss':
          proxyConfig = {
            name: proxyName,
            type: 'ss',
            server: node.config.address,
            port: node.config.port,
            password: node.config.password,
            cipher: node.config.method
          }
          break
      }
      
      if (proxyConfig) {
        config.proxies.push(proxyConfig)
        config['proxy-groups'][1].proxies.push(proxyName)
      }
    })
    
    // 添加代理组到节点选择组
    config['proxy-groups'].forEach(group => {
      if (group.name !== '🚀 节点选择' && group.name !== '♻️ 自动选择') {
        config['proxy-groups'][0].proxies.push(group.name)
      }
    })
    
    return `# Clash Config
# Generated at: ${new Date().toISOString()}
# Total nodes: ${nodes.length}

${JSON.stringify(config, null, 2).replace(/
