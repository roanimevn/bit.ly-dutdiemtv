// Player hỗ trợ chế độ LiveUI hiển thị nút TRỰC TIẾP thay vì 0:00 / 0:34
const player = videojs('main-player', {
    autoplay: true,
    controls: true,
    liveui: true,
    html5: {
        hls: {
            overrideNative: true // Tắt giải mã mặc định giúp Smart TV chạy hình mượt mà không bị đen
        }
    }
});

// Hàm gọi API Lịch Phát Sóng (EPG)
async function fetchEPG(channelId) {
    const epgContainer = document.getElementById('epg-list');
    epgContainer.innerHTML = '<p class="epg-loading">⏳ Đang tải lịch phát sóng thực tế...</p>';

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
        console.log("Sử dụng EPG dự phòng:", error);
    }

    // Dữ liệu EPG dự phòng theo các nhóm kênh mới
    const fallbackEPG = {
        'vtv5tnb': [
            { time: '06:00', title: 'Chương Trình Tiếng Khơ-me' },
            { time: '11:30', title: 'Thời Sự Tây Nam Bộ' },
            { time: '19:00', title: 'Thời Sự VTV' }
        ],
        'vtv5tn': [
            { time: '06:00', title: 'Chương Trình Tiếng Ba-na' },
            { time: '12:00', title: 'Bản Tin Tây Nguyên' },
            { time: '19:00', title: 'Thời Sự VTV' }
        ],
        'htv7': [
            { time: '06:30', title: '60 Giây Sáng' },
            { time: '12:00', title: 'Tin Trưa HTV' },
            { time: '18:30', title: '60 Giây Chiều' },
            { time: '19:30', title: 'Chương Trình Giải Trí HTV' }
        ],
        'htv9': [
            { time: '06:00', title: 'Chào Ngày Mới' },
            { time: '11:30', title: 'Thời Sự HTV' },
            { time: '20:00', title: 'Phim Truyện Giờ Vàng HTV' }
        ],
        'onsports': [
            { time: '08:00', title: 'Tổng Hợp Thể Thao Trong Nước' },
            { time: '15:00', title: 'Trực Tiếp Giải Bóng Đá V-League' },
            { time: '20:00', title: 'Bản Tin ON Sports News' }
        ]
    };

    const schedule = fallbackEPG[channelId] || [
        { time: '06:00', title: 'Bản Tin Sáng - Trực Tiếp' },
        { time: '11:30', title: 'Thời Sự Buổi Trưa' },
        { time: '14:00', title: 'Phim Truyện Màn Ảnh Nhỏ' },
        { time: '19:00', title: 'Thời Sự & Sự Kiện Nổi Bật' },
        { time: '20:30', title: 'Chương Trình Giải Trí Đặc Sắc' }
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

    document.querySelectorAll('.channel-btn').forEach(btn => {
        if (btn.innerText.trim() === channelName || channelName.includes(btn.innerText.trim())) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    fetchEPG(channelId);

    player.src({
        src: streamUrl,
        type: 'application/x-mpegURL'
    });
    
    player.play();
}
