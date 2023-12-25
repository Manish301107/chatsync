const name = prompt("Your Good Name?")
const profile_url = prompt("Paste your profile pic URL")
const profile_pic = document.getElementById('profile_pic')
const username = document.getElementById('username')
const message = document.getElementById('message')
const sendBtn = document.getElementById('sendBtn')
const conversation = document.getElementById('conversations')
const connected_username = document.getElementById('chat-room-username')
const connectBtn = document.getElementById('connectBtn')
const connectGroupBtn = document.getElementById('connectGroupBtn')
const connectBtnText = document.getElementById('connectBtnText')
const userStatus = document.getElementById('userStatus')
const exitConnection = document.getElementById('exitConnection')
const chatType = document.getElementById('chat-type-toggle')
const sendAudio = new Audio('sendTone.mp3')
const receiveAudio = new Audio('receiveTone.mp3')

profile_pic.src = profile_url
username.innerText = name
conversation.scrollTo(100, conversation.scrollHeight)
let connection_count = 0;
// document.getElementById('chat-room').style.visibility = "hidden"
connectGroupBtn.style.display = "none"

const connectWithSingleChat = () => {

    const socket = io('https://chatsync-server.onrender.com');
    connection_count++
    socket.emit('conversationType', "single")

    // Socket io :
    socket.emit('join room', name)
    socket.on('connected', (resp) => {
        document.getElementById('chat-room-empty').classList.add("hidden")
        document.getElementById('chat-room').classList.remove("hidden")
        const response = resp.split('~')
        connectBtnText.innerHTML = response[0]
        connected_username.innerHTML = response[1]
    })

    // socket.on('joining people', (connectDetail, name) => {
    //     console.log(connectDetail) // You are connected with ...
    //     console.log(name) // the name of the other user
    //   })

    const send_message_func = () => {
        socket.emit('chat message', `${profile_pic.getAttribute('src')}~${name}~${message.value}`)
        conversation.innerHTML += `<div class="msg-box-sent float-right w-full">
                                            <p class="float-right mx-5 my-4 bg-gradient-to-br from-[#6fabe7] to-[#308bf6] text-white font-medium py-2 px-3.5 rounded-lg rounded-br-none max-w-sm">
                                                 ${message.value}
                                            </p>
                                        </div>`
        message.value = ''
        conversation.scrollTo(100, conversation.scrollHeight)
        sendAudio.play()
    }

    message.addEventListener('keyup', (e) => {
        let msgContent = message.value.trim();
        if (e.keyCode === 13) {
            if (msgContent != '') {
                send_message_func();
            }
        }
    })

    sendBtn.addEventListener('click', (e) => {
        if (message.innerHTML != '' || message.value != '') {
            send_message_func();
        }
    })

    socket.on('receivedMsg', (receiveMsg) => {
        userStatus.innerHTML = "Connected"
        userStatus.className = "text-[#308bf6] font-bold"

        receiveAudio.play()
        const receive_res = receiveMsg.split('~')
        connected_username.innerHTML = receive_res[1]
        conversation.innerHTML += `
        <div class="msg-box-receive float-left w-full">
                    <div class="flex place-items-center content-center">
                        <img src=${receive_res[0]}
                    class="h-9 aspect-square object-cover block rounded-full">
                        <div
                            class="flex flex-col float-left mx-5 my-4 bg-white outline outline-1 outline-gray-300 text-black font-medium p-2 rounded-xl rounded-bl-none max-w-sm px-3.5">
                            <div class="text-xs float-left">${receive_res[1]}</div>
                            <div class="font-semibold">${receive_res[2]}</div>
                        </div>
                    </div>
                </div>`

        conversation.scrollTo(100, conversation.scrollHeight)
    })

    socket.on('notFound', (msg) => {
        socket.disconnect();
        document.getElementById('chat-room-empty').classList.remove("hidden")
        document.getElementById('chat-room').classList.add("hidden")
        connection_count = 0;
        connectBtnText.innerHTML = msg
    })
    socket.on('alert', (alertinfo) => {
        // socket.disconnect();
        userStatus.innerHTML = "Disconnected"
        userStatus.className = "text-red-500 font-bold"
        connected_username.innerHTML = ""
        connectBtnText.innerHTML = "Connect with Someone!"
        connection_count = 0;

        conversation.innerHTML += `
    <div class="info max-w-max">
        <div class="flex mx-3 my-4 bg-red-500 text-white font-medium py-2 px-3.5 rounded-lg max-w-sm">
        <img width="24" height="24" src="https://img.icons8.com/ios-glyphs/60/FFFFFF/disconnected.png" alt="disconnected"/>
        <span class="ml-1 text-sm">${alertinfo}</span>
    </div>`

        // Create Alert for reload 
        const overlay = document.createElement('div');
        overlay.className = 'toastify-overlay grid grid-flow-col place-items-center transition-all';
        overlay.innerHTML = `
    <div id="alert-additional-content-1" class="popup sm:w-11/12 md:w-1/3 p-4 mb-4 text-[#256ec2] border border-[#5ea9f5] rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-[#5ea9f5] dark:border-[#256ec2]" role="alert">
    <div class="flex items-center">
      <svg class="flex-shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
      </svg>
      <span class="sr-only">Info</span>
      <h3 class="text-lg font-medium">Your chatmate have exited the chat</h3>
    </div>
    <div class="mt-2 mb-4 text-sm">
    Get ready for an exciting new connection! We're reloading in 4 second of your page for a fresh start.
    </div>
    <div class="flex">
      <button type="button" class="text-white bg-[#308bf6] hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-[#308bf6] dark:hover:bg-[#308bf6] dark:focus:ring-[#308bf6]" onclick="reloadPage()">
        <svg class="me-2 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
          <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
        </svg>
        Reload now
      </button>
      <button type="button" class="text-[#308bf6] bg-transparent border border-[#308bf6] hover:bg-[#308bf6] hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-[#308bf6] dark:border-[#5ea9f5] dark:text-[#5ea9f5] dark:hover:text-white dark:focus:ring-[#308bf6]" data-dismiss-target="#alert-additional-content-1" aria-label="Close" onclick="dismissAlert()">
        Dismiss
      </button>
    </div>
  </div>`

        document.body.appendChild(overlay);
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 5000);

        setTimeout(() => {
            window.location.reload();
        }, 5000);
    })

    exitConnection.addEventListener('click', (e) => {
        socket.disconnect();
        connection_count = 0;
        connectBtnText.innerHTML = 'Connect with Someone!'
        document.getElementById('chat-room-empty').classList.remove("hidden")
        document.getElementById('chat-room').classList.add("hidden")

        // Create Alert for reload 
        const overlay = document.createElement('div');
        overlay.className = 'toastify-overlay grid grid-flow-col place-items-center transition-all';
        overlay.innerHTML = `
    <div id="alert-additional-content-1" class="popup sm:w-11/12 md:w-1/3 p-4 mb-4 text-[#256ec2] border border-[#5ea9f5] rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-[#5ea9f5] dark:border-[#256ec2]" role="alert">
    <div class="flex items-center">
      <svg class="flex-shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
      </svg>
      <span class="sr-only">Info</span>
      <h3 class="text-lg font-medium">You have successfully exited the chat</h3>
    </div>
    <div class="mt-2 mb-4 text-sm">
    Get ready for an exciting new connection! We're reloading in 4 second of your page for a fresh start.
    </div>
    <div class="flex">
      <button type="button" class="text-white bg-[#308bf6] hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-[#308bf6] dark:hover:bg-[#308bf6] dark:focus:ring-[#308bf6]" onclick="reloadPage()">
        <svg class="me-2 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
          <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
        </svg>
        Reload now
      </button>
      <button type="button" class="text-[#308bf6] bg-transparent border border-[#308bf6] hover:bg-[#308bf6] hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-[#308bf6] dark:border-[#5ea9f5] dark:text-[#5ea9f5] dark:hover:text-white dark:focus:ring-[#308bf6]" data-dismiss-target="#alert-additional-content-1" aria-label="Close" onclick="dismissAlert()">
        Dismiss
      </button>
    </div>
  </div>`

        document.body.appendChild(overlay);
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 5000);

        setTimeout(() => {
            window.location.reload();
        }, 5000);
    })
}


chatType.addEventListener('change', () => {

    if (chatType.checked) {
        console.log("Group chat selected")
        connectGroupBtn.style.display = "block"
        connectBtn.style.display = "none"

        connectGroupBtn.addEventListener('click', (e) => {
            if (connection_count < 1) {
                const socket = io('https://chatsync-server.onrender.com');
                connection_count++
                connectGroupBtn.innerHTML = "Wait! for connection"
                socket.emit('conversationType', "group")

                // Socket io :
                const send_message_func = () => {
                    socket.emit('group-chat-msg', `${profile_pic.getAttribute('src')}~${name}~${message.value}`)
                    conversation.innerHTML += `<div class="msg-box-sent float-right w-full">
                                                        <p class="float-right mx-5 my-4 bg-gradient-to-br from-[#6fabe7] to-[#308bf6] text-white font-medium py-2 px-3.5 rounded-xl rounded-br-none max-w-sm">
                                                             ${message.value}
                                                        </p>
                                                    </div>`
                    message.value = ''
                    conversation.scrollTo(100, conversation.scrollHeight)
                    sendAudio.play()
                }

                socket.emit('join-group', `${name}~${profile_pic.getAttribute('src')}`)
                socket.on('existUser', (exitingUserData) => {
                    socket.on('info', (info) => {
                        userStatus.innerHTML = `${info} online`
                    })
                    connectGroupBtn.innerHTML = "You are connected in Group!!"
                    connected_username.innerHTML = "Group Chat"
                    document.getElementById('chat-room-empty').classList.add("hidden")
                    document.getElementById('chat-room').classList.remove("hidden")
                    conversation.innerHTML += `
    <div class="info max-w-max">
        <div class="flex content-center place-items-center mx-3 my-4 bg-green-600 text-white font-medium py-2 px-3.5 rounded-lg max-w-sm">
        <img src="https://img.icons8.com/external-tanah-basah-glyph-tanah-basah/48/FFFFFF/external-group-chat-social-media-ui-tanah-basah-glyph-tanah-basah.png" height="7" alt="group pic"/>
        <span class="ml-1 text-sm">${exitingUserData}</span>
    </div>`
                })
                socket.on('newUserData', (userData) => {
                    connectGroupBtn.innerHTML = "You are connected in Group!!"
                    let otherUserData = userData.split('~')
                    console.log(otherUserData[0], otherUserData[1])
                    document.getElementById('chat-room-empty').classList.add("hidden")
                    document.getElementById('chat-room').classList.remove("hidden")
                    conversation.innerHTML += `
    <div class="info max-w-max">
        <div class="flex mx-3 my-4 bg-green-600 text-white font-medium py-2 px-3.5 rounded-lg max-w-sm">
        <img width="24" height="24" src=${otherUserData[1]} alt="profile pic" class="rounded-full aspect-square object-fill"/>
        <span class="ml-1 text-sm">${otherUserData[0]} has join the chat</span>
    </div>`

                })

                message.addEventListener('keyup', (e) => {
                    let msgContent = message.value.trim();
                    if (e.keyCode === 13) {
                        if (msgContent != '') {
                            send_message_func();
                        }
                    }
                })

                sendBtn.addEventListener('click', () => {
                    if (message.innerHTML != '' || message.value != '') {
                        send_message_func();
                    }
                })

                socket.on('receivedGroupMsg', (receiveMsg) => {
                    receiveAudio.play()
                    const receive_res = receiveMsg.split('~')
                    console.log(receive_res[0], receive_res[1])
                    connected_username.innerHTML = "Group Chat"
                    conversation.innerHTML += `
                    <div class="msg-box-receive float-left w-full">
                    <div class="flex place-items-center content-center">
                        <img src=${receive_res[0]}
                    class="h-9 aspect-square object-cover block rounded-full">
                        <div
                            class="flex flex-col float-left mx-5 my-4 bg-white outline outline-1 outline-gray-300 text-black font-medium p-2 rounded-xl rounded-bl-none max-w-sm px-3.5">
                            <div class="text-xs float-left">${receive_res[1]}</div>
                            <div class="font-semibold">${receive_res[2]}</div>
                        </div>
                    </div>
                </div>`

                    conversation.scrollTo(100, conversation.scrollHeight)
                })

                socket.on('exitAlert', (exitMsg) => {
                    connection_count = 0;

                    conversation.innerHTML += `
    <div class="info max-w-max">
        <div class="flex mx-3 my-4 bg-red-500 text-white font-medium py-2 px-3.5 rounded-lg max-w-sm">
        <img width="24" height="24" src="https://img.icons8.com/ios-glyphs/60/FFFFFF/disconnected.png" alt="disconnected"/>
        <span class="ml-1 text-sm">${exitMsg}</span>
    </div>`
                })
                exitConnection.addEventListener('click', () => {
                    socket.disconnect();
                    document.getElementById('chat-room-empty').classList.remove("hidden")
                    document.getElementById('chat-room').classList.add("hidden")
                    connection_count = 0;
                    connectGroupBtn.innerHTML = 'Connect with a Group!!'
                })

            }

            console.log("clicked Group")

        })
    } else {
        console.log("Single chat selected")
        connectBtn.style.display = "block"
        connectGroupBtn.style.display = "none"

        connectBtn.addEventListener('click', (e) => {
            console.log("clicked Single")
        })
    }
})

connectBtn.addEventListener('click', (e) => {
    if (connection_count < 1) {
        connectWithSingleChat();
    }
})

const reloadPage = () => {
    window.location.reload();
}
const dismissAlert = () => {
    let overlay = document.getElementsByClassName('toastify-overlay')[0]
    document.body.removeChild(overlay);
}


// socket.emit("name", name)


// const send_message_func = () => {
//     socket.emit("message", `${name},${message.value}`)

//     conversation.innerHTML += `<div class="msg-box-sent float-right w-full">
//                                 <p class="float-right mx-5 my-4 bg-gradient-to-br from-[#6fabe7] to-[#308bf6] text-white font-medium py-2 px-3.5 rounded-lg rounded-br-none max-w-sm">
//                                      ${message.value}
//                                 </p>
//                             </div>`
//     console.log(message.value)
//     message.value = ''
//     conversation.scrollTo(0, document.body.scrollHeight)
// }

// message.addEventListener('keyup', (e) => {
//     if (e.keyCode === 13) {
//         if (message.value != '') {
//             send_message_func();
//         }
//     }
// })
// sendBtn.addEventListener('click', (e) => {
//     e.preventDefault();
//     if (message.value != '') {
//         send_message_func();
//     }
// })

// socket.on("receive", (receiveMsg) => {
//     console.log(receiveMsg)

//     const receive_res = `${receiveMsg}`.split(',')
//     console.log(receive_res[0], receive_res[1])
//     connected_username.innerHTML = receive_res[0]
//     conversation.innerHTML += `<div class="msg-box-receive float-left w-full flex flex-col">
//                             <div class="ml-5 -mb-4 text-sm float-left">${receive_res[0]}</div>
//                                <div class="float-left mx-5 my-4 bg-white outline outline-1 outline-gray-300 text-black font-medium p-2 rounded-lg rounded-bl-none max-w-sm px-3.5">
//                                 ${receive_res[1]}
//                                </div>
//                        </div>`

//     conversation.scrollTo(0, document.body.scrollHeight)
// })


// bugs & problem
// size of receving msg is not customize with msg content (solved)
// manage multiple connect and disconnect without reload (pending)