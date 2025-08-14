# 🤝 贡献指南

欢迎为 TabTamer Chrome 扩展项目做出贡献！

## 📋 贡献方式

### 🐛 报告 Bug
1. 使用 GitHub Issues 报告问题
2. 详细描述问题现象和复现步骤
3. 提供浏览器版本和操作系统信息
4. 附上错误日志或截图

### 💡 功能建议
1. 在 Issues 中提出新功能建议
2. 说明功能的使用场景和价值
3. 讨论技术实现方案

### 🔧 代码贡献
1. Fork 本项目
2. 创建功能分支
3. 提交代码更改
4. 创建 Pull Request

## 🛠️ 开发环境设置

### 1. 克隆项目
```bash
git clone https://github.com/your-username/chrome-tag-page-anagement.git
cd chrome-tag-page-anagement
```

### 2. 安装依赖
```bash
npm install
```

### 3. 开发模式
```bash
npm run dev
```

### 4. 构建扩展
```bash
npm run build:extension
```

### 5. 测试扩展
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启开发者模式
4. 加载 `dist` 目录

## 📝 代码规范

### Vue 组件规范
- 使用 Composition API
- 组件名使用 PascalCase
- Props 使用 camelCase
- 事件名使用 kebab-case

### JavaScript 规范
- 使用 ES6+ 语法
- 使用 const/let，避免 var
- 使用箭头函数
- 使用模板字符串

### CSS 规范
- 使用 BEM 命名规范
- 优先使用 CSS 变量
- 响应式设计
- 移动端友好

## 🧪 测试指南

### 功能测试
- 运行 `npm test` 执行单元测试
- 手动测试所有核心功能
- 在不同浏览器版本中测试

### 性能测试
- 检查内存使用情况
- 测试大量标签页的性能
- 验证休眠功能的效果

## 📦 发布流程

### 1. 版本更新
```bash
npm version patch  # 补丁版本
npm version minor  # 次要版本
npm version major  # 主要版本
```

### 2. 构建发布版本
```bash
npm run build:extension
```

### 3. 创建发布标签
```bash
git tag v1.0.0
git push origin v1.0.0
```

## 📄 许可证相关

### 贡献者协议

通过向本项目提交代码，您同意：

1. **MIT 许可证**: 您的贡献将采用 MIT 许可证
2. **版权声明**: 您拥有或有权授权使用您提交的代码
3. **专利授权**: 您授予项目使用您贡献中任何专利的权利

### 许可证要求

- 📝 **保留版权声明**: 在源代码中保留原始版权声明
- 📝 **包含许可证**: 在分发时包含完整的 MIT 许可证文本
- 📝 **注明修改**: 如果修改了代码，请注明修改内容

### 第三方依赖

本项目使用的所有依赖库都采用兼容的开源许可证：

- **Vue 3**: MIT License
- **Pinia**: MIT License
- **SortableJS**: MIT License
- **Vite**: MIT License

## 🤝 行为准则

### 社区准则

- 🎯 **尊重他人**: 保持友好和专业的交流
- 💡 **建设性反馈**: 提供有建设性的意见和建议
- 🔍 **仔细审查**: 在提交代码前仔细检查
- 📚 **文档完善**: 为新功能添加适当的文档

### 沟通渠道

- 🐛 **Issues**: 报告 Bug 和功能建议
- 💬 **Discussions**: 讨论技术问题和设计决策
- 📧 **邮件**: 重要问题可以通过邮件联系
git tag v1.0.0
git push origin v1.0.0
```

### 4. 发布到 Chrome Web Store
1. 打包扩展文件
2. 上传到 Chrome Web Store
3. 填写更新说明

## 📚 文档维护

### 更新文档
- README.md - 项目概述和快速开始
- INSTALL.md - 详细安装指南
- TESTING.md - 测试指南
- CONTRIBUTING.md - 贡献指南

### 代码注释
- 重要函数添加 JSDoc 注释
- 复杂逻辑添加行内注释
- 组件 Props 添加类型说明

## 🎯 开发重点

### 核心功能
- 智能标签页分组
- 内存优化休眠系统
- 暂存区管理
- 工作区快照

### 技术栈
- Vue 3 + Composition API
- Pinia 状态管理
- Vite 构建工具
- Chrome Extension Manifest V3

### 性能优化
- 减少内存占用
- 优化渲染性能
- 异步操作处理
- 错误边界处理

## 🚨 注意事项

### 安全考虑
- 不收集用户隐私数据
- 本地存储所有数据
- 遵循 Chrome 扩展安全最佳实践

### 兼容性
- 支持 Chrome 88+
- 测试不同操作系统
- 考虑不同屏幕尺寸

### 用户体验
- 界面简洁直观
- 操作流程顺畅
- 错误提示友好
- 加载速度优化

## 📞 联系方式

- GitHub Issues: [项目 Issues 页面]
- 邮箱: [您的邮箱]
- 讨论区: [项目讨论区]

感谢您的贡献！🎉
