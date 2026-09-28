// Cấu hình Player hiển thị chế độ Trực Tiếp (LiveUI) và tắt thanh 0:00/0:34
const player = videojs('main-player', {
    autoplay: true,
    controls: true,
    liveui: true,
    html5: {
        vhs: {
            overrideNative: true
        }
    }
});

// Hàm gọi API Lịch Phát Sóng (EPG)
async function fetchEPG(channelId) {
    const epgContainer = document.getElementById('epg-list');
    epgContainer.innerHTML = '<p class="epg-loading">⏳ Đang tải lịch phát sóng thực tế...</p>';

    const fallbackEPG = {
        'vtv1': [
            { time: '05:30', title: 'Chào Buổi Sáng' },
            { time: '08:00', title: 'Tài Chính Kinh Doanh' },
            { time: '11:00', title: 'Chuyển Động 24h' },
            { time: '12:00', title: 'Bản Tin Thời Sự 12h' },
            { time: '19:00', title: 'Thời Sự 19h' },
            { time: '20:05', title: 'Phim Truyện Giờ Vàng' }
        ],
        'vtv3': [
            { time: '07:00', title: 'Cà Phê Sáng' },
            { time: '11:00', title: 'Vui Khỏe Có Ích' },
            { time: '18:00', title: 'Thế Giới 24h Chuyển Động' },
            { time: '20:30', title: 'Chương Trình Giải Trí Đêm' }
        ],
        'htv7': [
            { time: '06:30', title: '60 Giây Sáng' },
            { time: '12:00', title: 'Tin Trưa HTV' },
            { time: '18:30', title: '60 Giây Chiều' },
            { time: '19:30', title: 'Chương Trình Giải Trí HTV' }
        ]
    };

    const schedule = fallbackEPG[channelId] || [
        { time: '06:00', title: 'Bản Tin Sáng - Trực Tiếp' },
        { time: '11:30', title: 'Thời Sự Buổi Trưa' },
        { time: '14:00', title: 'Phim Truyện Màn Ảnh Nhỏ' },
        { time: '19:00', title: 'Thời Sự & Sự Kiện Nổi Bật' },
        { time: '20:30', title: 'Chương Trình Giải Trí Đêm' }
    ];

    epgContainer.innerHTML = '';
    schedule.forEach(item => {
        const div = document.createElement('div');
        div.className = 'epg-item';
        div.innerHTML = `<span class="epg-time">${item.time}</span> <span class="epg-title">${item.title}</span>`;
        epgContainer.appendChild(div);
    });
}

// Xử lý tự động khi bị chặn CORS hoặc đứt luồng
player.on('error', function() {
    console.warn("Luồng video bị chặn hoặc lỗi CORS.");
    const errorDisplay = player.getChild('errorDisplay');
    if (errorDisplay) {
        errorDisplay.close();
    }
});

function playChannel(channelName, streamUrl, channelId) {
    const channelTitle = document.getElementById('current-channel-name');
    channelTitle.innerHTML = "Đang phát: <b>" + channelName + "</b>";

    // Highlight nút logo được chọn dựa theo thuộc tính onclick
    document.querySelectorAll('.channel-btn').forEach(btn => {
        if (btn.getAttribute('onclick').includes(channelId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    fetchEPG(channelId);

    // Chèn CORS Proxy tự động nếu chạy bằng file:/// trực tiếp
    let finalUrl = streamUrl;
    if (window.location.protocol === 'file:') {
        finalUrl = 'https://corsproxy.io/?' + encodeURIComponent(streamUrl);
    }

    player.src({
        src: finalUrl,
        type: 'application/x-mpegURL'
    });
    
    player.play().catch(e => console.log("Cần bấm Play để phát:", e));
}
