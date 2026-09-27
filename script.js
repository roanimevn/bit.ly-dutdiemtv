let hlsPlayer = null;

function playChannel(channelName, streamUrl) {
    const video = document.getElementById('video-player');
    const channelTitle = document.getElementById('current-channel-name');
    const liveIndicator = document.getElementById('live-indicator');
    
    // Cập nhật tên kênh & Bật nhãn Trực tiếp
    channelTitle.innerHTML = "Đang phát: <b>" + channelName + "</b>";
    liveIndicator.style.display = "block";

    // Đánh dấu nút active
    const buttons = document.querySelectorAll('.channel-btn');
    buttons.forEach(btn => {
        if (btn.innerText.trim() === channelName || channelName.includes(btn.innerText.trim())) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Phát bằng HLS.js
    if (Hls.isSupported()) {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
        hlsPlayer = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hlsPlayer.loadSource(streamUrl);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(err => console.log("Cần tương tác để phát video:", err));
        });
    } 
    // Hỗ trợ Safari/iOS
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function () {
            video.play();
        });
    } else {
        alert("Trình duyệt không hỗ trợ định dạng phát trực tiếp này!");
    }
}
