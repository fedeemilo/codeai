import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
const promptElement = document.querySelector('textarea')

let loadInterval

function highlightKeywords(text) {
    const keywords = [
        'if',
        'else',
        'for',
        'while',
        'switch',
        'case',
        'break',
        'continue',
        'return',
        'function',
        'class',
        'const',
        'let',
        'var'
    ]
    const words = text.split(' ')
    const highlightedWords = words.map(word => {
        if (keywords.includes(word)) {
            return `<span class="keyword">${word}</span>`
        } else {
            return word
        }
    })
    return highlightedWords.join(' ')
}

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        element.textContent += '.'

        if (element.textContent > '...') {
            element.textContent = ''
        }
    }, 300)
}

function typeCodeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
            element.innerHTML = highlightKeywords(element.innerText)
        } else {
            clearInterval(interval)
            element.innerHTML = highlightKeywords(element.innerText)
            hljs.highlightBlock(element)
        }
    }, 20)
}

function typeRegularText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

function generateUniqueId() {
    const timestamp = Date.now()
    const randomNumber = Math.random()
    const hexadecimalString = randomNumber.toString(16)

    return `id-${timestamp}-${hexadecimalString}`
}

function chatStripe(isAi, value, uniqueId) {
    return `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}" 
              alt="${isAi ? 'bot' : 'user'}" 
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div> 
    `
}

const handleSubmit = async e => {
    e.preventDefault()

    const data = new FormData(form)
    const prompt = data.get('prompt')

    if (prompt.includes('clear')) {
        chatContainer.innerHTML += chatStripe(true, prompt)
        chatContainer.innerHTML = ''
        form.reset()
        promptElement.focus()
        return
    }

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, prompt)

    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, ' ', uniqueId)

    chatContainer.scrollTop = chatContainer.scrollHeight

    const messageDiv = document.getElementById(uniqueId)

    loader(messageDiv)

    // fetch data from server -> bot's response
    const response = await fetch('https://codeai-5wxe.onrender.com', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            prompt
        })
    })

    function isCode(text) {
        try {
            acorn.parse(text)
            return true
        } catch (e) {
            return false
        }
    }

    clearInterval(loadInterval)
    messageDiv.innerHTML = ' '

    if (response.ok) {
        const data = await response.json()
        const parsedData = data.bot.trim()

        if (isCode(parsedData)) {
            const codeContainer = document.createElement('code')
            codeContainer.innerHTML = parsedData
            messageDiv.innerHTML = ''

            messageDiv.classList.add('hljs')

            typeCodeText(messageDiv, parsedData)
        } else {
            typeRegularText(messageDiv, parsedData)
        }
    } else {
        const err = await response.text()

        messageDiv.innerHTML = 'Something went wrong'
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})
form.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key === 'l') {
        chatContainer.innerHTML += chatStripe(true, prompt)
        chatContainer.innerHTML = ''
        form.reset()
    }
})
