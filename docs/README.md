# GitHub Pages 部署说明

## 自动部署

本项目已配置 GitHub Actions 自动部署到 GitHub Pages。

### 设置步骤

1. **启用 GitHub Pages**
   - 进入仓库设置 (Settings)
   - 点击左侧菜单中的 "Pages"
   - 在 "Source" 部分选择 "GitHub Actions"

2. **推送代码**
   - 将代码推送到 `main` 或 `master` 分支
   - GitHub Actions 将自动构建并部署

3. **访问隐私政策**
   - 部署完成后，隐私政策将在以下地址可用：
   - `https://[你的用户名].github.io/[仓库名]/privacy-policy.html`

## 手动部署

如果需要手动部署：

1. 进入仓库设置
2. 选择 "Pages"
3. 在 "Source" 中选择 "Deploy from a branch"
4. 选择分支和文件夹 (`/docs`)
5. 点击 "Save"

## 文件结构

```
docs/
├── privacy-policy.html    # 隐私政策页面
└── README.md             # 本说明文件
```

## 注意事项

- 确保 `docs` 文件夹包含所有需要托管的文件
- 隐私政策页面已更新至 2025-08-31
- 支持中英文双语显示
