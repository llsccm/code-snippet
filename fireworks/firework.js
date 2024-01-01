function debounce(fn, delay) {
  let timer
  return function () {
    var context = this
    var args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

const canvasEl = document.querySelector('#fireworks')
if (canvasEl) {
  fireRender(canvasEl)
}

function fireRender(canvasEl) {
  const ctx = canvasEl.getContext('2d')
  const colors = ['#0078E7', '#3E83E1', '#5A87FF', '#214EC2']
  const numberOfParticules = 15

  const setCanvasSize = debounce(function () {
    const width = window.innerWidth
    const height = window.innerHeight
    canvasEl.width = 2 * width
    canvasEl.height = 2 * height
    canvasEl.style.width = width + 'px'
    canvasEl.style.height = height + 'px'
    canvasEl.getContext('2d').scale(2, 2)
  }, 500)

  const render = anime({
    duration: Infinity,
    update: function () {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
    }
  })

  function updateCoords(e) {
    let pointerX = e.clientX || (e.touches[0] ? e.touches[0].clientX : e.changedTouches[0].clientX)
    let pointerY = e.clientY || (e.touches[0] ? e.touches[0].clientY : e.changedTouches[0].clientY)
    return { pointerX, pointerY }
  }

  function setParticuleDirection({ x, y }) {
    const angle = (anime.random(0, 360) * Math.PI) / 180,
      value = anime.random(60, 120),
      radius = [-1, 1][anime.random(0, 1)] * value
    return {
      x: x + radius * Math.cos(angle),
      y: y + radius * Math.sin(angle)
    }
  }

  function createParticule(x, y) {
    return {
      x,
      y,
      color: colors[anime.random(0, colors.length - 1)],
      radius: anime.random(16, 32),
      endPos: setParticuleDirection({ x, y }),
      draw: function () {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, !0)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }
  }

  function createCircle(x, y) {
    return {
      x,
      y,
      radius: 0.1,
      color: '#000',
      alpha: 0.5,
      lineWidth: 6,
      draw: function () {
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, !0)
        ctx.lineWidth = this.lineWidth
        ctx.strokeStyle = this.color
        ctx.stroke(), (ctx.globalAlpha = 1)
      }
    }
  }

  function renderParticule(e) {
    for (let t = 0; t < e.animatables.length; t++) e.animatables[t].target.draw()
  }

  function animateParticules(x, y) {
    const circle = createCircle(x, y)
    const particles = []
    for (let i = 0; i < numberOfParticules; i++) particles.push(createParticule(x, y))
    anime
      .timeline()
      .add({
        targets: particles,
        x: function (e) {
          return e.endPos.x
        },
        y: function (e) {
          return e.endPos.y
        },
        radius: 0.1,
        duration: anime.random(900, 1500),
        easing: 'easeOutExpo',
        update: renderParticule
      })
      .add({
        targets: circle,
        radius: anime.random(60, 100),
        lineWidth: 0,
        alpha: {
          value: 0,
          easing: 'linear',
          duration: anime.random(600, 800)
        },
        duration: anime.random(1200, 1800),
        easing: 'easeOutExpo',
        update: renderParticule,
        offset: 0
      })
  }

  document.addEventListener(
    'mousedown',
    function (e) {
      if (['INPUT', 'A', 'IMG', 'HTML'].includes(e.target.tagName)) return
      if (!e.clientX || !e.clientY) return
      render.play()
      const { pointerX, pointerY } = updateCoords(e)
      animateParticules(pointerX, pointerY)
    },
    false
  )
  setCanvasSize()
  window.addEventListener('resize', setCanvasSize, false)
}
