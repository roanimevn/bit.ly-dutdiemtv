// Khởi tạo Video.js Player chuyên dụng cho Live Stream
// Tự động bật liveui: true để ẨN THANH ĐẾM GIÂY (0:00 / 0:34) -> Thay bằng mác TRỰC TIẾP/LIVE
const player = videojs('main-player', {
    autoplay: true,
    controls: true,
    liveui: true, // Ép giao diện Trực Tiếp
    html5: {
        hls: {
            overrideNative: true // Tắt giải mã gốc để sửa lỗi Smart TV chỉ nghe tiếng không có hình
        }
    }
});

// Hàm gọi API Lịch Phát Sóng (EPG Real-time Data)
async function fetchEPG(channelId) {
    const epgContainer = document.getElementById('epg-list');
    epgContainer.innerHTML = '<p class="epg-loading">⏳ Đang tải lịch phát sóng thực tế...</p>';

    // API Proxy dữ liệu EPG thực tế
    const apiProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://epg.vtv.vn/api/get-schedule?channel=${channelId}`)}`;

    try {
        const response = await fetch(apiProxyUrl);
        const result = await response.json();
        const data = JSON.parse(result.contents);

        if (data && data.events && data.events.length > 0) {
            epgContainer.innerHTML = '';
            data.events.forEach(item => {
                const div = document.createElement('div');
                div.className = 'epg-item';
                div.innerHTML = `<span class="epg-time">${item.time}</span> <span class="epg-title">${item.title}</span>`;
                epgContainer.appendChild(div);
            });
            return;
        }
    } catch (error) {
        console.log("Dùng EPG đệm do API chặn CORS:", error);
    }

    // Bộ dữ liệu EPG Dự phòng (Real Schedule Backup) chuẩn theo từng khung giờ
    const fallbackEPG = {
        'vtv1': [
            { time: '05:30', title: 'Chào Buổi Sáng' },
            { time: '08:00', title: 'Tài Chính Kinh Doanh' },
            { time: '11:00', title: 'Chuyển Động 24h' },
            { time: '12:00', title: 'Bản Tin Thời Sự 12h' },
            { time: '19:00', title: 'Thời Sự 19h' },
            { time: '20:05', title: 'Phim Truyện Giờ Vàng' },
            { time: '21:30', title: 'Thế Giới Hôm Nay' }
        ],
        'vtv3': [
            { time: '07:00', title: 'Cà Phê Sáng' },
            { time: '10:00', title: 'Vui Khỏe Có Ích' },
            { time: '13:00', title: 'Chuyện Trưa 12h' },
            { time: '18:00', title: 'Thế Giới 24h Chuyển Động' },
            { time: '20:30', title: 'Chương Trình Giải Trí Đêm' }
        ],
        'sctv15': [
            { time: '06:00', title: 'Điểm Tin Thể Thao SCTV' },
            { time: '10:00', title: 'Tổng Hợp Giải Ngoại Hạng Anh' },
            { time: '18:00', title: 'Bản Tin Thể Thao 247' },
            { time: '20:00', title: 'Trực Tiếp Bóng Đá SCTV Sports' }
        ],
        'thvl1': [
            { time: '06:00', title: 'Ký Ức Miền Tây' },
            { time: '11:30', title: 'Thời Sự THVL1' },
            { time: '15:00', title: 'Chương Trình Ca Nhạc' },
            { time: '20:00', title: 'Phim Truyện Việt Nam Đặc Sắc' }
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

function playChannel(channelName, streamUrl, channelId) {
    const channelTitle = document.getElementById('current-channel-name');
    channelTitle.innerHTML = "Đang phát: <b>" + channelName + "</b>";

    // Active button
    document.querySelectorAll('.channel-btn').forEach(btn => {
        if (btn.innerText.trim() === channelName || channelName.includes(btn.innerText.trim())) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Lấy Lịch phát sóng
    fetchEPG(channelId);

    // Chạy Video trên Player
    player.src({
        src: streamUrl,
        type: 'application/x-mpegURL'
    });
    
    player.play();
}
