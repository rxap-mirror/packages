if (localStorage) {
  if (window) {
    if (!window.__rxap__) {
      window.__rxap__ = {};
    }
    if (!window.__rxap__.ngx) {
      window.__rxap__.ngx = {};
    }
    if (!window.__rxap__.ngx.theme) {
      window.__rxap__.ngx.theme = {};
    }
    if (!window.__rxap__.ngx.theme.darkMode) {
      window.__rxap__.ngx.theme.darkMode = {};
    }
    if (!window.__rxap__.ngx.theme.name) {
      window.__rxap__.ngx.theme.name = {};
    }
    if (!window.__rxap__.ngx.theme.density) {
      window.__rxap__.ngx.theme.density = {};
    }
    if (!window.__rxap__.ngx.theme.typography) {
      window.__rxap__.ngx.theme.typography = {};
    }
    window.__rxap__.ngx.theme.darkMode.key = 'rxap-dark-mode';
    window.__rxap__.ngx.theme.name.key = 'rxap-theme-name';
    window.__rxap__.ngx.theme.density.key = 'rxap-theme-density';
    window.__rxap__.ngx.theme.typography.key = 'rxap-theme-typography';
  }


  if (
    localStorage.getItem(window.__rxap__.ngx.theme.darkMode.key) === 'true' ||
    (
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    )
  ) {
    document.body.classList.add(
      'dark-theme',
      'dark',
      'dark-mode',
    );
  }

  const density = localStorage.getItem(window.__rxap__.ngx.theme.density.key);
  if (density) {
    const value = Number(density);
    if (value < 0 && value >= -3) {
      document.body.classList.add(`density${ value }`);
    }
  }

  const typography = localStorage.getItem(window.__rxap__.ngx.theme.typography.key);
  if (typography) {
    document.body.style.setProperty(
      '--font-family',
      `var(--font-family-${ typography })`,
    );
  }

  const themeName = localStorage.getItem(window.__rxap__.ngx.theme.name.key);
  if (themeName) {
    document.body.style.setProperty(
      `--theme-name`,
      themeName,
    );
  }

}
