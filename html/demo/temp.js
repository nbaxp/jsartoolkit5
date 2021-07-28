function isMobile() {
    return /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);
}
function errorCallback(e) {
    console.log("Can't access user media", e);
}
function log(type, code) {
    var message = type + ": " + code;
    console.log(message);
    document.getElementById('message').innerText = message;
}
function resize(video, canvas) {
    var screenWidth = document.documentElement.clientWidth;
    var screenHeight = document.documentElement.clientHeight;
    var videoWidth = video.width;
    var videoHeight = video.height;
    var message = isMobile() ? "m#" : 'd#';
    message += window.orientation + '>';
    if (!isMobile()) {
        if (screenWidth / screenHeight > videoWidth / videoHeight) {
            canvas.width = videoWidth / videoHeight * screenHeight;
        }
        else {
            canvas.height = videoHeight / videoWidth * screenWidth;
        }
    }
    else {
        if (screenWidth / screenHeight > videoWidth / videoHeight) {//进入横屏
            if (videoWidth > videoHeight) {//横屏开始
                canvas.width = videoWidth / videoHeight * screenHeight;
            }
            else {//竖屏开始
                canvas.width = videoHeight / videoWidth * screenHeight;
            }
        }
        else {//进入竖屏
            if (videoWidth > videoHeight) {//横屏开始
                canvas.height = videoWidth / videoHeight * screenWidth;
            }
            else {//竖屏开始
                canvas.height = videoHeight / videoWidth * screenWidth;
            }
        }
    }
    if (screenWidth / screenHeight > videoWidth / videoHeight) {
        canvas.height = screenHeight;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        canvas.style.top = 0;
        canvas.style.left = (screenWidth - canvas.clientWidth) / 2 + 'px';
    }
    else {
        canvas.width = screenWidth;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        canvas.style.top = (screenHeight - canvas.clientHeight) / 2 + 'px';
        canvas.style.left = 0;
    }
}
