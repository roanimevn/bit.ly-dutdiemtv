let hlsPlayer = null;

// API/Database Lịch phát sóng tiêu chuẩn
const epgDatabase = {
    'vtv1': [
        { time: '06:00', title: 'Chào Buổi Sáng' },
        { time: '08:00', title: 'Tài Chính Kinh Doanh' },
        { time: '12:00', title: 'Bản Tin Thời Sự 12h' },
        { time: '19:00', title: 'Thời Sự 19h' },
        { time: '20:10', title: 'Phim Truyện Giờ Vàng' }
    ],
    'vtv3': [
        { time: '07:00', title: 'Cà Phê Sáng' },
        { time: '12:00', title: 'Chuyện Trưa 12h' },
        { time: '20:30', title: 'Gameshow Giải Trí Mới' }
    ],
    'sctv15': [
        { time: '08:00', title: 'Tổng Hợp Ngoại Hạng Anh' },
        { time: '20:00', title: 'Trực Tiếp Thể Thao' }
    ],
    'thvl1': [
        { time: '11:30', title: 'Thời Sự THVL' },
        { time: '20:00', title: 'Phim Truyện Việt Nam' }
    ]
};

function fetchEPG(channelId) {
    const epgContainer = document.getElementById('epg-list');
    epgContainer.innerHTML = '';

    const schedule = epgDatabase[channelId] || [
        { time: '08:00', title: 'Chương Trình Buổi Sáng - Trực Tiếp' },
        { time: '11:30', title: 'Bản Tin Thời Sự Mới Nhất' },
        { time: '14:00', title: 'Phim Truyện Tối Ưu Màn Ảnh' },
        { time: '19:00', title: 'Thời Sự & Sự Kiện Nổi Bật' },
        { time: '20:30', title: 'Chương Trình Giải Trí Đặc Sắc' }
    ];

    schedule.forEach(item => {
        const div = document.createElement('div');
        div.className = 'epg-item';
        div.innerHTML = `<span class="epg-time">${item.time}</span> <span class="epg-title">${item.title}</span>`;
        epgContainer.appendChild(div);
    });
}

function playChannel(channelName, streamUrl, channelId) {
    const video = document.getElementById('video-player');
    const channelTitle = document.getElementById('current-channel-name');
    const liveIndicator = document.getElementById('live-indicator');
    
    channelTitle.innerHTML = "Đang phát: <b>" + channelName + "</b>";
    liveIndicator.style.display = "block";

    document.querySelectorAll('.channel-btn').forEach(btn => {
        if (btn.innerText.trim() === channelName || channelName.includes(btn.innerText.trim())) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    fetchEPG(channelId);

    // Cấu hình fix lỗi đen màn hình / mất hình trên Smart TV
    if (Hls.isSupported()) {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
        hlsPlayer = new Hls({
            enableWorker: false,
            lowLatencyMode: false,
            backBufferLength: 90
        });
        hlsPlayer.loadSource(streamUrl);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(e => console.log("TV Autoplay block:", e));
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function () {
            video.play();
        });
    }
}
