var extData

var sites = {}
var cooldowns = {}

var currentUrl = ""
var initialized = false

async function startMonitoring() {
    const contexts = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] })

    if(contexts.length > 0) return

    try {
        await chrome.offscreen.createDocument({
            url: "offscreen.html",
            reasons: ["LOCAL_STORAGE"],
            justification: "tic"
        })
    } catch(err) {
        console.log(err)
    }
}

async function initExtension() {
    if(initialized) return
    initialized = true

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

        await startMonitoring()

    } catch(err) {
        console.log(err)
    }
}

async function checkCurrentTab() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return tab ? tab.url : null
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if(request.action === "GetData") {
        sendResponse({
            Sites: sites,
            Cooldowns: cooldowns,
            MaxSeconds: extData ? extData["Time"]["MaxSeconds"] : {}
        })

        return true

    } else if(request.action === "tick") {
        currentUrl = await checkCurrentTab()

        if(currentUrl) {
            currentUrl = (extData.Configuration.LimitedSites.some((current) => currentUrl.startsWith(current))) ? currentUrl : "|"
        } else return

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

        sendResponse({ status: "ok" })
    }
    
    return true
})

chrome.runtime.onStartup.addListener(initExtension)
chrome.runtime.onInstalled.addListener(initExtension)

initExtension()