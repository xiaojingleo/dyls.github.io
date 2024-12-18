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
// 播放
    var player = undefined;
    var hls = undefined;
    var intervalid = undefined;
    let global_progress = getVideoProgressCookie(global_id);

    function play_url(url) {

        if (player === undefined) {
            player = TCPlayer('player-container-id', {
                sources: [{
                    // src: TCPlayer_Sources,
                    controls: true,
                    autoplay: true
                }],
                // licenseUrl需自己去腾讯云申请
                licenseUrl: 'https://license.vod2.myqcloud.com/license/v2/1254430396_1/v_cube.license',
            });
        }
        player.src(url); // url 播放地址

        //播放完成，自动播放下一集
        player.one('ended', function () {
            console.log('播放结束');
            if (global_progress === 0)
                return;
            global_progress = 0;
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
        //只触发一次
        player.one('canplay', function () {
            console.log('可以播放时');
            if (global_progress > player.currentTime()) {
                player.currentTime(global_progress);
            }
            player.play();
        });
        player.on('timeupdate', function () { // 播放时间更新时触发
            const progress = player.currentTime();
            setVideoProgressCookie(global_id, progress, 7);
        });

    }

    function play_url_old(play_url) {
        // let play_url = $("#url").val()
        if (player === undefined) {
            player = document.getElementById('videoPlayer');
            // player.addEventListener('timeupdate', () => {
            //     const progress = player.currentTime
            //     setVideoProgressCookie(global_id, progress, 7);
            // });
            hls = new Hls();
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                player.play();
            });
            hls.on(Hls.Events.MANIFEST_LOADED, function () {
                if (global_progress > player.currentTime) {
                    setTimeout(() => {
                        player.currentTime = global_progress;
                    }, 3000);
                }
                console.log('manifest loaded');
            });
        }
        for (let i = 0; i < videoFiles.length; i++) {
            if (videoFiles[i] === play_url) {
                currentIndex = i;
                break;
            }
        }
        hls.loadSource(play_url);
        hls.attachMedia(player);
    }

    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        id = params.get('id');
        return id;
    }

    get_detail(global_id);
    const sourceSelector = document.getElementById('source');
    const episodeSelector = document.getElementById('episode');

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
                TCPlayer_Sources = [];
                for (let j = 0; j < play_list[i]['list'].length; j++) {
                    const episode_option = document.createElement('button');
                    episode_option.className = 'filter-button';
                    episode_option.dataset.filter = 'episode';
                    episode_option.dataset.value = JSON.stringify(play_list[i]["list"][j])
                    episode_option.innerHTML = play_list[i]['list'][j]['episode_name'];
                    videoFiles.push(play_list[i]["list"][j]['play_url']);
                    TCPlayer_Sources.push({src: play_list[i]["list"][j]['play_url'], type: 'videoType/VOD'});
                    // currentIndex = 0;
                    if (j === currentIndex) {
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
        } else {
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
                TCPlayer_Sources = [];
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

                        for (let i = 0; i < videoFiles.length; i++) {
                            if (videoFiles[i] === data.play_url) {
                                currentIndex = i;
                                break;
                            }
                        }

                        play_url_plus(data);
                    });
                    episode_select.append(episode_button)
                    videoFiles.push(datas[i]['play_url']);
                    TCPlayer_Sources.push({src: datas[i]['play_url'], type: 'videoType/VOD'});
                    // currentIndex = 0;
                    if (i === currentIndex) {
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


    //添加视频源和集数按钮事件
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
                    global_progress = getVideoProgressCookie(global_id);
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


    // 函数：设置cookie
    function setVideoProgressCookie(videoId, progress, days) {
        const cookieName = `videoProgress_${videoId}`;
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${cookieName}=${encodeURIComponent(progress)}; expires=${expires}; path=/`;
    }

    // 函数：获取cookie
    function getVideoProgressCookie(videoId) {
        const cookieName = `videoProgress_${videoId}`;
        const cookies = document.cookie.split('; ');
        for (let cookie of cookies) {
            const [name, value] = cookie.split('=');
            if (decodeURIComponent(name.trim()) === cookieName) {
                return decodeURIComponent(value.trim());
            }
        }
        return null; // 如果没有找到cookie，则返回null
    }

    // Initial setup
    // videoPlayer.addEventListener('loadedmetadata', () => {
    //     durationDisplay.textContent = formatTime(videoPlayer.duration);
    // });
    //
    // videoPlayer.addEventListener('timeupdate', () => {
    //     const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    //     setVideoProgressCookie(global_id, videoPlayer.currentTime, 7);
    //     progressBar.value = percentage;
    //     currentTimeDisplay.textContent = formatTime(videoPlayer.currentTime);
    // });
    // // Play/Pause button
    // playPauseButton.addEventListener('click', () => {
    //     if (videoPlayer.paused || videoPlayer.ended) {
    //         videoPlayer.play();
    //         playPauseButton.textContent = '暂停';
    //     } else {
    //         videoPlayer.pause();
    //         playPauseButton.textContent = '播放';
    //     }
    // });
    // // Progress bar
    // progressBar.addEventListener('input', () => {
    //     const percentage = progressBar.value / 100;
    //     videoPlayer.currentTime = percentage * videoPlayer.duration;
    // });
    //
    // // Fullscreen button
    // fullscreenButton.addEventListener('click', () => {
    //     if (!document.fullscreenElement) {
    //         videoPlayer.requestFullscreen().catch(err => {
    //             alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    //         });
    //     } else {
    //         document.exitFullscreen();
    //     }
    // });
    //
    // // Speed control
    // speedControl.addEventListener('change', () => {
    //     videoPlayer.playbackRate = parseFloat(speedControl.value);
    // });

    // Format time function
    // function formatTime(seconds) {
    //     const minutes = Math.floor(seconds / 60);
    //     const remainingSeconds = Math.floor(seconds % 60);
    //     return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    // }

    // Auto-hide controls on mouse leave
    // const videoContainer = document.querySelector('.video-container');
    // videoContainer.addEventListener('mouseleave', () => {
    //     setTimeout(() => {
    //         const controls = document.getElementById('controls');
    //         controls.style.opacity = '0';
    //     }, 2000); // Delay before hiding controls
    // });
    // videoContainer.addEventListener('mouseenter', () => {
    //     const controls = document.getElementById('controls');
    //     controls.style.opacity = '1';
    // });
    // Long press for fast forward (simplified version, not fully implemented)
    // let pressTimer;
    // videoPlayer.addEventListener('mousedown', (e) => {
    //     pressTimer = setTimeout(() => {
    //         videoPlayer.playbackRate = 4; // Fast forward speed
    //     }, 1000); // Delay before considering it a long press
    // });
    // videoPlayer.addEventListener('mouseup', (e) => {
    //     clearTimeout(pressTimer);
    //     videoPlayer.playbackRate = parseFloat(speedControl.value); // Reset to selected speed
    // });
    // videoPlayer.addEventListener('mouseleave', (e) => {
    //     clearTimeout(pressTimer);
    //     videoPlayer.playbackRate = parseFloat(speedControl.value); // Reset to selected speed
    // });


});

let global_progress = 0;
let videoFiles = [];
let TCPlayer_Sources = [];
let currentIndex = 0;
