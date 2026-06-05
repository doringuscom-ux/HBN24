

async function getChannelId() {
    try {
        const response = await fetch('https://www.youtube.com/@HBNNews24x7');
        const text = await response.text();
        const match = text.match(/https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})/);
        if (match && match[1]) {
            console.log("CHANNEL_ID: " + match[1]);
        } else {
            console.log("Could not find channel ID.");
        }
    } catch (e) {
        console.error(e);
    }
}

getChannelId();
