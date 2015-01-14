var api = {url: "https://api.trello.com/1", key: 'e2793173afc32c8c568423143f7b04ae', token: ''};

chrome.storage.sync.get('user_token', function(items){
    api.token = items.user_token;
});

function addButton(txtFrom){
    console.log('add button');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var str_url = tabs[0].url;
        var index = str_url.indexOf('/', 21);
        var card_short_url = str_url.substring(21, index);
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "addConvertBtn", shortUrl: card_short_url, api: api}, function(response) {
            console.log(response);
        });
    });
}

function user_token(){
    if(typeof api.token === 'undefined'){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {greeting: "get_token"}, function(response){
                console.log(response);
            });
        });
        
        /*Trello.setKey('e2793173afc32c8c568423143f7b04ae');
        
        Trello.authorize({
            type: "popup",
            name: "Trello Sub-tasks",
            persist: true,
            scope: {read: true, write: true},
            expiration: "never",
            success: function(){
                Trello.members.get('me', function(member){
                    console.log(member);
                });
            },
            error: function(){
                console.log('problems');
            }
        });*/
    }
}

chrome.webNavigation.onCompleted.addListener(user_token, {url: [{hostContains : 'trello.com'}]});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(){addButton('onHistoryStatuUpdated');}, {url: [{hostContains : 'trello.com', pathContains : 'c' }]});
chrome.webNavigation.onCompleted.addListener(function(){addButton('onCompleted');}, {url: [{hostContains : 'trello.com', pathContains : 'c' }]});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    console.log(sender.tab ?
               "from a content script:" + sender.tab.url :
               "from the extension");
    if(request.greeting == "got_token"){
        api.token = request.token;
        sendResponse({farewell: "goodbye", Trello: Trello});
    }
});