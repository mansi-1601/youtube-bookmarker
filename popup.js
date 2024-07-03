import {getActiveTabURL} from "./utils.js"

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarkElement,bookmark) => {
    const bookmarkTitleElement=document.createElement("div");
    const newBookmarkElement=document.createElement("div");
    const controlElement=document.createElement("div");

    bookmarkTitleElement.textContent=bookmark.desc;
    bookmarkTitleElement.className="bookmark-title";
    
    controlElement.className="bookmark-controls";

    newBookmarkElement.id="bookmark-"+ bookmark.time;
    newBookmarkElement.className="bookmark";
    newBookmarkElement.setAttribute("timestamp",bookmark.time);

    setBookmarkAttributes("play",onPlay,controlElement);
    setBookmarkAttributes("delete",onDelete,controlElement);
    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlElement);
    bookmarkElement.appendChild(newBookmarkElement);

};

const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarkElement=document.getElementById("bookmarks");
    bookmarkElement.innerHTML="";
    
    if (currentBookmarks.length>0){
        for(let i=0;i<currentBookmarks.length;i++){
            const bookmark=currentBookmarks[i];
            addNewBookmark(bookmarkElement,bookmark);
        }
    }
    else{
        bookmarkElement.innerHTML = '<i class="row">No bookmarks to show</i>'    }
};

const onPlay = async e => {
    const bookmarkTime=e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab= await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab,id,{
        type:"PLAY",
        value:bookmarkTime,
    })
};

const onDelete = async e => {
    const activeTab=await getActiveTabURL();
    const bookmarkTime=e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete=document.getElementById("bookmark-"+bookmarkTime);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    chrome.tabs.sendMessage(activeTab.id,{
        type:"DELETE",
        value:bookmarkTime,

    },
viewBookmarks);
};

const setBookmarkAttributes =  (src,addEventListener,controlPanelElement) => {
    const controlElement=document.createElement("img");
    controlElement.src="assests/"+src+".png";
    controlElement.title=src;
    controlElement.addEventListener("click",addEventListener);
    controlPanelElement.appendChild(controlElement);

};

document.addEventListener("DOMContentLoaded", async() => {
    const activeTab= await getActiveTabURL();
    const queryParameters= activeTab.url.split("?")[1];  //to help identify the video
    const urlParameters=new URLSearchParams(queryParameters); //to be able to get unique identifier for each vedio
    
    const currentVideo=urlParameters.get("v");

    if(activeTab.url.includes("youtube.com/watch") && currentVideo){
        chrome.storage.sync.get([currentVideo],(data)=>
        {
            const  currentVideoBookmarks=data[currentVideo]?JSON.parse(data[currentVideo]) :[];
           //view bookmarks func
           viewBookmarks(currentVideoBookmarks);
        })
    }
    else{
        const container=document.getElementsByClassName("container")[0];
        container.innerHTML='<div class="title">This is not a youtube vedio page.</div>';
    }

});  //when we want to load all bm
