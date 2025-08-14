/*
 * TabTamer - 打包脚本
 * 生成带版本号的 zip 包，内容为 dist/ 目录的所有文件（不包含目录层级）
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const releaseDir = path.join(root, 'release')

// 读取版本号
const pkg = require(path.join(root, 'package.json'))
const version = pkg.version || '0.0.0'
const name = (pkg.name || 'extension').replace(/[^a-zA-Z0-9_-]/g, '-')

// 确保 dist 存在
if (!fs.existsSync(distDir)) {
  console.error('dist 目录不存在，请先执行构建。')
  process.exit(1)
}

// 创建 release 目录
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true })
}

const zipName = `${name}-${version}.zip`
const zipPath = path.join(releaseDir, zipName)

// 删除旧包
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath)
}

// 使用系统 zip 命令打包（macOS/Linux 可用）
// 将 dist/ 内容压缩为 zip 根目录直接包含 manifest.json 等文件
try {
  execSync(`cd ${distDir} && zip -qr ${JSON.stringify(zipPath)} . -x "*.DS_Store"` , { stdio: 'inherit' })
  console.log(`✅ 打包完成: ${zipPath}`)
} catch (e) {
  console.error('❌ 打包失败，请确认已安装 zip 命令。')
  process.exit(1)
}
