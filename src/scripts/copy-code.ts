for (const block of document.querySelectorAll('.markdown-body .code-block')) {
  const button = block.querySelector<HTMLButtonElement>('.code-copy');
  const code = block.querySelector('pre > code');
  if (!button || !code) continue;

  button.hidden = false;
  let reset: number | undefined;
  button.addEventListener('click', async () => {
    window.clearTimeout(reset);
    try {
      await navigator.clipboard.writeText(code.textContent ?? '');
      button.textContent = '已复制';
    } catch {
      // Browsers that deny clipboard access can still offer the original selection.
      const details = block.querySelector('details');
      if (details) details.open = true;
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      button.textContent = '请手动复制';
    }
    reset = window.setTimeout(() => { button.textContent = '复制代码'; }, 2500);
  });
}
