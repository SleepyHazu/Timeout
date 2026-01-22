setInterval(() => {
    console.log("sending tic")
    chrome.runtime.sendMessage({ action: "tick" })
}, 1000)