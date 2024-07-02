const { JSDOM } = require('jsdom');
const fs = require('node:fs');

const page = "https://www.planetminecraft.com/forums/minecraft/servers/joinable-minecraft-realm-with-co-559977/";

(async () => {
    try {
        var allPosts = JSON.parse(fs.readFileSync("./output.json", "utf8"));
    } catch (err) {
        var allPosts = {};
    }
    const dom = await JSDOM.fromURL(page);
    const doc = dom.window.document;

    const xpath = `/html/body/div[4]/div/div[2]/div[7]/*/div[1]/div[2]`
    const evaluator = new dom.window.XPathEvaluator();
    const result = evaluator.evaluate(xpath, doc, null, dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    
    for (let i = 0; i < result.snapshotLength; i++) {
        const node = result.snapshotItem(i);
        const parent = node.parentElement;
        {
            const username = parent.getElementsByClassName("member_info membertip ").item(0).getAttribute("href").split("/")[2]

            const postTime = parent.getElementsByClassName("timeago").item(0).getAttribute("title");
            let postMessage = parent.getElementsByClassName("core_read_more").item(0).innerHTML.replace(/<br>/g, "\n")
            
            // parsing the post message to remove unnecessary tags and add links
            postMessage = postMessage.replace(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/, (_, url, text) => {
                url = url.split(" ")[0].trim();
                text = text.trim();
                if (url == text)
                    return ` ${text}`;
                return ` ${text} ( ${url} )`
            });

            // remove all html tags from the post message to make it plain text ( we put a space or we could do \n wtv tbh )
            postMessage = postMessage.replace(/<[^>]+>/g, " ");

            allPosts[parent.parentElement.getAttribute("data-id")] = {
                username: username,
                post: {
                    uploadDate: new Date(postTime),
                    content: postMessage
                }
            };
        }
    }
    fs.writeFileSync("./output.json", JSON.stringify(allPosts, null, 4))
})();

