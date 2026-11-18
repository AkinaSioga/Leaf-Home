// Native disclosure keeps the full highlighted example available without JavaScript.
export const articleCodeBlocks = {
  name: 'article-code-blocks',
  preprocess(source) {
    this.meta.articleLineCount = source.split('\n').length;
  },
  postprocess(highlighted) {
    const lines = this.meta.articleLineCount;
    const content = lines >= 20
      ? `<details class="code-fold"><summary>代码 · ${lines} 行</summary>${highlighted}</details>`
      : highlighted;
    return `<div class="code-block">${content}<button type="button" class="code-copy" aria-live="polite" hidden>复制代码</button></div>`;
  },
};
