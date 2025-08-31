# GitHub Pages 设置指南

## 🎯 目标

使用 GitHub Pages 免费托管 TabTamer 的隐私政策页面，提供专业的在线访问地址。

## 📋 已完成的工作

### 1. 文件准备
- ✅ 更新隐私政策日期至 2025-08-31
- ✅ 创建 GitHub Actions 自动部署配置
- ✅ 创建美观的索引页面 (`docs/index.html`)
- ✅ 创建隐私政策页面 (`docs/privacy-policy.html`)
- ✅ 添加 `.nojekyll` 文件确保正确显示
- ✅ 创建部署说明文档

### 2. 文件结构
```
docs/
├── index.html              # 主页入口
├── privacy-policy.html     # 隐私政策页面
├── .nojekyll              # GitHub Pages 配置
└── README.md              # 部署说明
```

## 🚀 部署步骤

### 第一步：推送代码到 GitHub

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "feat: 添加 GitHub Pages 隐私政策托管

- 更新隐私政策至 2025-08-31
- 配置 GitHub Actions 自动部署
- 创建美观的隐私政策页面
- 支持中英文双语显示"

# 推送到远程仓库
git push origin main
```

### 第二步：启用 GitHub Pages

1. **进入仓库设置**
   - 在 GitHub 仓库页面点击 "Settings" 标签

2. **配置 Pages 源**
   - 左侧菜单选择 "Pages"
   - 在 "Source" 部分选择 "GitHub Actions"

3. **等待自动部署**
   - GitHub Actions 将自动构建并部署
   - 部署完成后会显示访问地址

### 第三步：验证部署

1. **检查 Actions 状态**
   - 点击 "Actions" 标签查看部署进度
   - 确保 "Deploy to GitHub Pages" 任务成功

2. **访问页面**
   - 主页: `https://[用户名].github.io/[仓库名]/`
   - 隐私政策: `https://[用户名].github.io/[仓库名]/privacy-policy.html`

## 🔧 自定义配置

### 更新隐私政策

如需更新隐私政策内容：

1. 修改 `docs/privacy-policy.html`
2. 更新日期信息
3. 推送代码即可自动部署

### 修改页面样式

所有样式都在 HTML 文件的 `<style>` 标签中，可以：

- 调整颜色主题
- 修改布局和字体
- 添加动画效果

## 📱 页面特性

### 响应式设计
- 支持桌面和移动设备
- 自适应屏幕尺寸

### 多语言支持
- 中文简体
- 英文

### 现代化 UI
- 渐变背景
- 毛玻璃效果
- 平滑动画

## 🚨 注意事项

1. **域名格式**
   - 默认格式: `https://[用户名].github.io/[仓库名]/`
   - 如需自定义域名，可在 Pages 设置中配置

2. **更新频率**
   - 每次推送代码到 main 分支都会自动部署
   - 部署通常需要 1-2 分钟

3. **文件大小**
   - GitHub Pages 有文件大小限制
   - 当前页面文件都很小，符合要求

## 🆘 故障排除

### 页面无法访问
1. 检查 GitHub Actions 是否成功
2. 确认 Pages 源设置正确
3. 等待几分钟后重试

### 样式显示异常
1. 检查 `.nojekyll` 文件是否存在
2. 确认 CSS 语法正确
3. 清除浏览器缓存

### 部署失败
1. 查看 Actions 错误日志
2. 检查文件路径是否正确
3. 确认权限设置

## 📞 技术支持

如遇到问题，请：

1. 检查 GitHub Actions 日志
2. 查看 GitHub Pages 设置
3. 提交 Issue 描述问题

---

**部署完成后，您的隐私政策将在 GitHub Pages 上免费托管，提供专业的在线访问体验！** 🎉
