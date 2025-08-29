// Base64编码 - 增强版
function base64Encode(str) {
  if (!str || typeof str !== 'string') {
    return ''
  }
  
  try {
    if (typeof btoa !== 'undefined') {
      // 浏览器环境
      return btoa(unescape(encodeURIComponent(str)))
    }
    
    // Cloudflare Workers环境或Node.js环境
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str).toString('base64')
    }
    
    // 通用Base64编码实现（作为后备方案）
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let result = ''
    let i = 0
    
    while (i < str.length) {
      const a = str.charCodeAt(i++)
      const b = i < str.length ? str.charCodeAt(i++) : 0
      const c = i < str.length ? str.charCodeAt(i++) : 0
      
      const abc = (a << 16) | (b << 8) | c
      const x = (abc >> 18) & 63
      const y = (abc >> 12) & 63
      const z = (abc >> 6) & 63
      const w = abc & 63
      
      result += chars[x] + chars[y] + (i > str.length + 1 ? '=' : chars[z]) + (i > str.length ? '=' : chars[w])
    }
    
    return result
  } catch (error) {
    console.error('Base64 encoding failed:', error)
    return ''
  }
}

// Base64解码 - 增强版
function base64Decode(str) {
  if (!str || typeof str !== 'string') {
    return ''
  }
  
  try {
    if (typeof atob !== 'undefined') {
      // 浏览器环境
      return decodeURIComponent(escape(atob(str)))
    }
    
    // Cloudflare Workers环境或Node.js环境
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'base64').toString()
    }
    
    // 通用Base64解码实现（作为后备方案）
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let result = ''
    let i = 0
    
    str = str.replace(/[^A-Za-z0-9+/=]/g, '') // 过滤无效字符
    
    while (i < str.length) {
      const x = chars.indexOf(str.charAt(i++))
      const y = chars.indexOf(str.charAt(i++))
      const z = str.charAt(i) === '=' ? 0 : chars.indexOf(str.charAt(i++))
      const w = str.charAt(i) === '=' ? 0 : chars.indexOf(str.charAt(i++))
      
      const abc = (x << 18) | (y << 12) | (z << 6) | w
      const a = (abc >> 16) & 255
      const b = (abc >> 8) & 255
      const c = abc & 255
      
      result += String.fromCharCode(a) + (str.charAt(i - 2) !== '=' ? String.fromCharCode(b) : '') + (str.charAt(i - 1) !== '=' ? String.fromCharCode(c) : '')
    }
    
    return result
  } catch (error) {
    console.error('Base64 decoding failed:', error)
    return str // 解码失败时返回原始字符串
  }
}

// 生成UUID
function generateUUID() {
  try {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  } catch (error) {
    console.error('UUID generation failed:', error)
    return 'fallback-uuid-123456'
  }
}

// 简易哈希函数 - 优化版
function simpleHash(str) {
  if (!str || typeof str !== 'string') {
    return 0
  }
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// 验证Base64字符串
function isValidBase64(str) {
  try {
    if (!str || typeof str !== 'string') {
      return false
    }
    
    // 检查Base64格式是否正确
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Regex.test(str)) {
      return false
    }
    
    // 尝试解码验证
    if (typeof atob !== 'undefined') {
      atob(str)
    } else if (typeof Buffer !== 'undefined') {
      Buffer.from(str, 'base64')
    }
    return true
  } catch (error) {
    return false
  }
}

export { base64Encode, base64Decode, generateUUID, simpleHash, isValidBase64 }
