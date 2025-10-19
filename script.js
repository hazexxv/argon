document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab')
  const navButtons = document.querySelectorAll('nav button[data-tab]')
  const modal = document.getElementById('settingsModal')
  const asideButtons = document.querySelectorAll('aside button')
  const panicInput = document.getElementById('panicKeyInput')
  const setPanicBtn = document.getElementById('setPanicKeyBtn')
  const panicStatus = document.getElementById('panicKeyStatus')
  const overlay = document.getElementById('gameOverlay')
  const loader = document.getElementById('loader')
  const header = overlay.querySelector('.game-header')
  const iframe = document.getElementById('gameFrame')

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'))
      document.getElementById(btn.dataset.tab).classList.add('active')
    })
  })

  window.openSettings = () => modal.classList.add('active')
  window.closeSettings = () => modal.classList.remove('active')

  window.showSettings = section => {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'))
    document.getElementById(section).classList.add('active')
    asideButtons.forEach(b => b.classList.remove('active'))
    document.getElementById(`btn-${section}`).classList.add('active')
  }

  window.cloakSite = () => {
    const origURL = window.location.href
    const w = window.open('about:blank', '_blank')
    w.document.write(`<iframe src="${origURL}" style="border:none;position:fixed;top:0;left:0;width:100%;height:100%;"></iframe>`)
    w.document.close()
    window.location.href = 'https://www.clever.com/'
  }

  const savedPanic = localStorage.getItem('panicKey')
  if (savedPanic) panicStatus.textContent = `Current panic key: "${savedPanic.toUpperCase()}"`

  setPanicBtn.addEventListener('click', () => {
    const key = panicInput.value.trim().toLowerCase()
    if (key) {
      localStorage.setItem('panicKey', key)
      panicStatus.textContent = `Saved panic key: "${key.toUpperCase()}"`
      panicInput.value = ''
    }
  })

  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === localStorage.getItem('panicKey')) {
      window.location.href = 'https://www.ixl.com/'
    }
  })

  window.fullscreenGame = () => iframe.requestFullscreen?.()
  window.cloakGame = () => {
    const html = iframe.contentWindow.document.documentElement.outerHTML
    const w = window.open('about:blank', '_blank')
    w.document.write(html)
    w.document.close()
  }
  window.closeGame = () => {
    overlay.classList.remove('active')
    header.style.display = 'none'
    iframe.style.display = 'none'
    iframe.srcdoc = ''
  }

  async function launchContent(url) {
    overlay.classList.add('active')
    loader.style.display = 'block'
    header.style.display = 'none'
    iframe.style.display = 'none'
    const bar = loader.querySelector('.progress-bar')
    bar.style.animation = 'none'
    void bar.offsetWidth
    bar.style.animation = 'loadBar 3s forwards'
    try {
      const code = await fetch(url).then(r => r.text())
      iframe.onload = () => {
        loader.style.display = 'none'
        header.style.display = 'flex'
        iframe.style.display = 'block'
      }
      iframe.srcdoc = code
    } catch {
      loader.style.display = 'none'
      header.style.display = 'flex'
      iframe.style.display = 'block'
      iframe.srcdoc = '<p style="color:white;text-align:center;margin-top:2em;">Failed to load content.</p>'
    }
  }

  window.launchGame = launchContent
  window.launchApp = launchContent

  async function populateGrid(repo, gridEl, searchEl) {
    const apiURL = `https://api.github.com/repos/hazexxv/${repo}/contents?ref=main`
    try {
      const res = await fetch(apiURL)
      if (!res.ok) throw new Error()
      const files = await res.json()
      const items = files.filter(f => f.type === 'file')
      searchEl.placeholder = `Search ${repo} (${items.length})`
      gridEl.innerHTML = ''
      items.forEach(f => {
        const name = f.name.replace(/\..+$/, '')
        const card = document.createElement('div')
        card.textContent = name
        card.dataset.name = name.toLowerCase()
        card.onclick = () => launchContent(f.download_url)
        gridEl.appendChild(card)
      })
      searchEl.addEventListener('input', () => {
        const q = searchEl.value.trim().toLowerCase()
        Array.from(gridEl.children).forEach(card => {
          card.style.display = card.dataset.name.includes(q) ? '' : 'none'
        })
      })
    } catch {
      gridEl.innerHTML = '<p style="text-align:center;color:#f44336;">Could not load content.</p>'
    }
  }

  populateGrid('games', document.getElementById('gameGrid'), document.getElementById('search'))
  populateGrid('apps', document.getElementById('appGrid'), document.getElementById('appSearch'))
})
