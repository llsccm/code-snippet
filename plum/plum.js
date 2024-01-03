// const el = document.querySelector('#plum')
const el = document.createElement('canvas')
const ctx = el.getContext('2d')
let pendingTasks = []
let isEnd = false
let frameCount = 0

function initCanvas() {
  let width = window.innerWidth
  let height = window.innerHeight
  el.id = 'plum'
  el.width = 2 * width
  el.height = 2 * height
  el.style.width = width + 'px'
  el.style.height = height + 'px'
  ctx.scale(2, 2)
  initTree(width,height)
  document.body.append(el)
}

function initTree(width, height) {
  ctx.strokeStyle = '#88888445'
  const branch = {
    start: { x: 0, y: height },
    length: 20,
    theta: -Math.PI / 3
  }
  step(branch)
}

function drawBranch(p1, p2) {
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
}

function getEndPoint(branch) {
  const { start, length, theta } = branch
  return {
    x: start.x + length * Math.cos(theta),
    y: start.y + length * Math.sin(theta)
  }
}

function step(branch, depth = 0, prevLeft = true, prevRight = true) {
  const { start, length, theta } = branch
  const end = getEndPoint(branch)
  drawBranch(start, end)
  let left = false
  let right = false
  if (depth > 50) return
  let probabilityL = 0.2 + (prevLeft ? 0.4 : 0)
  let probabilityR = 0.2 + (prevRight ? 0.4 : 0)
  if (Math.random() < probabilityL || depth < 5) left = true
  if (Math.random() < probabilityR || depth < 5) right = true

  if (left && right) {
    pendingTasks.push(() =>
      step(
        {
          start: end,
          length: length + Math.random() * 2 - 1,
          theta: theta - 0.4 * Math.random()
        },
        depth + 1
      )
    )
    pendingTasks.push(() =>
      step(
        {
          start: end,
          length: length + Math.random() * 2 - 1,
          theta: theta + 0.4 * Math.random()
        },
        depth + 1
      )
    )
  } else {
    if (left && prevLeft) {
      pendingTasks.push(() =>
        step(
          {
            start: end,
            length: length + Math.random() * 2 - 1,
            theta: theta - 0.05 * Math.random()
          },
          depth + 1,
          left,
          right
        )
      )
    }
    if (right && prevRight) {
      pendingTasks.push(() =>
        step(
          {
            start: end,
            length: length + Math.random() * 2 - 1,
            theta: theta + 0.05 * Math.random()
          },
          depth + 1,
          left,
          right
        )
      )
    }
  }
}

function render() {
  const tasks = []
  if (pendingTasks.length === 0) isEnd = true
  pendingTasks = pendingTasks.filter((item) => {
    if (Math.random() > 0.4) {
      tasks.push(item)
      return false
    }
    return true
  })
  tasks.forEach((fn) => fn())
}

function run() {
  let timer = requestAnimationFrame(() => {
    frameCount++
    if (frameCount % 3 === 0) {
      render()
    }
    run()
  })
  isEnd && cancelAnimationFrame(timer)
}

requestAnimationFrame(run)
initCanvas()
