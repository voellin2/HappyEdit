chrome.app.runtime.onLaunched.addListener(function (launchData) {
  chrome.app.window.create('index.html', {
      id: 'happyedit', // Used to keep size/pos of window
      frame: 'none',
      width: 700,
      height: 700
  });
});
