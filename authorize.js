var user_token = localStorage.trello_token;
chrome.storage.sync.set({'user_token': user_token}, function(){
    chrome.runtime.sendMessage({greeting: "got_token", token: user_token}, function(response){
        //window.close();
    });
});