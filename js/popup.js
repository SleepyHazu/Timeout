const calculateTime = (seconds) => {
    let hoursLeft = Math.floor(seconds / 3600)
    let minsLeft = Math.floor((seconds - hoursLeft * 3600) / 60)
    let secondsLeft = seconds - hoursLeft * 3600 - minsLeft * 60
    secondsLeft = Math.round(secondsLeft * 100) / 100

    let calculatedTime = hoursLeft + "h " + minsLeft + "m " + secondsLeft + "s"

    return calculatedTime
}

const renderElements = () => {
    chrome.runtime.sendMessage({action: "GetData"}, (response) => {
        if(!response) return
        
        for(const [key, value] of Object.entries(response.Sites)) {
            var reference = document.getElementById(key)

            if(!reference) {
                reference = document.createElement("p")
                reference.id = key

                document.getElementById("main").appendChild(reference)
            }
            
            let textContent = "<span id='website'>Website: " + key + "</span> | "
            textContent += value.Cooldown > 0 ? "<span id='cooldown'> Cooldown: " + calculateTime(value.Cooldown) + "</span>" : "<span id='available'>Available time: " + calculateTime(response.MaxSeconds - value.Usage) + "</span>"

            reference.innerHTML = textContent
        }
    })
}

renderElements()

setInterval(() => {
    renderElements()
}, 100)