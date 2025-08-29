import { DEFAULT_CONFIG } from '../config/index.js'

// HTTP GET请求带重试机制
async function httpGet(url, options = {}) {
  const maxRetries = options.retryCount || DEFAULT_CONFIG.RETRY_COUNT
  const timeout = options.timeout || DEFAULT_CONFIG.TIMEOUT
  let lastError = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 设置请求超时
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          ...options.headers
        },
        signal: controller.signal,
        ...options
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.text()
    } catch (error) {
      lastError = error
      
      // 如果是最后一次尝试或中止错误，则抛出异常
      if (attempt === maxRetries || error.name === 'AbortError') {
        console.error(`HTTP GET failed after ${maxRetries + 1} attempts:`, error)
        throw error
      }
      
      // 重试前等待一段时间
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      console.warn(`Retrying HTTP request (${attempt + 1}/${maxRetries})...`)
    }
  }
  
  // 这行代码理论上不会执行，但为了类型安全保留
  throw lastError
}

// 检查URL是否有效
function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch (e) {
    return false
  }
}

// 获取内容类型
function getContentType(format) {
  const contentTypes = {
    base64: 'text/plain; charset=utf-8',
    clash: 'application/yaml; charset=utf-8',
    singbox: 'application/json; charset=utf-8',
    json: 'application/json; charset=utf-8',
    text: 'text/plain; charset=utf-8',
    html: 'text/html; charset=utf-8'
  }
  
  return contentTypes[format] || 'text/plain; charset=utf-8'
}

// 批量处理HTTP请求
async function batchHttpGet(urls, options = {}) {
  const results = []
  
  // 控制并发数
  const concurrency = options.concurrency || 5
  const chunks = []
  
  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency))
  }
  
  for (const chunk of chunks) {
    const promises = chunk.map(url => 
      httpGet(url, options).then(result => ({
        url,
        success: true,
        data: result
      })).catch(error => ({
        url,
        success: false,
        error: error.message
      }))
    )
    
    const chunkResults = await Promise.all(promises)
    results.push(...chunkResults)
  }
  
  return results
}

export { httpGet, isValidUrl, getContentType, batchHttpGet }
