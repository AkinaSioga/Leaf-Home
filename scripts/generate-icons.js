/**
 * 图标预处理脚本
 * 扫描 src/ 下所有 .svelte 文件 → 提取 Icon 引用 → 从 node_modules 读取图标数据 → 生成 icons.ts
 *
 * 使用：node scripts/generate-icons.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getIconData, iconToSVG, iconToHTML, replaceIDs } from '@iconify/utils';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const OUTPUT = join(SRC, 'constants', 'icons.ts');

// 支持的图标集 → npm 包名
const ICON_SETS = {
  'material-symbols': '@iconify-json/material-symbols',
};

/**
 * 递归遍历目录，返回所有匹配扩展名的文件路径
 */
function walk(dir, exts) {
  const out = [];
  for (const item of readdirSync(dir)) {
    const full = join(dir, item);
    if (statSync(full).isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules') out.push(...walk(full, exts));
    } else if (exts.some((e) => item.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

/**
 * 从文件内容里提取所有 icon="prefix:name" 引用
 */
function extract(content) {
  const set = new Set();
  // 匹配 <Icon icon="xxx:yyy" … /> 或 icon={'xxx:yyy'}
  for (const m of content.matchAll(/icon=["']([a-z0-9-]+:[a-z0-9-]+)["']/gi)) {
    set.add(m[1]);
  }
  return set;
}

/**
 * 从 node_modules/@iconify-json/{prefix}/icons.json 读取图标集，提取单个图标的 SVG
 */
function resolveSvg(iconName) {
  const [prefix, name] = iconName.split(':');
  const pkg = ICON_SETS[prefix];
  if (!pkg) return null;

  try {
    const jsonPath = join(ROOT, 'node_modules', pkg, 'icons.json');
    const iconSet = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    const data = getIconData(iconSet, name);
    if (!data) return null;

    const rendered = iconToSVG(data, { height: '1em', width: '1em' });
    return iconToHTML(replaceIDs(rendered.body), rendered.attributes);
  } catch {
    return null;
  }
}

/**
 * 生成 icons.ts 源码
 */
function emit(map) {
  const entries = [...map]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, svg]) => `  "${name}":\n    '${svg.replace(/'/g, "\\'")}'`)
    .join(',\n');

  return `/**
 * 自动生成，请勿手动编辑
 * 由 scripts/generate-icons.js 维护
 */

const iconSvgData: Record<string, string> = {\n${entries}\n};

export function getIconSvg(name: string): string {
  return iconSvgData[name] ?? '';
}

export function hasIcon(name: string): boolean {
  return name in iconSvgData;
}
`;
}

// ── main ──
const files = walk(SRC, ['.svelte']);
const found = new Set();
for (const f of files) {
  if (f.includes('icons.ts')) continue;   // 跳过生成文件自身
  for (const name of extract(readFileSync(f, 'utf-8'))) found.add(name);
}

console.log(`Found ${found.size} icons in ${files.length} .svelte files`);

const map = new Map();
for (const name of found) {
  const svg = resolveSvg(name);
  if (svg) { map.set(name, svg); console.log(`  ✓ ${name}`); }
    else { console.log(`  ✗ ${name} (not found)`); }
}

const generated = emit(map);
if (process.argv.includes('--check')) {
  const current = readFileSync(OUTPUT, 'utf-8');
  if (current !== generated) {
    console.error('Generated icons are out of date. Run: pnpm generate-icons');
    process.exitCode = 1;
  } else {
    console.log(`Verified ${map.size} generated icons`);
  }
} else {
  writeFileSync(OUTPUT, generated, 'utf-8');
  console.log(`Wrote ${map.size} icons → ${OUTPUT}`);
}
