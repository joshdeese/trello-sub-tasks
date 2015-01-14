var api = {};

var convert_items = function (cardId) {
    var myCard = {},
        cardURL = api.url + '/cards/' + cardId + '?key=' + api.key + '&token=' + api.token;
    
    function newCheckItem(e, checklist, newCardShortUrl, checkItemPos){
        if(e.srcElement.readyState == 4 && e.srcElement.status == 200){
            var create_check_item_url = api.url + '/checklists/' + checklist + '/checkItems?key=' + api.key + '&token=' + api.token + '&name=' + newCardShortUrl + '&pos=' + checkItemPos;
            var xhr_new_check_item = new XMLHttpRequest();
            xhr_new_check_item.onreadystatechange = function(e){
                console.log('updated check item');
            };
            xhr_new_check_item.open("POST", create_check_item_url);
            xhr_new_check_item.send();
        }
    }
    
    function deleteCheckItem(data, checklist, check_item_id, check_item_pos){
        var delete_check_item_url = api.url + '/checklists/' + checklist + '/checkItems/' + check_item_id + '?key=' + api.key + '&token=' + api.token;
        var xhr_delete_check_item = new XMLHttpRequest();
        xhr_delete_check_item.onreadystatechange = function(e){
            newCheckItem(e, checklist, JSON.parse(data).shortUrl, check_item_pos);
        };
        xhr_delete_check_item.open("DELETE", delete_check_item_url);
        xhr_delete_check_item.send();
    }
    
    function createCardRequest(checkItems, checklistID){
        function call_next(this_check_item, data){
            if(checkItems.length > 0){
                setTimeout(function(){
                    createCardRequest(checkItems, checklistID);
                }, 0);
            }
            
            if(this_check_item.state == 'incomplete'){
                deleteCheckItem(data, checklistID, this_check_item.id, this_check_item.pos);
            }
        }
        
        var check_item = checkItems.shift();
        if(check_item.state == 'incomplete'){
            var newDesc = "Parent: " + myCard.shortURL;
            var create_card_url = api.url+'/cards?key='+api.key+'&token='+api.token+'&idList='+myCard.idList+'&name='+check_item.name+'&desc='+myCard.shortURL;
            var xhr_create_card = new XMLHttpRequest();
            xhr_create_card.onreadystatechange = function(e){
                if(e.srcElement.readyState == 4 && e.srcElement.status == 200){
                    call_next(check_item, e.srcElement.response);
                }
            }
            xhr_create_card.open("POST", create_card_url);
            xhr_create_card.send();
        } else {
            call_next(check_item);
        }
    }
    
    function createCard(e){
        if(e.srcElement.readyState == 4 && e.srcElement.status == 200){
            var data = JSON.parse(e.srcElement.response);
            var arr_check_items = data.checkItems;
            createCardRequest(arr_check_items, data.id);
        }
    }
    
    function getChecklistData(e){
        if(e.srcElement.readyState == 4 && e.srcElement.status == 200){
            var data = JSON.parse(e.srcElement.response);
            myCard.id = data.id;
            myCard.idList = data.idList;
            myCard.idChecklists = data.idChecklists;
            myCard.shortURL = data.shortUrl;
            for(var i in myCard.idChecklists){
                var checklist = myCard.idChecklists[i];
                var checklistURL = api.url+'/checklist/'+checklist+'?key='+api.key+'&token='+api.token;
                var xhr_get_checklist_data = new XMLHttpRequest();
                xhr_get_checklist_data.onreadystatechange = createCard;
                xhr_get_checklist_data.open("GET", checklistURL);
                xhr_get_checklist_data.send();
            }
        }
    }
    
    var xhr_get_card_data = new XMLHttpRequest();
    xhr_get_card_data.onreadystatechange = getChecklistData;
    xhr_get_card_data.open("GET", cardURL);
    xhr_get_card_data.send();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");
    if (request.greeting == "addConvertBtn"){
        api = request.api;
        if(document.getElementById('convert_items') === null){
            var myContainer = document.createElement('div');
            var myLink = document.createElement('a');
            var myText = document.createTextNode('Convert Items to Cards');
            
            myLink.setAttribute('href', '#');
            myLink.setAttribute('id', 'convert_items');
            myLink.setAttribute('class', 'button-link');
            
            //myLink.setAttribute('onclick', 'josh("'+request.shortUrl+'")');
            myLink.appendChild(myText);
            myContainer.appendChild(myLink);
            
            var header = document.getElementsByClassName('window-header')[0];
            header.appendChild(myContainer);
            
            document.getElementById('convert_items').onclick = function(){
                convert_items(request.shortUrl);
            };
            
            sendResponse({farewell: "button created"});
        } else {
            sendResponse({farewell: "button already exists"});
        }
    }
});