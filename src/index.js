import { SubscriptionHandler } from './modules/subscription.js'
import { generateHTML } from './templates/ui.js'
import { getContentType, isValidUrl } from './utils/http.js'
import { DEFAULT_CONFIG } from './config/index.js'

// 处理请求
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url)
  const path = url.pathname
  const params = Object.fromEntries(url.searchParams.entries())
  
  try {
    // 处理根路径访问 - 显示UI界面
    if (path === '/' || path === '/ui') {
      const subHandler = new SubscriptionHandler(env)
      const stats = subHandler.getStats()
      return new Response(generateHTML(env, stats, params), {
        headers: { 'Content-Type': getContentType('html') }
      })
    }
    
    // 处理订阅请求
    if (path === '/sub' || path.startsWith('/auto') || path.startsWith('/guest')) {
      return handleSubscriptionRequest(request, env, params)
    }
    
    // 健康检查
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': getContentType('json') }
      })
    }
    
    // 返回404
    return new Response('Not Found', { status: 404 })
  } catch (error) {
    console.error('Error handling request:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

// 处理订阅请求
async function handleSubscriptionRequest(request, env, params) {
  const token = params.token || DEFAULT_CONFIG.TOKEN
  const format = params.format || 'base64'
  const subHandler = new SubscriptionHandler(env)
  
  try {
    // 添加预设节点
    await addDefaultNodes(subHandler, env)
    
    // 添加用户自定义节点
    if (env.LINKS) {
      const links = env.LINKS.split('\n').filter(link => link.trim())
      for (const link of links) {
        await subHandler.addLink(link.trim())
      }
    }
    
    // 生成订阅内容
    const content = subHandler.generateSubscribeContent(format)
    const contentType = getContentType(format)
    
    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${env.CACHE_TTL || 3600}`,
        'Subscription-Name': env.SUB_NAME || DEFAULT_CONFIG.SUB_NAME
      }
    })
  } catch (error) {
    console.error('Error generating subscription:', error)
    return new Response('Error generating subscription content', { status: 500 })
  }
}

// 添加默认节点
async function addDefaultNodes(subHandler, env) {
  const defaultNodes = [
    // 可添加一些默认的公共节点
  ]
  
  for (const node of defaultNodes) {
    await subHandler.addLink(node)
  }
}

export { handleRequest }
