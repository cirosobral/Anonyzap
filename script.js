// Seleção dos elementos HTML (apenas por questões didáticas)
const template = document.querySelector('template')
const darkMode = document.getElementById('darkModeSwitch')
const textarea = document.getElementById('text')
const sendBtn = document.getElementById('send')
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
const wsAddress = `ws://${location.host}${location.pathname}`
let ws

// Função para criar uma nova mensagem na tela
function newMessage(message, self = false) {
  const clone = template.content.cloneNode(true)
  const scroll = isUserAtBottom()

  clone.querySelector('.text').innerText = message.message
  clone.querySelector('.time').innerText = new Date(message.time).toTimeString().substr(0, 5)

  if (self)
    clone.querySelector('.message').classList.add('self')

  template.parentElement.appendChild(clone)

  if (scroll)
    window.scrollTo(0, document.documentElement.scrollHeight)
}

// Verifica se o usuário está no fim da página
function isUserAtBottom() {
  const pageHeight = document.documentElement.scrollHeight
  const windowHeight = window.innerHeight
  const scrollY = window.scrollY || window.pageYOffset
  const lastMessage = document.querySelector('.message:last-of-type')?.offsetHeight ?? 0
  return scrollY + windowHeight >= pageHeight - lastMessage;
}

// Função para realizar a conexão com o WebSocket
function connectWs(address) {
  ws = new WebSocket(address)

  ws.addEventListener('open', _ => {
    console.log('Conectado ao servidor.')
  })

  ws.addEventListener('message', e => {
    newMessage(JSON.parse(e.data), false)
  })

  ws.addEventListener('error', e => {
    console.error(e)
  })

  ws.addEventListener('close', _ => {
    console.log('A conexão foi fechada.')
    console.log('Tentando reconexão...')

    // Dispara o evento de reconexao
    document.dispatchEvent(new Event('reconnect'))
  })
}

// Realiza a conexão inicial
connectWs(wsAddress)

// Define o evento de reconexão
document.addEventListener('reconnect', e => {
  setTimeout(() => {
    connectWs(wsAddress)
  }, 500 + Math.random() * 500 | 0)
})

// Função para envio da mensagem presente na caixa de texto
function sendMessage() {
  if (!textarea.value)
    return

  const message = {
    message: textarea.value,
    time: new Date().toJSON()
  }

  textarea.value = ''

  ws.send(JSON.stringify(message))

  newMessage(message, true)
}

// Vincula o clique do botão ao envio de mensagem
sendBtn.addEventListener('click', sendMessage)

// Vincula o enter ao envio de mensagem
textarea.addEventListener('keydown', e => {
  if (e.keyCode != 13 || e.shiftKey)
    return

  e.preventDefault()

  sendMessage()
})

// Função para definir o esquema de cores
function setDarkMode(mode) {
  if (mode)
    document.querySelector('html').dataset.bsTheme = 'dark'
  else
    document.querySelector('html').dataset.bsTheme = 'light'

  darkMode.checked = mode
}

// Sincroniza a mudança de modo de cor com o sistema
darkModeQuery.addEventListener('change', e => {
  setDarkMode(e.matches)
})

// Ativa a funcionalidade do botão de modo escuro
darkMode.addEventListener('change', e => {
  setDarkMode(e.target.checked)
})

// Define o modo de cor no inicio
document.addEventListener('DOMContentLoaded', function () {
  setDarkMode(darkModeQuery.matches)
}, false)