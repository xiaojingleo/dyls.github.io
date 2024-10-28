document.addEventListener('DOMContentLoaded', function () {
    let global_page = 1;
    let global_total_page = 10;
    let global_type_id = 0;
    let global_params = {
        "type_id": "1",
        "sort": "by_default",
        "class": "类型",
        "area": "地区",
        "year": "年份",
        "page": "1",
        "pageSize": "21",
        "timestamp": get_timestamp()
    }

    const zonghe_container = document.getElementById('zonghe_id');
    const button1 = document.createElement('button');
    button1.className = 'filter-button';
    button1.dataset.filter = 'sort';
    button1.dataset.value = "by_default";
    button1.innerHTML = "综合";
    button1.classList.add('active');
    zonghe_container.appendChild(button1);
    const button2 = document.createElement('button');
    button2.className = 'filter-button';
    button2.dataset.filter = 'sort';
    button2.dataset.value = "by_time";
    button2.innerHTML = "最新";
    zonghe_container.appendChild(button2);
    const button3 = document.createElement('button');
    button3.className = 'filter-button';
    button3.dataset.filter = 'sort';
    button3.dataset.value = "by_hits";
    button3.innerHTML = "最热";
    zonghe_container.appendChild(button3);
    const button4 = document.createElement('button');
    button4.className = 'filter-button';
    button4.dataset.filter = 'sort';
    button4.dataset.value = "by_score";
    button4.innerHTML = "评分";
    zonghe_container.appendChild(button4);

    const par = {"timestamp": get_timestamp()};
    const pack = get_pack(JSON.stringify(par));
    const signature = get_sign(pack);
    const data = {pack: pack, signature: signature};
    ajax(
        {
            url: "https://app-v1.ecoliving168.com/api/v1/movie/index_recommend",
            type: "GET",
            data: data,
            dataType: "json",
            success: function (response, xml) {
                respose = JSON.parse(response)
                datas = respose['data'];
                datas.forEach(function (data) {
                    if (data.title === 'carousel')
                        var a = 1;
                    else if (data.layout === 'base') {
                        addItem(data, 'containers');
                    }
                });
            },
            fail: function (status) {
                console.log(status);
                return status;
            }
        }
    );


// 导航栏点击事件处理
    const navLinks = document.querySelectorAll('nav ul.nav-list li a.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            // 阻止链接的默认行为（即页面跳转）
            event.preventDefault();

            // 移除所有链接上的.active类
            navLinks.forEach(l => l.classList.remove('active'));

            // 在被点击的链接上添加.active类
            this.classList.add('active');

            // 可以在这里添加页面跳转或内容加载的逻辑
            // 例如，使用Ajax或Fetch API加载对应页面的内容
            // 或者简单地使用window.location.href进行页面跳转（如果不需要Ajax）

            // 例如，如果要使用Ajax（这里只是示例，实际应实现Ajax逻辑）：
            // loadContent(this.href.substring(1)); // 假设href是以#开头的伪链接
        });
    });

    // 如果有默认选中的链接（例如“首页”），可以在这里添加.active类
    // 例如，默认选中“首页”链接：
    document.querySelector('nav ul.nav-list li a.nav-link:first-of-type').classList.add('active');


    const totalPages = 10; // 动态设定总页数
    let currentPage = 1;

    const firstPageButton = document.getElementById('firstPage');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const lastPageButton = document.getElementById('lastPage');
    const pageInfo = document.getElementById('pageInfo');

    // const content = document.getElementById('content');

    function updatePageInfo() {
        pageInfo.textContent = `第 ${global_page} 页 / 共 ${global_total_page} 页`;
    }

    function updateContent() {
        global_params.page = global_page
        init_movie_list();
    }

    const searchbutton = document.getElementById('searchBox');
    searchbutton.addEventListener('click', _search);

    firstPageButton.addEventListener('click', () => {
        global_page = 1;
        // updatePageInfo();
        updateContent();
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            global_page--;
            // updatePageInfo();
            updateContent();
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            global_page++;
            // updatePageInfo();
            updateContent();
        }
    });

    lastPageButton.addEventListener('click', () => {
        global_page = global_total_page;
        // updatePageInfo();
        updateContent();
    });

    // 初始化
    // updatePageInfo();
    updateContent();

    function addItem(items, containerid) {
        // 获取容器元素
        const container = document.getElementById(containerid);
        const h3_container = document.createElement('h3');
        h3_container.textContent = items['title'];
        container.appendChild(h3_container);
        const listContainer = document.createElement('div');
        listContainer.classList.add('list-container');
        container.appendChild(listContainer);
        // listContainer.innerHTML = '';// 清空容器内容
        for (const item of items.list) {
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
            // const title = document.createElement('p');
            // title.textContent = item['name'];
            // const info = document.createElement('p');
            titleElement.classList.add('list-item-title');
            titleElement.textContent = item['name'] + " / " + item['year'] + " / " + item['dynamic'];
            const type_name = item['type_name'] !== "" ? " / " + item['type_name'] : ""
            titleElement.textContent += type_name;
            listItem.appendChild(titleElement);

            // 将所有元素添加到内容容器中

            // 将列表项添加到容器中
            listContainer.appendChild(listItem);
            // 为新元素添加点击事件监听器
            listItem.addEventListener('click', function () {
                // 在这里处理点击事件
                // console.log('Clicked on newly added item:', listItem);
                window.location.href = 'play_page.html?id=' + listItem.dataset.id;
                // 执行其他操作...
            });
        }

    }

    function add_search_Item(items, name) {
        // 获取容器元素
        const container = document.getElementById("search-result");
        container.innerHTML = '';// 清空容器内容
        const h3_container = document.createElement('h3');
        h3_container.textContent = name;
        container.appendChild(h3_container);
        const listContainer = document.createElement('div');
        listContainer.classList.add('list-container');
        container.appendChild(listContainer);
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
            titleElement.textContent = item['name'] + " / " + item['dynamic'];
            listItem.appendChild(titleElement);

            // 将所有元素添加到内容容器中

            // 将列表项添加到容器中
            listContainer.appendChild(listItem);
            // 为新元素添加点击事件监听器
            listItem.addEventListener('click', function () {
                // 在这里处理点击事件
                // console.log('Clicked on newly added item:', listItem);
                window.location.href = 'play_page.html?id=' + listItem.dataset.id;
                // 执行其他操作...
            });
        }
    }


    function get_search_result(keyword) {
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
                add_search_Item(response['data']['list'], '搜索结果');
            },
            fail: function (status) {
                console.log(status);
            }
        });
    }

    function _search() {
        let keyword = $("#searchBox").val()
        if (keyword !== '') {
            get_search_result(keyword)
        } else {
            alert('请输入搜索内容')
        }
    }


    function init_movie_list() {
        let pack = get_pack(JSON.stringify(global_params));
        let signature = get_sign(pack);
        let data = {pack: pack, signature: signature};
        ajax({
            url: "https://app-v1.ecoliving168.com/api/v1/movie/screen/list",
            type: "GET",
            data: data,
            dataType: "json",
            success: function (response, xml) {
                // 此处放成功后执行的代码
                response = JSON.parse(response).data;
                global_total_page = Math.ceil(response.total / response.pageSize);
                global_page = response.page;
                updatePageInfo();
                add_search_Item(response['list'], '筛选结果');

            },
            fail: function (status) {
                // 此处放失败后执行的代码
                console.log(status);
            }
        });
    }


    function get_config() {
        const par = {"timestamp": get_timestamp()};
        const pack = get_pack(JSON.stringify(par));
        const signature = get_sign(pack);
        const data = {pack: pack, signature: signature};
        ajax(
            {
                url: "https://app-v1.ecoliving168.com/api/v1/app/config",
                type: "GET",
                data: data,
                dataType: "json",
                success: function (response, xml) {
                    // console.log(response);
                    const config_str = AES_CBC_decrypt(response.toString().replaceAll("_", "\/").replaceAll("-", "+"));
                    init_filter(JSON.parse(config_str));
                },
                fail: function (status) {
                    console.log(status);
                }
            }
        )
    }

// get_config();


    const config_json = {
        "data": {
            "index_top_nav": [{"id": 0, "name": "推荐"}, {"id": 1, "name": "电影"}, {"id": 2, "name": "剧集"}, {
                "id": 3,
                "name": "综艺"
            }, {"id": 4, "name": "动漫"}, {"id": 36, "name": "爽剧"}, {"id": 26, "name": "福利"}],
            "movie_screen": {
                "filter": [{
                    "id": 1,
                    "name": "电影",
                    "class": ["类型", "Netflix", "剧情", "科幻", "动作", "喜剧", "爱情", "冒险", "儿童", "歌舞", "音乐", "奇幻", "动画", "恐怖", "惊悚", "战争", "传记", "纪录", "犯罪", "悬疑", "西部", "灾难", "古装", "武侠", "家庭", "短片", "校园", "文艺", "运动", "青春", "同性", "励志", "历史"],
                    "area": ["地区", "大陆", "香港", "台湾", "美国", "日本", "韩国", "英国", "法国", "德国", "印度", "泰国", "丹麦", "瑞典", "巴西", "加拿大", "俄罗斯", "意大利", "比利时", "爱尔兰", "西班牙", "澳大利亚", "其它"],
                    "year": ["年份", "2024", "2023", "2022", "2021", "2020", "10年代", "00年代", "90年代", "80年代", "更早"]
                }, {
                    "id": 2,
                    "name": "剧集",
                    "class": ["类型", "Netflix", "欧美", "短剧", "古装", "武侠", "励志", "家庭", "剧情", "喜剧", "战争", "科幻", "惊悚", "恐怖", "悬疑", "犯罪", "动作", "冒险", "历史", "同性"],
                    "area": ["地区", "大陆", "香港", "韩国", "美国", "日本", "法国", "英国", "德国", "台湾", "泰国", "印度", "其他"],
                    "year": ["年份", "2024", "2023", "2022", "2021", "2020", "10年代", "00年代", "90年代", "80年代", "更早"]
                }, {
                    "id": 3,
                    "name": "综艺",
                    "class": ["类型", "Netflix", "脱口秀", "真人秀", "选秀", "八卦", "访谈", "情感", "生活", "晚会", "搞笑", "音乐", "时尚", "游戏", "少儿", "体育", "纪实", "科教", "曲艺", "歌舞", "财经", "汽车", "播报"],
                    "area": ["地区", "大陆", "韩国", "香港", "台湾", "美国", "其它"],
                    "year": ["年份", "2024", "2023", "2022", "2021", "2020", "10年代", "00年代", "90年代", "80年代", "更早"]
                }, {
                    "id": 4,
                    "name": "动漫",
                    "class": ["类型", "Netflix", "欧美", "国产", "热血", "科幻", "美少女", "魔幻", "经典", "励志", "少儿", "冒险", "搞笑", "推理", "恋爱", "治愈", "幻想", "校园", "动物", "机战", "亲子", "儿歌", "运动", "悬疑", "怪物", "战争", "益智", "青春", "童话", "竞技", "动作", "社会", "友情"],
                    "area": ["地区", "大陆", "日本", "欧美", "其它"],
                    "year": ["年份", "2024", "2023", "2022", "2021", "2020", "10年代", "00年代", "90年代", "80年代", "更早"]
                }, {
                    "id": 36,
                    "name": "爽剧",
                    "class": ["类型", "古代", "现代", "穿越", "玄幻", "霸总", "英雄救美", "未婚妻", "师姐", "绝美", "逆袭", "美女", "爱情", "甜宠", "虐恋", "爽剧", "搞笑", "情感", "动漫", "萌宝", "都市", "言情", "重生", "乡村", "神医", "幻想", "反转", "复仇", "修仙", "古装", "男频"],
                    "area": ["地区", "大陆", "香港", "韩国", "美国", "日本", "法国", "英国", "德国", "台湾", "泰国", "印度", "其他"],
                    "year": ["年份", "2024", "2023", "2022", "2021", "2020", "10年代", "00年代", "90年代", "80年代", "更早"]
                }, {
                    "id": 26,
                    "name": "福利",
                    "class": ["类型", "剧情", "科幻", "情色", "动作", "喜剧", "爱情", "冒险", "奇幻", "动画", "恐怖", "惊悚", "战争", "伦理", "纪录", "犯罪", "悬疑", "同性", "灾难", "家庭", "短片", "校园", "青春"],
                    "area": ["地区", "大陆", "香港", "台湾", "美国", "日本", "韩国", "英国", "法国", "德国", "印度", "泰国", "丹麦", "瑞典", "巴西", "加拿大", "俄罗斯", "意大利", "比利时", "爱尔兰", "西班牙", "澳大利亚", "菲律宾", "其它"],
                    "year": ["年份", "2024", "2023", "2022", "2021", "2020", "10年代", "00年代", "90年代", "80年代", "更早"]
                }],
                "sort": [{"name": "综合", "value": "by_default"}, {"name": "最新", "value": "by_time"}, {
                    "name": "最热",
                    "value": "by_hits"
                }, {"name": "评分", "value": "by_score"}]
            },
            "movie_search_screen": {
                "res_type": [{"name": "按影片名称", "value": "by_movie_name"}, {
                    "name": "按演员姓名",
                    "value": "by_actor_name"
                }],
                "type": [{"id": 0, "name": "类型"}, {"id": 1, "name": "电影"}, {"id": 2, "name": "剧集"}, {
                    "id": 3,
                    "name": "综艺"
                }, {"id": 4, "name": "动漫"}, {"id": 36, "name": "爽剧"}, {"id": 26, "name": "福利"}],
                "sort": [{"name": "综合", "value": "by_default"}, {"name": "最新", "value": "by_time"}, {
                    "name": "最热",
                    "value": "by_hits"
                }, {"name": "评分", "value": "by_score"}]
            },
            "new_notice": "12",
            "feedback": [{"name": "播放问题", "value": 1000}, {"name": "集数不全", "value": 1001}, {
                "name": "资源缺失",
                "value": 1002
            }, {"name": "信息有误", "value": 1003}, {"name": "积分兑换", "value": 1004}, {
                "name": "BUG反馈",
                "value": 1005
            }],
            "about": [{"text": "TG交流群", "link": "https://t.me/+FHSplxcimaoyMzA1"}, {
                "text": "反馈邮箱",
                "link": "dianyinglieshou@gmail.com"
            }, {"text": "官网下载", "link": "https://dyls.site/"}],
            "start_countdown": 3
        }
    }

    // 0:电影，1：剧集，2：综艺，3：动漫，4：爽剧，5：福利
    function init_filter(type_id) {
        const leixing_container = document.getElementById('leixing_id');
        const diqu_container = document.getElementById('diqu_id');
        const year_container = document.getElementById('year_id');
        leixing_container.innerHTML = '';
        diqu_container.innerHTML = '';
        year_container.innerHTML = '';
        let leixing_data = config_json.data.movie_screen['filter'][type_id];
        for (let i = 0; i < leixing_data.class.length; i++) {
            const button = document.createElement('button');
            button.className = 'filter-button';
            button.dataset.filter = 'class';
            button.dataset.value = leixing_data.class[i];
            button.innerHTML = leixing_data.class[i];
            if (i === 0) {
                button.classList.add('active');
            }
            leixing_container.appendChild(button);
        }
        for (let i = 0; i < leixing_data.area.length; i++) {
            const button = document.createElement('button');
            button.className = 'filter-button';
            button.dataset.filter = 'area';
            button.dataset.value = leixing_data.area[i];
            button.innerHTML = leixing_data.area[i];
            if (i === 0) {
                button.classList.add('active');
            }
            diqu_container.appendChild(button);
        }

        for (let i = 0; i < leixing_data.year.length; i++) {
            const button = document.createElement('button');
            button.className = 'filter-button';
            button.dataset.filter = 'year';
            button.dataset.value = leixing_data.year[i];
            button.innerHTML = leixing_data.year[i];
            if (i === 0) {
                button.classList.add('active');
            }
            year_container.appendChild(button);
        }

        add_filter_button_event();
    }

    function add_filter_button_event() {
        const filterButtons = document.querySelectorAll('.filter-button');
        global_params['type_id'] = global_type_id;
        init_movie_list();
        filterButtons.forEach(button => {
            if (button.classList.value === "filter-button active") {
                global_params[button.dataset.filter] = button.dataset.value;
            }
            button.addEventListener('click', function () {
                // 移除当前筛选组内所有按钮的active类（允许多选，所以只针对当前组）
                const filterGroup = this.closest('.filter-buttons');
                filterGroup.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));

                // 为当前按钮添加active类
                this.classList.add('active');
                // 将当前按钮的值存储到全局变量中
                global_params[this.dataset.filter] = this.dataset.value;
                global_params['timestamp'] = get_timestamp();
                init_movie_list();
                // 如果点击的是“全部”按钮，则还需要处理其他组的“全部”按钮状态（可选，根据需求来）
                // 这里我们简单处理为不干扰其他组

                // 在这里添加筛选逻辑（例如，更新电影列表）
                // console.log(`筛选条件：${this.dataset.filter} = ${this.dataset.value}`);
            });
        });

        // 初始化时确保每个大选项中的“全部”按钮是active的（虽然HTML中已经设置，但这里再次确保）
        document.querySelectorAll('.filter-group .default').forEach(button => {
            if (!button.classList.contains('active')) {
                button.classList.add('active');
            }
        });
    }

    function click_header(type_id) {
        switch (type_id) {
            case -1:
                global_type_id = 0;
                break;
            case 1:
            case 2:
            case 3:
            case 0:
                global_type_id = type_id + 1;
                break;
            case 4:
                global_type_id = 36;
                break;
        }
        const filter = document.getElementById('filter-container-id');
        const pageControler = document.getElementById('pageControler');
        filter.hidden = type_id === -1;
        pageControler.hidden = type_id === -1;
        init_filter(type_id);
    }

    function addListener() {
        const nav_link = document.querySelectorAll('.nav-link');
        nav_link.forEach(function (item) {
            item.addEventListener('click', function (handle) {
                const type_id = parseInt(handle.target.dataset.value);
                click_header(type_id);
            });
        });


    }
    addListener();
});

