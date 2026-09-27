let hlsPlayer = null;

function playChannel(channelName, streamUrl) {
    const video = document.getElementById('video-player');
    const channelTitle = document.getElementById('current-channel-name');
    
    // Cập nhật tên kênh hiển thị
    channelTitle.innerText = "▶ Đang phát: " + channelName;

    // Đánh dấu nút đang được chọn (Active)
    const buttons = document.querySelectorAll('.channel-btn');
    buttons.forEach(btn => {
        if (btn.innerText.trim() === channelName || channelName.includes(btn.innerText.trim())) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Phát bằng HLS.js (dành cho Chrome, Firefox, Edge, Android...)
    if (Hls.isSupported()) {
        if (hlsPlayer) {
            hlsPlayer.destroy(); // Hủy luồng phát hiện tại để giải phóng bộ nhớ
        }
        hlsPlayer = new Hls();
        hlsPlayer.loadSource(streamUrl);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(error => {
                console.log("Tự động phát bị chặn bởi trình duyệt:", error);
            });
        });
    } 
    // Hỗ trợ Safari (iOS / macOS tích hợp sẵn HLS)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function () {
            video.play();
        });
    } else {
        alert("Trình duyệt của bạn không hỗ trợ phát dạng luồng video HLS này!");
    }
}
