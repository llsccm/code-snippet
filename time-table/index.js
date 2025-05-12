const container = document.querySelector('.container')
// 拖拽的哪个元素
let sourceNode
container.ondragstart = function (e) {
  // 默认是copy,通过dataset设置默认效果
  e.dataTransfer.effectAllowed = e.target.dataset.effect
  sourceNode = e.target
}
// 经过哪个元素
container.ondragover = function (e) {
  e.preventDefault()
  // console.log('打印***e.target', e.target)
}

// 清除元素的背景颜色
function clearDropStyle() {
  document.querySelectorAll('.drop-over').forEach((node) => {
    node.classList.remove('drop-over')
  })
}

function getDropNode(node) {
  while (node) {
    if (node.dataset && node.dataset.drop) {
      return node
    }
    // 否则向上查找
    node = node.parentNode
  }
}

// 放在哪个元素上方
container.ondragenter = function (e) {
  // 需要清除之前的drop-over
  clearDropStyle()
  // 添加背景颜色，需要判断dataset属性为copy并且是不是等于拖拽元素的e.dataTransfer.effectAllowed
  const dropNode = getDropNode(e.target)
  if (dropNode?.dataset?.drop === e.dataTransfer.effectAllowed) {
    dropNode.classList.add('drop-over')
  }
}
// 松手 浏览器有默认行为,阻止拖放
container.ondrop = function (e) {
  // console.log('打印***e.target', e.target)
  // 需要清除之前的drop-over
  clearDropStyle()
  const dropNode = getDropNode(e.target)
  // 目标节点是copy
  if (dropNode?.dataset?.drop === e.dataTransfer.effectAllowed) {
    if (dropNode.dataset.drop === 'copy') {
      // 避免多次添加
      dropNode.innerHTML = ''
      const cloneNode = sourceNode.cloneNode(true)
      cloneNode.dataset.effect = 'move'
      dropNode.appendChild(cloneNode)
    } else {
      // 删除拖拽节点
      sourceNode.remove()
    }
  }
}

function getCellId(cell) {
  const rowIndex = cell.parentNode.rowIndex
  const colIndex = cell.cellIndex
  return `cell-${rowIndex}-${colIndex}`
}

function saveData() {
  const data = {}
  document.querySelectorAll('[data-drop="copy"]').forEach((cell) => {
    if (cell.children.length > 0) {
      const item = cell.firstElementChild
      data[getCellId(cell)] = {
        text: item.textContent,
        className: item.className,
        color: item.style?.backgroundColor
      }
    }
  })
  localStorage.setItem('timetableData', JSON.stringify(data))
}

function loadData() {
  const savedData = JSON.parse(localStorage.getItem('timetableData'))
  if (!savedData) return

  document.querySelectorAll('[data-drop="copy"]').forEach((cell) => {
    const cellId = getCellId(cell)
    if (savedData[cellId]) {
      const item = document.createElement('div')
      item.className = savedData[cellId].className
      item.textContent = savedData[cellId].text
      item.style.backgroundColor = savedData[cellId].color
      item.draggable = true
      item.dataset.effect = 'move'
      cell.appendChild(item)
    }
  })
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
  loadData()
  loadCustomColors()
})

document.querySelector('#save').addEventListener('click', () => {
  saveData()
  html2canvas(document.querySelector('#capture')).then(function (canvas) {
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'time-table.png'
    a.click()
  })
})

function addColorItem() {
  const color = document.getElementById('newColor').value
  const name = document.getElementById('nameInput').value || '未命名'

  const newItem = document.createElement('div')
  newItem.className = 'item'
  newItem.style.backgroundColor = color
  newItem.textContent = name
  newItem.draggable = true
  newItem.dataset.effect = 'copy'

  document.querySelector('.color-select').appendChild(newItem)

  saveCustomColors()
}

function saveCustomColors() {
  const customColors = []
  document.querySelectorAll('.color-select .item:not([class^="color"])').forEach((item) => {
    customColors.push({
      color: item.style.backgroundColor,
      name: item.textContent
    })
  })
  localStorage.setItem('customColors', JSON.stringify(customColors))
}

function loadCustomColors() {
  const savedColors = JSON.parse(localStorage.getItem('customColors'))
  if (!savedColors) return

  savedColors.forEach((colorData) => {
    const item = document.createElement('div')
    item.className = 'item'
    item.style.backgroundColor = colorData.color
    item.textContent = colorData.name
    item.draggable = true
    item.dataset.effect = 'copy'
    document.querySelector('.color-select').appendChild(item)
  })
}

document.querySelector('.color-select').addEventListener('dblclick', function (e) {
  const target = e.target.closest('.item')
  if (!target) return
  triggerDelete(target)
})

function triggerDelete(target) {
  const dialog = document.getElementById('myDialog')
  dialog.showModal()

  function confirmDelete() {
    if (dialog.returnValue === 'confirm') {
      target.remove()
      updateLocalStorage(target)
    }

    dialog.removeEventListener('close', confirmDelete)
  }

  dialog.addEventListener('close', confirmDelete)
}

function updateLocalStorage(deletedItem) {
  const savedItems = JSON.parse(localStorage.getItem('customColors')) || []
  const index = savedItems.findIndex((item) => item.color === deletedItem.style.backgroundColor)
  savedItems.splice(index, 1)
  localStorage.setItem('customColors', JSON.stringify(savedItems))
}
