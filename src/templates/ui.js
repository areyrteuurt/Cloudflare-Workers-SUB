import { DEFAULT_CONFIG } from '../config/index.js'

// 生成HTML页面
function generateHTML(env, stats = {}, params = {}) {
  const token = params.token || DEFAULT_CONFIG.TOKEN
  const subUrl = `${new URL(env.URL).origin}/${token}`
  const clashUrl = `${subUrl}?format=clash`
  const singboxUrl = `${subUrl}?format=singbox`
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${env.PAGE_TITLE || DEFAULT_CONFIG.PAGE_TITLE}</title>
    <style>
        :root {
            --primary-color: ${env.THEME_COLOR || DEFAULT_CONFIG.THEME_COLOR};
            --bg-color: #f5f7fa;
            --text-color: #333;
            --card-bg: #ffffff;
            --border-color: #e1e4e8;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .header {
            text-align: center;
            padding: 20px 0;
        }
        
        .header h1 {
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 1.1em;
        }
        
        .card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border-color);
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-item {
            text-align: center;
            padding: 15px;
            background: rgba(52, 152, 219, 0.1);
            border-radius: 8px;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .stat-label {
            font-size: 0.9em;
            color: #666;
        }
        
        .url-section {
            margin: 20px 0;
        }
        
        .url-card {
            margin-bottom: 15px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid var(--primary-color);
        }
        
        .url-title {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            font-weight: 500;
        }
        
        .url-title svg {
            margin-right: 8px;
            color: var(--primary-color);
        }
        
        .url-input {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-family: monospace;
            font-size: 0.9em;
            background: white;
        }
        
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: var(--primary-color);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background 0.2s;
            border: none;
            cursor: pointer;
            margin-right: 10px;
            margin-top: 10px;
        }
        
        .btn:hover {
            background: #2980b9;
        }
        
        .btn-secondary {
            background: #95a5a6;
        }
        
        .btn-secondary:hover {
            background: #7f8c8d;
        }
        
        .instructions {
            margin-top: 30px;
        }
        
        .instructions h3 {
            margin-bottom: 15px;
            color: var(--primary-color);
        }
        
        .instructions ol {
            margin-left: 20px;
        }
        
        .instructions li {
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px 0;
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
            .stats {
                grid-template-columns: 1fr;
            }
            
            body {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${env.PAGE_TITLE || DEFAULT_CONFIG.PAGE_TITLE}</h1>
            <p>${env.PAGE_DESCRIPTION || DEFAULT_CONFIG.PAGE_DESCRIPTION}</p>
        </div>
        
        <div class="card">
            <h2>📊 节点统计</h2>
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">${stats.total || 0}</div>
                    <div class="stat-label">总节点数</div>
                </div>
                ${Object.entries(stats.byType || {}).map(([type, count]) => `
                <div class="stat-item">
                    <div class="stat-number">${count}</div>
                    <div class="stat-label">${type.toUpperCase()} 节点</div>
                </div>
                `).join('')}
            </div>
        </div>
        
        <div class="card">
            <h2>🔗 订阅链接</h2>
            <div class="url-section">
                <div class="url-card">
                    <div class="url-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        通用订阅链接
                    </div>
                    <input type="text" class="url-input" value="${subUrl}" readonly>
                    <button class="btn" onclick="copyUrl('${subUrl}')">复制链接</button>
                </div>
                
                <div class="url-card">
                    <div class="url-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                        </svg>
                        Clash 订阅链接
                    </div>
                    <input type="text" class="url-input" value="${clashUrl}" readonly>
                    <button class="btn" onclick="copyUrl('${clashUrl}')">复制链接</button>
                </div>
                
                <div class="url-card">
                    <div class="url-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        </svg>
                        SingBox 订阅链接
                    </div>
                    <input type="text" class="url-input" value="${singboxUrl}" readonly>
                    <button class="btn" onclick="copyUrl('${singboxUrl}')">复制链接</button>
                </div>
            </div>
        </div>
        
        <div class="card instructions">
            <h3>📖 使用说明</h3>
            <ol>
                <li>复制上方订阅链接到您的代理客户端</li>
                <li>支持多种客户端：Clash、Shadowrocket、SingBox、Quantumult X等</li>
                <li>订阅会自动更新，无需手动添加节点</li>
                <li>如需自定义，可在URL后添加参数：?format=clash 或 ?format=singbox</li>
            </ol>
        </div>
        
        <div class="footer">
            <p>Powered by Cloudflare Workers • ${new Date().getFullYear()}</p>
        </div>
    </div>
    
    <script>
        function copyUrl(url) {
            navigator.clipboard.writeText(url).then(() => {
                alert('链接已复制到剪贴板！');
            }).catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制链接');
            });
        }
    </script>
</body>
</html>
`
}

export { generateHTML }
