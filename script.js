// Khởi tạo Video.js Player
const player = videojs('my-video', {
    autoplay: true,
    controls: true,
    liveui: true // Ép trình phát chuyển sang chế độ TRỰC TIẾP (ẩn thanh đếm giây 0:00/0:34)
});

function playChannel(channelName, streamUrl) {
    const channelTitle = document.getElementById('current-channel-name');
    
    // Cập nhật tên kênh
    channelTitle.innerHTML = "Đang phát: <b>" + channelName + "</b>";

    // Đánh dấu nút active
    const buttons = document.querySelectorAll('.channel-btn');
    buttons.forEach(btn => {
        if (btn.innerText.trim() === channelName || channelName.includes(btn.innerText.trim())) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Thay đổi luồng phát video HLS và phát trực tiếp
    player.src({
        src: streamUrl,
        type: 'application/x-mpegURL'
    });
    
    player.play();
}
