const roomButtons = document.querySelectorAll('.chat__chatrooms_button')
const sendMessageForm = document.querySelector('.chat__forms_sendmessage-form')
const updateNameForm = document.querySelector('.chat__forms_updatename-form')
const currentNameSpan = document.querySelector('.chat__current-name_data')
const rooms = {
    'general':null,
    'gaming':null,
    'music':null,
}

class chatRoom {
    constructor(room) {
        this.room = room
        this.messages = []
        this.active = false
    }
    appendChat() {
        const messagesContainer = document.querySelector('.chat-messages-wrapper')
        const htmlTemplate = 
        `
            <div class="chat__messages" id="${this.room}"></div>
        `
        messagesContainer.insertAdjacentHTML('afterbegin', htmlTemplate)
        this.roomElement = document.querySelector(`#${this.room}`)
        this.active = true
        this.sortMessages()
        if (this.messages.length > 0) {
            this.messages.forEach((msg) => {
                this.addMessage(msg.username, msg.message, msg.timestamp, msg.addedTime, msg.id, true)
            })
        }
        this.roomElement.scrollTop = this.roomElement.scrollHeight
    }
    detachChat() {
        const messagesContainer = document.querySelector('.chat-messages-wrapper')
        if (messagesContainer.children.length > 0) messagesContainer.replaceChildren()
        this.active = false
    }
    addMessage(username, message, timestamp, addedTime, id, fromObj) {
        const messagesContainer = document.querySelector('.chat-messages-wrapper')
        if (!(messagesContainer.children.length > 0)) return console.error('Can not insert HTML to not existing element')
        if (!fromObj) this.messages.push({id: id, username: username, message: message, timestamp: timestamp, addedTime: addedTime})
        const htmlTemplate = 
        `
        <div class="chat__message" data-id="${id}">
            <div class="chat__message_author">${username}: <span class="chat__message_text">${message}</span></div>
            <p class="chat__message_timestamp">${timestamp}</p>
        </div>
        `
        this.roomElement.insertAdjacentHTML('beforeend', htmlTemplate)
        this.roomElement.scrollTop = this.roomElement.scrollHeight
    }
    sortMessages() {
        const sortedMessages = this.messages.sort((a, b) => {
            return a.addedTime - b.addedTime
        })
        this.messages = sortedMessages
    }
    removeMessage(id) {
        this.messages = this.messages.filter((e) => {
            return e.id !== id
        }) 
        Array.from(this.roomElement.children).forEach((messagesData) => {
            if (messagesData.getAttribute('data-id') == id) {
                messagesData.remove()
            }
        })

    }
}


class chatUser {
    constructor(username) {
        this.username = username
        currentNameSpan.textContent = this.username
    }
    changeUsername(changedUsername) {
        this.username = changedUsername
        localStorage.setItem('user', JSON.stringify({username: this.username}))
        currentNameSpan.textContent = this.username
    }
}
let user
if (localStorage.getItem('user')) {
    try {
        const localStorageUserData = JSON.parse(localStorage.getItem('user'))
        user = new chatUser(localStorageUserData.username)
    } catch (err) {
        console.error(err)
    }
} else {
    localStorage.setItem('user', JSON.stringify({username: 'anonymous'}))
    user = new chatUser('anonymous')
}

roomButtons.forEach((button) => {
    rooms[button.getAttribute('data-id')] = new chatRoom(button.getAttribute('data-id'))
    rooms[button.getAttribute('data-id')].sortMessages()
    button.addEventListener('click', (clickedEvent) => {
        for (k in rooms) {
            rooms[k].active = false
            rooms[k].detachChat()
        }
        const buttonDataID = clickedEvent.target.getAttribute('data-id')
        const room = rooms[buttonDataID]
        room.appendChat()
    })
})

sendMessageForm.addEventListener('submit', evtData => {
    evtData.preventDefault()
    const inputValue = evtData.target.textInput.value
    let activeRoom
    for (k in rooms) {
        if (rooms[k].active) activeRoom = rooms[k]
    }
    addMessageToDb(user.username, inputValue, activeRoom.room)
    sendMessageForm.reset()
})

updateNameForm.addEventListener('submit', evtData => {
    evtData.preventDefault()
    const inputValue = evtData.target.textInput.value
    user.changeUsername(inputValue)
    updateNameForm.reset()
})