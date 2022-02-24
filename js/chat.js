db.collection('chats').onSnapshot(snapshot => {
    snapshot.docChanges().forEach((element) => {
        const elementData = element.doc.data()
        const elementRoom = rooms[elementData.room]
        const elementTime = dateFns.distanceInWordsToNow(elementData.created_at.toDate(), { addSuffix: true })
        if (element.type === 'added') {
            if (elementRoom.active) {
                elementRoom.addMessage(elementData.username, elementData.message, elementTime, elementData.created_at.seconds, element.doc.id, false)
            } else {
                elementRoom.messages.push({id: element.doc.id, username: elementData.username, message: elementData.message, timestamp: elementTime, addedTime: elementData.created_at.seconds})
            }
        } else if (element.type === 'removed') {
            elementRoom.removeMessage(element.doc.id)
        }
    })
})

const addMessageToDb = (username, message, room) => {
    const msg = {
        username: username,
        message: message,
        room: room,
        created_at: firebase.firestore.Timestamp.fromDate(new Date())
    }
    db.collection('chats').add(msg).then(() => {}).catch(err => console.error(err))
}