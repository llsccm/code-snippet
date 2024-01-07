class ContextMenu {
  static num = 0
  constructor(menu, options) {
    ContextMenu.num++
    if (!(menu instanceof Array)) {
      throw new Error('Parameter 1 must be of type Array')
    }
    if (typeof options !== 'undefined') {
      if (typeof options !== 'object') {
        throw new Error('Parameter 2 must be of type object')
      }
      this.options = options
    } else {
      this.options = {}
    }
    this.init(menu)
  }

  init(menu) {
    if (document.getElementById('cm-' + ContextMenu.num) == null) {
      let cnt = document.createElement('div')
      cnt.className = 'cm-container'
      cnt.id = 'cm-' + ContextMenu.num
      document.body.appendChild(cnt)
    }
    const container = document.getElementById('cm-' + ContextMenu.num)
    container.innerHTML = ''
    container.appendChild(this.renderLevel(menu))
    this.container = container
  }

  renderLevel(level) {
    let ul_outer = document.createElement('ul')

    level.forEach((item) => {
      let li = document.createElement('li')
      if (item.type == 'cm-divider') {
        li.classList.add('cm-divider')
      }

      let text_span = document.createElement('span')
      text_span.classList.add('nav-item')

      if (ContextUtil.getProperty(item, 'text', '') != '') {
        text_span.innerHTML = ContextUtil.getProperty(item, 'text', '')
      } else {
        text_span.innerHTML = ContextUtil.getProperty(this.options, 'default_text', 'item')
      }

      let sub_span = document.createElement('span')
      sub_span.classList.add('cm-sub-span')

      if (typeof item.sub !== 'undefined') {
        li.classList.add('cm-sub-item')
      }

      // li.appendChild(icon_span)
      li.appendChild(text_span)
      // li.appendChild(sub_span)

      if (!ContextUtil.getProperty(item, 'enabled', true)) {
        li.setAttribute('disabled', '')
      } else {
        if (typeof item.events === 'object') {
          let keys = Object.keys(item.events)

          for (let i = 0; i < keys.length; i++) {
            li.addEventListener(keys[i], item.events[keys[i]])
          }
        }

        if (typeof item.sub !== 'undefined') {
          li.appendChild(this.renderLevel(item.sub))
        }
      }

      ul_outer.appendChild(li)
    })

    return ul_outer
  }

  display(e) {
    let [clickCoordsX, clickCoordsY] = [e.clientX, e.clientY]
    // console.log(clickCoordsX, clickCoordsY)

    let menuWidth = this.container.offsetWidth + 4
    let menuHeight = this.container.offsetHeight + 4
    let windowWidth = window.innerWidth
    let windowHeight = window.innerHeight
    let mouseOffset = parseInt(ContextUtil.getProperty(this.options, 'mouse_offset', 2))

    if (windowWidth - clickCoordsX < menuWidth) {
      this.container.style.left = windowWidth - menuWidth + 'px'
    } else {
      this.container.style.left = clickCoordsX + mouseOffset + 'px'
    }

    if (windowHeight - clickCoordsY < menuHeight) {
      this.container.style.top = windowHeight - menuHeight + 'px'
    } else {
      this.container.style.top = clickCoordsY + mouseOffset + 'px'
    }

    let sizes = ContextUtil.getSizes(this.container)

    if (windowWidth - clickCoordsX < sizes.width) {
      this.container.classList.add('cm-border-right')
    } else {
      this.container.classList.remove('cm-border-right')
    }

    if (windowHeight - clickCoordsY < sizes.height) {
      this.container.classList.add('cm-border-bottom')
    } else {
      this.container.classList.remove('cm-border-bottom')
    }

    this.container.classList.add('display')

    if (ContextUtil.getProperty(this.options, 'close_on_click', true)) {
      this.documentClick = this.hide.bind(this)
      window.addEventListener('click', this.documentClick)
    }

    e.preventDefault()
  }

  hide() {
    this.container.classList.remove('display')
    window.removeEventListener('click', this.documentClick)
  }
}

const ContextUtil = {
  getProperty: function (options, opt, def) {
    if (typeof options[opt] !== 'undefined') {
      return options[opt]
    } else {
      return def
    }
  },

  getSizes: function (obj) {
    let lis = obj.getElementsByTagName('li')

    let width_def = 0
    let height_def = 0

    for (let i = 0; i < lis.length; i++) {
      let li = lis[i]

      if (li.offsetWidth > width_def) {
        width_def = li.offsetWidth
      }

      if (li.offsetHeight > height_def) {
        height_def = li.offsetHeight
      }
    }

    let width = width_def
    let height = height_def

    for (let i = 0; i < lis.length; i++) {
      let li = lis[i]

      let ul = li.getElementsByTagName('ul')
      if (typeof ul[0] !== 'undefined') {
        let ul_size = ContextUtil.getSizes(ul[0])

        if (width_def + ul_size.width > width) {
          width = width_def + ul_size.width
        }

        if (height_def + ul_size.height > height) {
          height = height_def + ul_size.height
        }
      }
    }

    return {
      width: width,
      height: height
    }
  }
}
