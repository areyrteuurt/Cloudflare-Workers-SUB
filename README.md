部署教程
方法一：使用Cloudflare Pages部署
1.
​Fork项目并准备代码​

bash
复制
# 创建项目目录
mkdir workers-sub && cd workers-sub

# 初始化npm项目
npm init -y

# 安装wrangler
npm install -g wrangler
npm install --save-dev wrangler
2.
​登录Cloudflare​

bash
复制
npx wrangler login
3.
​创建KV命名空间​

bash
复制
npx wrangler kv:namespace create SUBSCRIPTION_STORE
将返回的ID更新到wrangler.toml文件中。

4.
​部署到Cloudflare Pages​

•
在Cloudflare Pages控制台中选择"连接到Git"

•
选择你的项目仓库

•
构建设置：

•
构建命令：npm run build或留空（我们使用直接上传）

•
构建输出目录：./

•
点击"保存并部署"

方法二：使用Cloudflare Workers部署
1.
​直接部署Worker​

bash
复制
# 部署到workers
npx wrangler deploy
2.
​配置环境变量​

在Cloudflare Dashboard中为Worker设置环境变量：

•
TOKEN: 访问token（默认"auto"）

•
LINKS: 订阅链接（每行一个）

•
其他可选配置变量

方法三：手动上传部署
1.
​压缩项目文件​

将所有文件打包为ZIP压缩包

2.
​通过Cloudflare Dashboard上传​

•
进入Workers和Pages页面

•
创建新Worker或Page

•
选择"上传资源"

•
上传ZIP文件并部署

使用方法
1.
​访问Web界面​

部署完成后，访问您的域名（如https://your-domain.pages.dev/）可以看到管理界面。

2.
​获取订阅链接​

•
通用订阅：https://your-domain.workers.dev/auto

•
Clash配置：https://your-domain.workers.dev/auto?format=clash

•
SingBox配置：https://your-domain.workers.dev/auto?format=singbox

3.
​客户端配置​

将订阅链接添加到支持的客户端：

•
Clash: 在Profiles中添加订阅URL

•
Shadowrocket: 点击右上角+号，选择Subscribe

•
Quantumult X: 在节点页面下拉添加订阅

注意事项
1.
​性能限制​：Cloudflare Workers有每日请求次数和运行时间限制，请合理使用
。

2.
​节点数量​：如果节点数量十分庞大，可能导致部分客户端订阅超时，建议控制节点数量
。

3.
​安全性​：非base64订阅会生成24小时临时链接，避免订阅地址泄露
。

4.
​自定义配置​：可以通过修改src/config/index.js中的配置来自定义行为。

这个实现完全自主编写，不依赖外部第三方库，所有功能都包含在代码中。您可以根据需要进一步扩展或修改功能。
