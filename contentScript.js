(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        }
        else if(type=="PLAY"){
            youtubePlayer.currentTime=value;
        }
        else if(type=="DELETE"){
            currentVideoBookmarks=currentVideoBookmarks.filter((b)=>b.time!=value);
            chrome.storage.sync.set({ [currentVideo]:JSON.stringify(currentVideoBookmarks)});

            response(currentVideoBookmarks);
        }
    });
     
    const fetchBookmarks=()=>{
        return  new Promise((resolve)=>{
            chrome.storage.sync.get([currentVideo],(obj) =>
                {
                    resolve(obj[currentVideo] ?JSON.parse(obj[currentVideo]) :[]) ; //checks if currentVedio has bm ,the return the JSON otherise return empty array
                });
        });
    }

    const newVideoLoaded = async() => {   //func to add bm btn to ytb player
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        // console.log(bookmarkBtnExists);
        currentVideoBookmarks=await fetchBookmarks();

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img"); //if the bookmark doesnt exist then add the bm image

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");  //pulling the img that we are using
            bookmarkBtn.className = "ytp-button " + "bookmark-btn"; //adding some dynamic class
            bookmarkBtn.title = "Click to bookmark current timestamp";  //on hover we make title show

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0]; //getting the left controls so we know the posn where we have to add the bm btn
            youtubePlayer = document.getElementsByClassName("video-stream")[0];  //geting the youtube player button element
            
            youtubeLeftControls.append(bookmarkBtn); 
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    const addNewBookmarkEventHandler =async () => {    //saves the timestamp at which bm btn is pressed
        const currentTime = youtubePlayer.currentTime;  //gives  current time in seconds
        
        const newBookmark = {      //called when new bm is amde
            time: currentTime,      //obj that has the  time & description of bm
            desc: "Bookmark at " + getTime(currentTime),  //desc display in extension,getTime() func converts time into seconds
        };
        // console.log(newBookmark);
        currentVideoBookmarks=await fetchBookmarks();

        chrome.storage.sync.set({    //func to sync bm in browser
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)) //sort func sorts the bm according to timestamp
        });
    }

    newVideoLoaded();
})();

const getTime = t => {     //converts the seconds into hours 
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substr(11, 0);
}
