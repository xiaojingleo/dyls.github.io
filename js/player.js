var player = undefined;
var hls = undefined;
var list_type = "tj";
var page_index = 1;
function play(play_url) {
    // let play_url = $("#url").val()
    if (player === undefined) {
        player = document.getElementById('player-container-id');
        hls = new Hls();

        // player = TCPlayer('player-container-id', {
        //     sources: [{
        //         src: url,
        //     }],
        //     // licenseUrl需自己去腾讯云申请
        //     licenseUrl: 'https://xxxxxxxxxxxxxx',
        // });
    }
    hls.loadSource(play_url);
    hls.attachMedia(player);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
        player.play();
    });
    // var url = "https://app-v1.ecoliving168.com/api/v1/movie_addr/list";
    // var data = {
    //     pack: 'Jm31drzXH1kh6qTPsTHmoMDLjzFz0sGHctxIvHhJ9-3M57LFGsRebAClOcVIM1WuMgVNNcx02zZrr5LOlNctAHMgzy19az_BFdHrofUhooomi8SB8rjd2qfTX463QcR3g8R8Ij46YVufOkQJF0a71B4jrgfaxqlydW4ChjO2mpRaGZQUz0YsubWPKviQhi9H3VUIFKJM7CJCP3s6I7lvEIzMWNlDbwPtnbLtXDTUSwn4gHWQ06MbDBoJGhcc_dAiXH83cTym9Qbcx5jwBC5SqhxVoklmo_c64hws_r39BgHOX2OPpo95VI71ypVyGv2WPoDfYFvCmEmyb2EROZJkgA',
    //     signature: '08010b086b5bf785448cd4567a35fbe2'
    // };
    //
    // ajax({
    //     url: url,              //请求地址
    //     type: "GET",                       //请求方式
    //     data: data,        //请求参数
    //     dataType: "json",
    //     success: function (response, xml) {
    //         // 此处放成功后执行的代码
    //         console.log(response);
    //         json_data = JSON.parse(response)
    //         play_url = json_data['data'][0]["play_url"]
    //         // player.pause();
    //         // console.log(play_url)
    //         // player.src(play_url); // url 播放地址
    //         hls.loadSource(play_url);
    //         hls.on(Hls.Events.MANIFEST_PARSED, function () {
    //             player.play();
    //         });
    //     },
    //     fail: function (status) {
    //         // 此处放失败后执行的代码
    //         console.log(status);
    //     }
    // });

}

function search() {
    let keyword = $("#searchBox").val()
    if (keyword !== '') {
        get_search_list(keyword)
    } else {
        alert('请输入搜索内容')
    }
}

function get_list(type_id, page = 1, _class = '类型', area = "地区", year = "年份", pagesize = "21") {
    const url = "https://app-v1.ecoliving168.com/api/v1/movie/screen/list";
    const par = get_list_params(type_id);
    const pack = get_pack(par);
    const signature = get_sign(pack);
    // console.log(pack, '\n', signature);
    const data = {pack: pack, signature: signature};
    ajax({
        url: url,              //请求地址
        type: "GET",                       //请求方式
        data: data,        //请求参数
        dataType: "json",
        success: function (response, xml) {
            // 此处放成功后执行的代码
            console.log(response);
            // json_data = JSON.parse(response)
            parse_list(response);
        },
        fail: function (status) {
            // 此处放失败后执行的代码
            console.log(status);
        }
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

// 渲染电影列表
function renderMovieList(movie) {
    const movieList = document.getElementById('movieList');
    movieList.innerHTML = ''; // 清空现有列表

    const movieItem = document.createElement('div');
    movieItem.className = 'movie-item';

    const moviePoster = document.createElement('img');
    moviePoster.src = movie['cover'];
    // moviePoster.alt = movie.title;
    moviePoster.className = 'movie-poster';

    const movieInfo = document.createElement('div');
    movieInfo.className = 'movie-info';

    const titleElement = document.createElement('h3');
    titleElement.textContent = movie['name'];

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = movie['content'];

    const episodesElement = document.createElement('p');
    // episodesElement.textContent = `Episodes: ${movie.episodes}`;

    movieInfo.appendChild(titleElement);
    movieInfo.appendChild(descriptionElement);
    movieInfo.appendChild(episodesElement);

    movieItem.appendChild(moviePoster);
    movieItem.appendChild(movieInfo);

    movieList.appendChild(movieItem);

    const play_list = movie['play_from']
    for (let i = 0; i < play_list.length; i++) {
        if (play_list[i]['list'].length > 0) {
            if (play_list[i]['list'][0]['play_url'].indexOf("m3u8") !== -1) {
                play(play_list[i]['list'][0]['play_url'])
                break;
            }
            continue
            // get_play_url(movie['id'], play_list[i]['code'], play_list[i]['list'][0]['play_url'], play_list[i]['list'][0]['episode_id']);
        } else
            get_play_url(movie['id'], play_list[i]['code']);
        break;
    }
    // get_play_url(movie['id'],play_list[0]['play_url']);
}

function get_play_url(id, from_code, play_url = "undefine", episode_id = "13283680") {
    var json_data = {"movie_id": id, "from_code": from_code, "timestamp": get_timestamp()}
    var url = 'https://app-v1.ecoliving168.com/api/v1/movie_addr/parse_url'
    var par = "";
    if (play_url !== "undefine") {
        json_data = {
            "from_code": from_code,
            "play_url": play_url,
            "episode_id": episode_id,
            "type": "play",
            "timestamp": get_timestamp()
        }
        url = 'https://app-v1.ecoliving168.com/api/v1/movie_addr/parse_url'
        par = JSON.stringify(json_data)
    } else {
        url = "https://app-v1.ecoliving168.com/api/v1/movie_addr/list"
        par = JSON.stringify(json_data)
    }

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
            if (play_url !== "undefine") {
                play(response['data']['play_url']);
            } else {
                play(response['data'][0]['play_url']);
            }
        },
        fail: function (status) {
            console.log(status);
        }
    });
}

function get_search_list(keyword) {
    const url = "https://app-v1.ecoliving168.com/api/v1/movie/search"
    const par = get_search_params(keyword);
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
            addItem(response['data']['list']);
        },
        fail: function (status) {
            console.log(status);
        }
    });
}

function addItem(items) {
    // 获取容器元素
    const listContainer = document.getElementById('listContainer');
    // listContainer.innerHTML = '';// 清空容器内容
    for (const item of items) {
        // 创建新的列表项元素
        const listItem = document.createElement('div');
        listItem.classList.add('list-item');
        listItem.dataset.id = item['id']; // Set the hidden data-id attribute
        // 创建图片元素

// Create and add the image
        const img = document.createElement('img');
        img.src = item['cover'];
        listItem.appendChild(img);

        // Create and add the label
        const label = document.createElement('div');
        label.classList.add('list-item-label');
        label.textContent = item['label'];
        listItem.appendChild(label);

        // Create and add the title

        const titleElement = document.createElement('div');
        titleElement.classList.add('list-item-title');
        titleElement.textContent = item['name'];
        listItem.appendChild(titleElement);

        // 将所有元素添加到内容容器中

        // 将列表项添加到容器中
        listContainer.appendChild(listItem);
        // 为新元素添加点击事件监听器
        listItem.addEventListener('click', function () {
            // 在这里处理点击事件
            // console.log('Clicked on newly added item:', listItem);
            get_detail(listItem.dataset.id);
            // 执行其他操作...
        });
    }

}

function parse_list(data) {
    var json = JSON.parse(data);
    addItem(json['data']["list"]);
    // var url = "https://app-v1.ecoliving168.com/api/v1/movie_addr/list";
    // var data = {
    //     pack: 'Jm31drzXH1kh6qTPsTHmoMDLjzFz0sGHctxIvHhJ9-3M57LFGsRebAClOcVIM1WuMgVNNcx02zZrr5LOlNctAHMgzy19az_BFdHrofUhooomi8SB8rjd2qfTX463QcR3g8R8Ij46YVufOkQJF0a71B4jrgfaxqlydW4ChjO2mpRaGZQUz0YsubWPKviQhi9H3VUIFKJM7CJCP3s6I7lvEIzMWNlDbwPtnbLtXDTUSwn4gHWQ06MbDBoJGhcc_dAiXH83cTym9Qbcx5jwBC5SqhxVoklmo_c64hws_r39BgHOX2OPpo95VI71ypVyGv2WPoDfYFvCmEmyb2EROZJkgA',
    //     signature: '08010b086b5bf785448cd4567a35fbe2'
    // };
}

function get_index_list(){
    const par = {"timestamp":get_timestamp()};
    const pack = get_pack(JSON.stringify(par));
    const signature = get_sign(pack);
    const data = {pack: pack, signature: signature};
    ajax(
        {
            url: "https://app-v1.ecoliving168.com/api/v1/movie/index_recommend",
            type:"GET",
            data: data,
            dataType: "json",
            success: function (response, xml) {
                return JSON.parse(response)
                // console.log(response);
                // const config_str = AES_CBC_decrypt(response.toString().replaceAll("_","\/").replaceAll("-","+"));
            },
            fail: function (status) {
                console.log(status);
                return status;
            }
        }
    );
}

function get_config(){
    const par = {"timestamp":get_timestamp()};
    const pack = get_pack(JSON.stringify(par));
    const signature = get_sign(pack);
    const data = {pack: pack, signature: signature};
    ajax(
        {
            url: "https://app-v1.ecoliving168.com/api/v1/app/config",
            type:"GET",
            data: data,
            dataType: "json",
            success: function (response, xml) {
                // console.log(response);
                const config_str = AES_CBC_decrypt(response.toString().replaceAll("_","\/").replaceAll("-","+"));
            },
            fail: function (status) {
                console.log(status);
            }
        }
    )
}


// get_index_list();
$(window).scroll(function() {
    var $window = $(this);
    var scrollTop = $window.scrollTop();
    var documentHeight = $(document).height();
    var windowHeight = $window.height();

    if (scrollTop + windowHeight >= documentHeight) {
        // 滚动到底部的处理逻辑
        console.log('已滚动到底部');
        // 可以在这里添加加载更多内容的逻辑
        get_list(list_type,++page_index);
    }
});

