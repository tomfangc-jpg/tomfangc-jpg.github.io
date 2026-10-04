(() => {
  // The editor is deliberately available only in the local file preview.
  if (window.location.protocol !== 'file:') return;

  const storageKey = 'fangcheng-portfolio-v3-content-20261004-r5';
  const selectors = [
    '.brand-name', '.nav a', '.eyebrow', '.hero-title-first', '.hero-title-second', '.hero-name', '.hero-copy', '.hero-note',
    '.hero-actions .button', '.hero-video-label', '.hero-bottom span', '.ticker-track span',
    '.section-kicker', '.result-intro h2', '.result-item strong', '.result-item strong span', '.result-item h3', '.result-item p',
    '.section-heading h2', '.section-heading p', '.filter-button', '.case-meta', '.case-card h3', '.case-summary', '.image-caption',
    '.case-result strong', '.case-result strong span', '.case-result span', '.geo-proof-kicker', '.geo-proof div strong', '.geo-proof div span',
    '.service-process span', '.service-evidence-label', '.service-evidence b', '.service-evidence span', '.service-evidence small', '.proof-title', '.proof-step b', '.proof-step strong', '.proof-step small',
    '.details-aside h2', '.details-aside p', '.detail-head h3', '.detail-tag', '.detail-copy', '.detail-stat strong', '.detail-stat span', '.detail-note',
    '.service-summary h4', '.service-summary li', '.service-summary p', '.detail-evidence a',
    '.social-platform', '.social-card h3', '.social-handle', '.social-stat strong', '.social-stat span', '.social-link', '.social-card .button', '.xhs-feature span', '.xhs-feature strong', '.xhs-feature em', '.social-disclaimer',
    '.about h2', '.about-lede', '.skill', '.timeline-date', '.timeline-item h3', '.timeline-item p', '.footer-bottom span'
  ].join(',');

  let serial = 0;
  document.querySelectorAll(selectors).forEach((element) => {
    Array.from(element.childNodes).forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue || !node.nodeValue.trim()) return;
      const run = document.createElement('span');
      run.className = 'editable-text-run';
      run.dataset.editorKey = `text-${serial++}`;
      run.textContent = node.nodeValue;
      node.replaceWith(run);
    });
  });

  const runs = Array.from(document.querySelectorAll('.editable-text-run'));
  const loadDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem(storageKey) || '{}');
      runs.forEach((run) => {
        if (Object.hasOwn(draft, run.dataset.editorKey)) run.textContent = draft[run.dataset.editorKey];
      });
    } catch (error) {
      console.warn('本机编辑草稿无法读取。', error);
    }
  };
  loadDraft();

  const startButton = document.createElement('button');
  startButton.type = 'button';
  startButton.className = 'local-editor-start';
  startButton.textContent = '✎ 编辑网页文字';
  startButton.setAttribute('aria-label', '开启本机网页文字编辑');

  const panel = document.createElement('aside');
  panel.className = 'local-editor-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', '本机编辑工具');
  panel.innerHTML = '<div class="local-editor-copy"><strong>文字编辑</strong><span>点选文字直接修改；草稿只保存在这台设备。</span></div><div class="local-editor-actions"><button type="button" class="editor-save">保存并预览</button><button type="button" class="editor-reset">恢复原始文字</button><button type="button" class="editor-close" aria-label="关闭文字编辑">×</button></div><div class="local-editor-status" role="status" aria-live="polite"></div>';
  document.body.append(startButton, panel);

  const setEditing = (editing) => {
    document.documentElement.classList.toggle('local-editing', editing);
    panel.hidden = !editing;
    startButton.hidden = editing;
    runs.forEach((run) => {
      if (editing) {
        run.contentEditable = 'plaintext-only';
        run.spellcheck = false;
        run.setAttribute('role', 'textbox');
        run.setAttribute('aria-label', '可直接编辑的网页文字');
      } else {
        run.removeAttribute('contenteditable');
        run.removeAttribute('role');
        run.removeAttribute('aria-label');
      }
    });
  };
  const showStatus = (message) => {
    panel.querySelector('.local-editor-status').textContent = message;
  };
  const saveDraft = () => {
    const draft = Object.fromEntries(runs.map((run) => [run.dataset.editorKey, run.textContent]));
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
      showStatus('已保存到本机浏览器，刷新页面后仍会保留。');
      return true;
    } catch (error) {
      showStatus('浏览器未能保存草稿，请保持此页面打开。');
      return false;
    }
  };

  startButton.addEventListener('click', () => {
    setEditing(true);
    showStatus('点击任意文字即可编辑；保存前可以随时修改。');
  });
  panel.querySelector('.editor-save').addEventListener('click', () => {
    if (saveDraft()) setEditing(false);
  });
  panel.querySelector('.editor-close').addEventListener('click', () => {
    setEditing(false);
    startButton.focus();
  });
  panel.querySelector('.editor-reset').addEventListener('click', () => {
    if (!window.confirm('清除这台设备保存的文字草稿，并恢复网页原始内容？')) return;
    localStorage.removeItem(storageKey);
    window.location.reload();
  });
  runs.forEach((run) => run.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      panel.querySelector('.editor-save').click();
    }
  }));
})();
