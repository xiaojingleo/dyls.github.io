document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const playPauseButton = document.getElementById('playPause');
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const fullscreenButton = document.getElementById('fullscreen');
    const speedControl = document.getElementById('speedControl');

    // const global_id = "73xAO";//getUrlParams();
    const global_id = getUrlParams();
    var g_title = "";

    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        id = params.get('id');
        return id;
    }


    get_detail(global_id);
    // Initial setup
    videoPlayer.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(videoPlayer.duration);
    });

    videoPlayer.addEventListener('timeupdate', () => {
        const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressBar.value = percentage;
        currentTimeDisplay.textContent = formatTime(videoPlayer.currentTime);
    });

    // Play/Pause button
    playPauseButton.addEventListener('click', () => {
        if (videoPlayer.paused || videoPlayer.ended) {
            videoPlayer.play();
            playPauseButton.textContent = '暂停';
        } else {
            videoPlayer.pause();
            playPauseButton.textContent = '播放';
        }
    });

    // Progress bar
    progressBar.addEventListener('input', () => {
        const percentage = progressBar.value / 100;
        videoPlayer.currentTime = percentage * videoPlayer.duration;
    });

    // Fullscreen button
    fullscreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            videoPlayer.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Speed control
    speedControl.addEventListener('change', () => {
        videoPlayer.playbackRate = parseFloat(speedControl.value);
    });

    // Format time function
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Auto-hide controls on mouse leave
    const videoContainer = document.querySelector('.container');
    videoContainer.addEventListener('mouseleave', () => {
        setTimeout(() => {
            const controls = document.getElementById('controls');
            controls.style.opacity = '0';
        }, 2000); // Delay before hiding controls
    });

    videoContainer.addEventListener('mouseenter', () => {
        const controls = document.getElementById('controls');
        controls.style.opacity = '1';
    });

    // Long press for fast forward (simplified version, not fully implemented)
    let pressTimer;
    videoPlayer.addEventListener('mousedown', (e) => {
        pressTimer = setTimeout(() => {
            videoPlayer.playbackRate = 4; // Fast forward speed
        }, 1000); // Delay before considering it a long press
    });

    videoPlayer.addEventListener('mouseup', (e) => {
        clearTimeout(pressTimer);
        videoPlayer.playbackRate = parseFloat(speedControl.value); // Reset to selected speed
    });

    videoPlayer.addEventListener('mouseleave', (e) => {
        clearTimeout(pressTimer);
        videoPlayer.playbackRate = parseFloat(speedControl.value); // Reset to selected speed
    });

    const sourceSelector = document.getElementById('source');
    const episodeSelector = document.getElementById('episode');


    // 集数选择变化时的事件处理
    // episodeSelector.addEventListener('click', function () {
    //     // 获取当前选中的选项的值
    //     // 这里可以添加更换集数的逻辑，例如更新视频内容等
    //     const js_data = JSON.parse(episodeSelector.value);
    //     // console.log('选择的集数:', data);
    //     document.title = g_title + "-" + js_data.episode_name;
    //     play_url_plus(js_data);
    // });


    function play_url_plus(js_data) {
        const playUrl = js_data.play_url;
        if (playUrl.indexOf("m3u8") > 0) {
            play_url(playUrl)
        } else {
            const json_data = {
                "from_code": js_data.from_code,
                "play_url": js_data.play_url,
                "episode_id": js_data.episode_id,
                "type": "play",
                "timestamp": get_timestamp()
            }

            var url = 'https://app-v1.ecoliving168.com/api/v1/movie_addr/parse_url'
            var par = JSON.stringify(json_data);
            const pack = get_pack(par);
            const signature = get_sign(pack);
            const data = {pack: pack, signature: signature};
            ajax({
                url: url,              //请求地址
                type: "GET",                       //请求方式
                data: data,        //请求参数
                dataType: "json",
                success: function (response, xml) {
                    // console.log(response);
                    response = JSON.parse(response);
                    let data = response['data'];
                    let url = data['play_url'];
                    play_url(url);
                },
                fail: function (status) {
                    console.log(status);
                }
            });
        }
    }

// var json_data = {"from_code":"youku","play_url":"","episode_id":"24929681","type":"play","timestamp":get_timestamp()}
//         // var json_data = {"movie_id": id, "from_code": from_code, "timestamp": get_timestamp()}
//         var url = 'https://app-v1.ecoliving168.com/api/v1/movie_addr/parse_url'
//         var par = "";
//     }

// 播放
    var player = undefined;
    var hls = undefined;

    function play_url(play_url) {
        // let play_url = $("#url").val()
        if (player === undefined) {
            player = document.getElementById('videoPlayer');
            hls = new Hls();
        }
        for (let i = 0; i < videoFiles.length; i++) {
            if (videoFiles[i] === play_url) {
                currentIndex = i;
                break;
            }
        }
        hls.loadSource(play_url);
        hls.attachMedia(player);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            player.play();
        });
    }

    function get_detail(id) {
        const url = "https://app-v1.ecoliving168.com/api/v1/movie/detail"
        const par = get_detail_params(id)
        const pack = get_pack(par);
        const signature = get_sign(pack);
        const data = {pack: pack, signature: signature};
        ajax({
            url: url,              //请求地址
            type: "GET",                       //请求方式
            data: data,        //请求参数
            dataType: "json",
            success: function (response, xml) {
                console.log(response);
                response = JSON.parse(response);
                renderMovieList(response['data'])
            },
            fail: function (status) {
                console.log(status);
            }
        });

    }

    function renderMovieList(movie) {
        const moviePoster = document.getElementById('video_poster');
        moviePoster.src = movie['cover'];

        const videltitle = document.getElementById('video-title');
        videltitle.textContent = movie['name'];
        document.title = movie['name'];
        g_title = movie['name'];
        const description = document.getElementById('video-description');
        description.textContent = movie['content'];

        const episodesElement = document.createElement('p');
        // episodesElement.textContent = `Episodes: ${movie.episodes}`;


        const play_list = movie['play_from']
        const source_select = document.getElementById('source');
        source_select.innerHTML = "";//清空内容
        const episode_select = document.getElementById('episode');
        episode_select.innerHTML = "";//清空内容

        for (let i = 0; i < play_list.length; i++) {
            //添加播放源
            const option = document.createElement('button');
            option.className = 'filter-button';
            option.dataset.filter = 'source';
            option.dataset.value = play_list[i]['code'];
            option.innerHTML = play_list[i]['name'];
            if (i === 0) {
                option.classList.add('active');
            }
            source_select.appendChild(option);
            //如果找到地址，直接把地址添加到集数中，并且自动播放第一个

            if (play_list[i]['list'].length > 0 && play_list[i]['list'][0]['play_url'].indexOf("m3u8") !== -1) {
                videoFiles = [];
                for (let j = 0; j < play_list[i]['list'].length; j++) {
                    const episode_option = document.createElement('button');
                    episode_option.className = 'filter-button';
                    episode_option.dataset.filter = 'episode';
                    episode_option.dataset.value = JSON.stringify(play_list[i]["list"][j])
                    episode_option.innerHTML = play_list[i]['list'][j]['episode_name'];

                    videoFiles.push(play_list[i]["list"][j]['play_url']);
                    currentIndex = 0;
                    if (j === 0) {
                        episode_option.classList.add('active');
                        // episode_select.value = play_list[i]["list"][j]['play_url'];
                    }
                    episode_select.append(episode_option)
                }
            }
        }
        add_filter_button_event();
        if (episode_select.innerHTML === "") {
            get_play_url_list(movie['id'], play_list[0]['code']);
        }else
        {
            play_url_plus({"play_url": videoFiles[currentIndex]});
        }
    }

    function get_play_url_list(id, from_code) {
        const json_data = {"movie_id": id, "from_code": from_code, "timestamp": get_timestamp()}
        // var url = 'https://app-v1.ecoliving168.com/api/v1/movie_addr/parse_url'
        // var par = "";
        const url = "https://app-v1.ecoliving168.com/api/v1/movie_addr/list"
        const par = JSON.stringify(json_data)

        const pack = get_pack(par);
        const signature = get_sign(pack);
        const data = {pack: pack, signature: signature};
        ajax({
            url: url,              //请求地址
            type: "GET",                       //请求方式
            data: data,        //请求参数
            dataType: "json",
            success: function (response, xml) {
                // console.log(response);
                response = JSON.parse(response);
                let datas = response['data'];
                const episode_select = document.getElementById('episode');
                episode_select.innerHTML = "";//清空内容
                videoFiles = [];
                for (let i = 0; i < datas.length; i++) {
                    const episode_button = document.createElement('button');
                    episode_button.className = 'filter-button';
                    episode_button.dataset.filter = 'episode';
                    episode_button.value = JSON.stringify(datas[i]);
                    episode_button.innerHTML = datas[i]['episode_name'];
                    episode_button.addEventListener('click', function (handle) {
                        const filterGroup = this.closest('.filter-buttons');
                        filterGroup.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
                        // 为当前按钮添加active类
                        this.classList.add('active');
                        const data = JSON.parse(handle.target.value);
                        play_url_plus(data);
                    });
                    episode_select.append(episode_button)
                    videoFiles.push(datas[i]['play_url']);
                    currentIndex = 0;
                    if (i === 0) {
                        play_url_plus(datas[i]);
                        episode_button.classList.add('active');
                    }
                }
                // add_filter_button_event();
            },
            fail: function (status) {
                console.log(status);
            }
        });
    }


    function add_filter_button_event() {
        const filterButtons = document.querySelectorAll('.filter-button');

        filterButtons.forEach(button => {
            button.addEventListener('click', function (handle) {
                // 移除当前筛选组内所有按钮的active类（允许多选，所以只针对当前组）
                const filterGroup = this.closest('.filter-buttons');
                filterGroup.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
                // 为当前按钮添加active类
                this.classList.add('active');
                // 获取当前按钮的data属性
                const filter = handle.target.dataset.filter;
                if (filter === 'source') {
                    get_play_url_list(global_id, this.dataset.value);
                } else if (filter === 'episode') {
                    const data = JSON.parse(this.value);
                    play_url_plus(data);
                }
            });
        });

        // 初始化时确保每个大选项中的“全部”按钮是active的（虽然HTML中已经设置，但这里再次确保）
        document.querySelectorAll('.filter-group .default').forEach(button => {
            if (!button.classList.contains('active')) {
                button.classList.add('active');
            }
        });
    }


    videoPlayer.addEventListener('ended', function () {
        currentIndex = (currentIndex + 1) % videoFiles.length;
        let data = {"play_url": videoFiles[currentIndex]}
        play_url_plus(data);
        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            if (button.dataset.filter === 'episode') {
                if (JSON.parse(button.value).play_url === videoFiles[currentIndex]) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        });
    });


});


let videoFiles = [];
let currentIndex = 0;

async function downloadM3U8() {
    const m3u8Url = videoFiles[currentIndex];

    try {
        // Step 1: Fetch M3U8 file content
        const response = await fetch(m3u8Url);
        const m3u8Text = await response.text();

        // Step 2: Parse M3U8 file
        const lines = m3u8Text.split('\n');
        const baseUri = new URL(m3u8Url).origin;
        const tsUrls = lines
            .filter(line => line.endsWith('.ts'))
            .map(line => new URL(line, baseUri).href);

        // Step 3: Download TS segments
        const tsBlobs = await Promise.all(tsUrls.map(url => fetchAndBlob(url)));

        // Step 4: Create a Blob for the entire video (this step is simplified)
        // Normally, you would need to concatenate the TS segments correctly
        // and possibly convert them to a single MP4 file using a backend service or FFmpeg.js
        const videoBlob = new Blob(tsBlobs, { type: 'video/mp2t' });

        // Step 5: Create a download link and trigger the download
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(videoBlob);
        downloadLink.download = 'downloaded_video.ts'; // Change extension if you know the final format
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

    } catch (error) {
        console.error('Error downloading M3U8:', error);
    }
}

async function fetchAndBlob(url) {
    const response = await fetch(url);
    return response.blob();
}