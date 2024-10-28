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

    // 播放源选择变化时的事件处理
    sourceSelector.addEventListener('change', function () {
        const selectedSource = sourceSelector.value;
        console.log('选择的播放源:', selectedSource);
        // 这里可以添加更换播放源的逻辑，例如更新视频URL等
        get_play_url_list(global_id, selectedSource);
    });

    // 集数选择变化时的事件处理
    episodeSelector.addEventListener('change', function () {
        // 获取当前选中的选项的值
        // 这里可以添加更换集数的逻辑，例如更新视频内容等
        const js_data = JSON.parse(episodeSelector.value);
        // console.log('选择的集数:', data);
        document.title = g_title + "-" + js_data.episode_name;
        play_url_plus(js_data);
    });


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
                    var data = response['data'];
                    var play_url = data['play_url'];
                    play_url(play_url);
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
            const option = document.createElement('option');
            option.value = play_list[i]['code'];
            option.text = play_list[i]['name'];
            source_select.appendChild(option);
            //如果找到地址，直接把地址添加到集数中，并且自动播放第一个
            if (play_list[i]['list'].length > 0 && play_list[i]['list'][0]['play_url'].indexOf("m3u8") !== -1) {
                for (let j = 0; j < play_list[i]['list'].length; j++) {
                    const episode_option = document.createElement('option');
                    episode_option.value = JSON.stringify(play_list[i]["list"][j])
                    episode_option.text = play_list[i]['list'][j]['episode_name'];
                    // epsisode_option.dataset.data = play_list[i]['list'][j];
                    episode_select.append(episode_option)
                    if (j === 0) {
                        episode_select.value = play_list[i]["list"][j]['play_url'];
                    }
                }
            }
        }
        if (episode_select.innerHTML === "") {
            get_play_url_list(movie['id'], play_list[0]['code']);
        }
    }

    function get_play_url_list(id, from_code, play_url = "undefine", episode_id = "13283680") {
        var json_data = {"movie_id": id, "from_code": from_code, "timestamp": get_timestamp()}
        var url = 'https://app-v1.ecoliving168.com/api/v1/movie_addr/parse_url'
        var par = "";
        url = "https://app-v1.ecoliving168.com/api/v1/movie_addr/list"
        par = JSON.stringify(json_data)

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
                datas = response['data'];
                const episode_select = document.getElementById('episode');
                episode_select.innerHTML = "";//清空内容
                for (let i = 0; i < datas.length; i++) {
                    const episode_option = document.createElement('option');
                    episode_option.value = JSON.stringify(datas[i]);
                    episode_option.text = datas[i]['episode_name'];
                    // episode_option.dataset.data = datas[i];
                    episode_select.append(episode_option)
                    if (i === 0) {
                        play_url_plus(datas[i]);
                    }

                }
            },
            fail: function (status) {
                console.log(status);
            }
        });
    }

});

