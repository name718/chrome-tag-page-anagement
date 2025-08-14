# 🎯 TabTamer 开源许可证完整指南

## 📋 许可证概览

TabTamer 项目采用 **MIT License** 开源许可证，这是一个非常宽松和商业友好的许可证。

## 📄 许可证文件

### 主要许可证文件
- **`LICENSE`**: 标准的 MIT 许可证文本
- **`LICENSE.md`**: 详细的许可证说明文档
- **`package.json`**: 包含许可证信息

### 许可证检查
- **`scripts/check-license.js`**: 自动检查所有源代码文件的许可证声明
- **`npm run check-license`**: 运行许可证检查脚本

## 🎯 MIT 许可证特点

### ✅ 允许的行为
- 商业使用
- 修改源代码
- 分发软件
- 私人使用
- 专利使用
- 集成到其他项目中

### 📝 要求
- 保留版权声明
- 包含完整的 MIT 许可证文本

### ⚠️ 免责声明
- 软件按"原样"提供
- 作者不承担任何责任

## 🔧 技术实现

### 版权声明格式

#### JavaScript/TypeScript 文件
```javascript
/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */
```

#### Vue 组件文件
```html
<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->
```

### 自动化检查

项目包含自动化的许可证检查系统：

```bash
# 检查所有源代码文件的许可证声明
npm run check-license

# 构建前自动检查许可证
npm run build:extension
```

## 🤝 贡献指南

### 贡献者协议

通过向本项目提交代码，您同意：

1. **MIT 许可证**: 您的贡献将采用 MIT 许可证
2. **版权声明**: 您拥有或有权授权使用您提交的代码
3. **专利授权**: 您授予项目使用您贡献中任何专利的权利

### 代码提交要求

- ✅ 所有新文件必须包含版权声明
- ✅ 修改现有文件时保留版权声明
- ✅ 通过许可证检查脚本验证

## 📦 第三方依赖

所有依赖库都采用兼容的开源许可证：

| 依赖库 | 版本 | 许可证 | 用途 |
|--------|------|--------|------|
| Vue 3 | ^3.3.4 | MIT | 前端框架 |
| Pinia | ^2.1.6 | MIT | 状态管理 |
| SortableJS | ^1.15.6 | MIT | 拖拽排序 |
| Vite | ^4.4.9 | MIT | 构建工具 |
| @vueuse/core | ^10.3.0 | MIT | Vue 工具库 |

## 🚀 使用指南

### 个人使用
```bash
# 克隆项目
git clone https://github.com/your-repo/tabtamer.git

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建扩展
npm run build:extension
```

### 商业集成
- ✅ 可以直接集成到商业项目中
- ✅ 无需支付任何费用
- ✅ 无需获得额外授权
- 📝 需要保留版权声明和许可证文本

### 修改和分发
- ✅ 可以自由修改源代码
- ✅ 可以重新分发修改后的版本
- 📝 必须保留原始版权声明
- 📝 必须包含 MIT 许可证文本

## 📞 支持与联系

### 许可证相关问题
- 📧 **邮箱**: [项目维护者邮箱]
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **讨论**: [GitHub Discussions](https://github.com/your-repo/discussions)

### 法律咨询
如果您需要法律咨询或有特殊的许可证需求，请联系项目维护者。

## 📚 相关资源

### 官方资源
- [MIT License 官方文本](https://opensource.org/licenses/MIT)
- [GitHub 许可证选择指南](https://choosealicense.com/)
- [开源许可证比较](https://tldrlegal.com/)

### 项目文档
- [README.md](./README.md): 项目概述和快速开始
- [CONTRIBUTING.md](./CONTRIBUTING.md): 贡献指南
- [INSTALL.md](./INSTALL.md): 安装说明
- [LICENSE.md](./LICENSE.md): 详细许可证说明

## 🎉 感谢

感谢所有为 TabTamer 项目做出贡献的开发者和用户！

---

**© 2024 TabTamer Team. All rights reserved.**

*本项目采用 MIT License 开源许可证，详见 [LICENSE](./LICENSE) 文件。*
