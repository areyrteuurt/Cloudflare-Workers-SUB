// Base64编码
function base64Encode(str) {
  if (typeof btoa !== 'undefined') {
    return btoa(unescape(encodeURIComponent(str)))
  }
  
  // Node.js环境
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64')
  }
  
  throw new Error('Base64 encoding not supported in this environment')
}

// Base64解码
function base64Decode(str) {
  if (typeof atob !== 'undefined') {
    try {
      return decodeURIComponent(escape(atob(str)))
    } catch (e) {
      // 如果不是有效的Base64，返回原字符串
      return str
    }
  }
  
  // Node.js环境
  if (typeof Buffer !== 'undefined') {
    try {
      return Buffer.from(str, 'base64').toString()
    } catch (e) {
      return str
    }
  }
  
  return str
}

// 生成UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 简易哈希函数
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

export { base64Encode, base64Decode, generateUUID, simpleHash }
