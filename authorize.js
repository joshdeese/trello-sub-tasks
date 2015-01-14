function get_token(){
    Trello.setKey('e2793173afc32c8c568423143f7b04ae');
    Trello.authorize({
        type: "popup",
        name: "Trello Sub-tasks",
        persist: true,
        scope: {read: true, write: true},
        expiration: "never",
        success: function(){
            //console.log('success');
            var user_token = localStorage.trello_token;
            chrome.storage.sync.set({'user_token': user_token}, function(){
                chrome.runtime.sendMessage({greeting: "got_token", token: user_token}, function(response){
                    console.log(response);
                });
            });
        }
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.greeting == 'get_token'){
        get_token();
    }
});