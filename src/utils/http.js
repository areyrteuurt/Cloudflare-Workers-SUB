// HTTP GET请求
async function httpGet(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ...options.headers
      },
      ...options
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.text()
  } catch (error) {
    console.error('HTTP GET error:', error)
    throw error
  }
}

// 检查URL是否有效
function isValidUrl(url) {
  try {
    new URL(url)
    return true
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

export { httpGet, isValidUrl, getContentType }
