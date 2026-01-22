# ⏳ Timeout
An extension that limits the time you can spend on certain websites and adds a cooldown.

## How does it works? 
To understand how this extension works, you only need to understand the parts of the user-modifiable data.json file.
```json
{
    "Time": {
        "CooldownSeconds": 1800,
        "MaxSeconds": 600
    },
    "Configuration": {
        "LimitedSites": ["https://www.youtube.com/shorts/"],
        "RedirectionOptions": ["https://www.google.com"]
    }
}
```
### Time
+ ```"CooldownSeconds"```: The cooldown period is the time limit (expressed in seconds) that the site will have before it can be accessed again after exceeding the page time limit. Once the cooldown period resets, the time limit will also reset to its initial value, allowing access to that page again.
+ ```"MaxSeconds"```: The initial value of the time you can spend on the page (expressed in seconds). When you're not on the page, if the duration isn't at its maximum value (the initial value), every second that passes will add to the time you can spend on the page until the value is "reloaded".

### Configuration
+ ```"LimitedSites"```: An array containing the sites that will be limited by the extension using the predefined time rules. Each site will have its own independent time limits.
+ ```RedirectionOptions```: If you try to access the website while it is in a "cooldown" state, you will be redirected to a random page selected from this array.

(you can view the current information for each page from the extension's UI.)
<img width="624" height="122" alt="image" src="https://github.com/user-attachments/assets/3c66d8e9-6f23-4335-9213-d79551e6db42" />

## Why does this exist?
As can be seen in the default data.json example, I feel I spend excessive amounts of time on youtube shorts, so I decided to limit myself to stop procrastinating in that way.