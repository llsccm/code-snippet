const chatContainer = document.getElementById('chatContainer')

function addNewMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.classList.add('message')
  messageElement.textContent = message
  chatContainer.prepend(messageElement)
}

// 模拟定时添加新消息
setInterval(() => {
  addNewMessage('New Message ' + new Date().toLocaleTimeString())
}, 2000)
