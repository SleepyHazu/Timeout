var extData

var sites = {}
var cooldowns = {}

var currentUrl = ""

async function initExtension() {
    try {
        const response = await fetch(chrome.runtime.getURL("data.json"))
        extData = await response.json()

        extData["Configuration"]["LimitedSites"].forEach((current) => {
            sites[current] = {
                Usage: 0,
                Cooldown: 0,
                onUse: false
            }

            cooldowns[current] = false
        })

        startInterval()

    } catch(err) {
        console.log(err)
    }
}

async function checkCurrentTab() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return tab.url
}

function startInterval() {
    setInterval(async () => {
        currentUrl = await checkCurrentTab()

        if(currentUrl) {
            currentUrl = (extData.Configuration.LimitedSites.some((current) => currentUrl.startsWith(current))) ? currentUrl : "|"
        }

        for(const [key, value] of Object.entries(sites)) {
            if(cooldowns[key]) {
                value.Cooldown -= 1

                if(currentUrl.startsWith(key)) {
                    let redirectOptions = extData["Configuration"]["RedirectionOptions"]
                    let randomIndex = Math.floor(Math.random() * redirectOptions.length)

                    chrome.tabs.update(null, { url: redirectOptions[randomIndex] })
                }

                if(value.Cooldown <= 0) {
                    value.Cooldown = 0
                    cooldowns[key] = false

                    value.Usage = 0
                }

                continue
            }

            value.onUse = currentUrl.startsWith(key)

            if(value.onUse) {
                value.Usage += 1
            } else if(!cooldowns[key] && value.Usage > 0) value.Usage -= 1

            if(value.Usage >= extData["Time"]["MaxSeconds"]) {
                value.Cooldown = extData["Time"]["CooldownSeconds"]
                cooldowns[key] = true
            }
        }
    }, 1000);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === "GetData") {
        sendResponse({
            Sites: sites,
            Cooldowns: cooldowns,
            MaxSeconds: extData["Time"]["MaxSeconds"]
        })

        return true
    }
    
    return true
})

initExtension()