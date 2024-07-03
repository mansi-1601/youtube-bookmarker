export async function getActiveTabURL(){   //func that grabs current tab
  let queryOptions={active:true,currentWindow:true};
  let [tab]=await chrome.tabs.query(queryOptions);
  return tab;
}