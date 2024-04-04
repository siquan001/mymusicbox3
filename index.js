var sp = {
    statu: {
        nowPage: "ready"
    },
    consts: {
        pageTransition: 200,//页面切换动画时间
    },
    util: {
        query: function (a, b) {
            return document['querySelector' + (b ? 'All' : '')](a);
        },
        _switchPageTimeOut: null,
        switchPage: function (a) {
            var nowPage = sp.statu.nowPage;
            var pageTransition = sp.consts.pageTransition;
            if (a == nowPage) return;
            $('.page.' + nowPage).style.opacity = '0';
            clearTimeout(this._switchPageTimeOut);
            this._switchPageTimeOut = setTimeout(function () {
                sp.statu.nowPage = a;
                $('.page.' + nowPage).style.display = 'none';
                $('.page.' + a).style.display = '';
                setTimeout(function () {
                    $('.page.' + a).style.opacity = '1';
                }, 10)
            }, pageTransition);
        }
    },
    musiclist: null,
    mgroups: [{
        name: "所有音乐",
        desc: "音乐盒子的所有音乐列表",
        img: "https://p2.music.126.net/hVpp2RXEtvsgvevE5b3tcA==/109951165409657142.jpg?param=300x300",
        has: ['*']
    }, {
        name: "特别喜欢",
        desc: "我特别喜欢的音乐",
        img: "https://p1.music.126.net/NPveskRNRWFL9cUkO2I7hA==/109951164795566364.jpg?param=300x300",
        has: ['tag=特别喜欢']
    }, {
        name: "日文 精选集",
        desc: "正在逐渐接受日文歌曲中。。。",
        img: "https://p1.music.126.net/rO-NRerWNFHke7whEJRJbg==/109951166940350080.jpg?param=300x300",
        has: ['tag=日文']
    }, {
        name: "英文 精选集",
        desc: "我喜欢的一些英文歌",
        img: "https://y.gtimg.cn/music/photo_new/T002R300x300M000004cELYr2cDgEy.jpg",
        has: ['tag=英文']
    }, {
        name: "Warma 精选集",
        desc: "我已经完全爱上沃玛啦！！！",
        img: "https://p1.music.126.net/iJ0L0bu8NT--85sIwKdYOg==/109951168152358562.jpg?param=300x300",
        has: ['tag=Warma']
    }, {
        name: "纯音乐",
        desc: "纯音乐，享受音乐本身",
        img: "https://p2.music.126.net/wuBe3K5odyEqZBLZNkXNlg==/109951163855629724.jpg?param=300x300",
        has: ['tag=纯音乐']
    }, {
        name: "Phigros 精选集",
        desc: "Phigros的一些音乐还是很好听的",
        img: "https://p2.music.126.net/KhOcpa-kpM1sG7jI5iZW1w==/109951169259187894.jpg",
        has: ['tag=Phigros']
    }, {
        name: "灰澈 精选集",
        desc: "灰澈的纯音乐总是给人一种宁静、放松的感觉",
        img: "https://p2.music.126.net/TiRbDelt4zvPTiqsEJ8V2w==/109951168153720614.jpg?param=300x300",
        has: ['tag=灰澈']
    }, {
        name: "李昕融 精选集",
        desc: "小时候喜欢李昕融，现在没那么喜欢了",
        img: "https://y.gtimg.cn/music/photo_new/T002R300x300M000004fM07G1uBKoR.jpg",
        has: ['matchArtist=李昕融']
    }],
    ready: {
        isReady: false,
        setState: function (text, type) {
            var state = $('.page.ready .state');
            state.innerText = text;
            state.className = 'state ' + (type ? type : '');
        },
        init: function () {
            var readypage = $('.page.ready');
            readypage.addEventListener('click', function () {
                if (sp.ready.isReady) {
                    sp.util.switchPage('groups');
                    if(localStorage.spNowplay&&localStorage.spMusiclist){
                        sp.player.nowlistid=parseInt(localStorage.spMusiclist);
                        sp.player.musiclist=sp.mgroups[sp.player.nowlistid].songs;
                        sp.player.play(parseInt(localStorage.spNowplay));
                        $('.playing-mini').style.right='0px';
                    }
                }
            });
        }
    },
    groups: {
        init: function () {
            if (!sp.ready.isReady) {
                return;
            }
            var groups = sp.mgroups;
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                var songs = [];
                if (group.has) {
                    songs.push.apply(songs, this.gHas(group.has));
                }
                if (group.mids) {
                    group.mids.forEach(function (mid) {
                        var song = sp.musiclist.find(function (item) {
                            return item.mid == mid;
                        })
                        if (song) {
                            songs.push(song);
                        }
                    })
                }
                group.songs = songs;
            }
            var groupList = $('.group-list');
            var h = ''
            groups.forEach(function (group, i) {
                h += `<div class="group-item" data-index="${i}">
                <div class="imgbox">
                    <img src="${group.img}" alt="">
                </div>
                <div class="info">
                    <div class="title">${group.name}</div>
                    <div class="desc">${group.desc}</div>
                </div>
            </div>`
            })
            groupList.innerHTML = h;
            groupList.querySelectorAll('.group-item').forEach(function (item, i) {
                item.addEventListener('click', function () {
                    sp.songs.to(this.dataset.index);
                });
            })

        },

        gHas: function (has) {
            if (has.indexOf('*') != -1) {
                return sp.musiclist.filter(function (item) {
                    return item.tag.indexOf('Legray')==-1;
                });
            }
            var songs = [];
            has.forEach(function (item) {
                var tag = item.split('=')[0];
                var value = item.split('=')[1];
                if (tag == 'tag') {
                    var tags = value.split('&');
                    sp.musiclist.forEach(function (song) {
                        var _ = true;
                        tags.forEach(function (tag) {
                            if (song.tag.indexOf(tag) == -1) {
                                _ = false;
                            }
                        })
                        songs.forEach(function (s) {
                            if (s.mid == song.mid) {
                                _ = false;
                            }
                        })
                        if (_) {
                            songs.push(song);
                        }
                    })
                } else if (tag == 'matchName') {
                    sp.musiclist.forEach(function (song) {
                        if (song.name.indexOf(value) > -1) {
                            var _ = true;
                            songs.forEach(function (s) {
                                if (s.mid == song.mid) {
                                    _ = false;
                                }
                            })
                            if (_) {
                                songs.push(song);
                            }
                        }
                    })
                } else if (tag == 'matchArtist') {
                    sp.musiclist.forEach(function (song) {
                        if (song.artist.indexOf(value) > -1) {
                            var _ = true;
                            songs.forEach(function (s) {
                                if (s.mid == song.mid) {
                                    _ = false;
                                }
                            })
                            if (_) {
                                songs.push(song);
                            }
                        }
                    })
                }
            })
            return songs;
        }
    },
    songs: {
        nowlist: null,
        to: function (index) {
            this.nowlist = index;
            sp.util.switchPage('songs');
            var group = sp.mgroups[index];
            $('.page.songs .cover img').src = group.img;
            $('.page.songs .group-info .name').innerText = group.name;
            $('.page.songs .group-info .desc').innerText = group.desc;
            var h = '';
            group.songs.forEach(function (song, i) {
                h += `<div class="item" data-index="${i}">
                <div class="name">${song.name}</div>
                <div class="artist">${song.artist}</div>
            </div>`
            })
            $('.page.songs .list').innerHTML = h;
            if(index==sp.player.nowlistid){
                this.actItem(sp.player.nowplay);
            }
            $('.page.songs .list .item',true).forEach(function(item){
                item.addEventListener('click',function(){
                    sp.player.nowlistid=sp.songs.nowlist;
                    sp.player.musiclist=sp.mgroups[sp.songs.nowlist].songs;
                    sp.player.play(parseInt(this.getAttribute('data-index')));
                    sp.util.switchPage('player');
                    $('.playing-mini').style.right='';
                    if(this.querySelector('.name').innerText.trim()=='DESTRUCTION 3,2,1'){
                        sp.player.sp();
                    }
                })
            });
            try{
                $('.page.songs .active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }catch(e){
                console.log(e);
            }
        },
        init: function () {
            $('.page.songs .back').addEventListener('click', function () {
                sp.util.switchPage('groups');
                sp.songs.nowlist = null;
                $('.page.songs .list').innerHTML = '';
            })
        },
        actItem:function(i){
            try {
                $('.page.songs .list .item',true).forEach(function(item){
                    item.className = 'item';
                })
                $('.page.songs .list .item[data-index="'+i+'"]').className = 'item active';
            } catch (error) {
                console.log(error);
                console.log(i);
            }
           
        }
    },
    initer: {
        initMusicList: function () {
            fetch('https://siquan001.github.io/mymusicbox2/musiclist.json').then(function (res) {
                return res.json();
            }).then(function (data) {
                sp.musiclist = data;
                sp.ready.isReady = true;
                sp.ready.setState('点击进入');
                sp.groups.init();
            }).catch(function (err) {
                sp.ready.setState('加载歌单失败', 'error');
                console.log(err);
            })
        }
    },
    player: {
        nowlistid:null,
        config:{
            INFO           : true,               // 显示你的评价 (取决于 INFO_ROOT/[mid].txt)
            TAG            : true,               // 显示歌曲标签 (取决于musiclist[i].tag)
            DEFAULT_MODE   : 'light',            // 默认模式 ，可选 light 亮色,dark 暗色
            INFO_ROOT      : 'https://siquan001.github.io/mymusicbox2/info/',           // 评价文件夹根目录 (结尾要加“/”)
            AUTOPLAY       : true,               // 自动播放
            START_PLAY     : 'random',            // 刚开始的播放策略，可选 random 随机播放，first 第一首播放
            PLAY_MODE      : 'loop',             // 播放模式，可选 loop 单曲循环，random 随机播放，order 顺序播放
            ENABLED_MID    : true,               // 是否启用歌曲mid，这主要应用于歌曲定位和评价显示
            SHOW_MID_IN_URL: true,               // 是否显示歌曲mid在歌曲链接中(这不会导致历史记录堆积)
            PERFORMANCE_MODE:false,               // 性能模式，在页面失焦时取消动画和歌词更新和时间更新(针对一些配置较差的电脑进行后台播放)
            BLURBG         : false,              // 是否显示模糊图片背景(这对配置较差的电脑是个挑战)
            MAINCOLORBG    : true              // 是否以歌曲封面图片主题色作为背景(BLURBG=true时无效)
        },
        noticeinter: null,
        notice:function(text, fn = function () { }){
            clearTimeout(this.noticeinter);
            document.querySelector(".notice").innerText = text;
            document.querySelector(".notice").onclick = fn;
            document.querySelector(".notice").style.display = 'block';
            this.noticeinter = setTimeout(function () {
                document.querySelector(".notice").style.display = 'none';
                document.querySelector(".notice").onclick = function () { };
            }, 2000);
        },
         /**
             * @param {string} url 图片链接
             * @param {function} cb 回调函数，参数为颜色字符串和是否为亮色
             * @description 获取图片主题色
             * @author BrownHu
             * @link https://juejin.cn/post/6844903678231445512
             * @from 稀土掘金
             * @note 对于一些地方做了修改和适配，对无法获取的图片使用https://api.qjqq.cn/api/Imgcolor siquan001
             */
        colorfulImg:function(img,cb){
            let imgEl = document.createElement('img');
            imgEl.src = img;
            imgEl.crossOrigin = 'Anonymous';
            imgEl.onload = function () {
                try {
                    let canvas = document.createElement('canvas'),
                        context = canvas.getContext && canvas.getContext('2d'),
                        height, width, length, data,
                        i = -4,
                        blockSize = 50,
                        count = 0,
                        rgb = { r: 0, g: 0, b: 0 }
                    height = canvas.height = imgEl.height
                    width = canvas.width = imgEl.width
                    context.drawImage(imgEl, 0, 0);
                    data = context.getImageData(0, 0, width, height).data
                    length = data.length
                    while ((i += blockSize * 4) < length) {
                        ++count;
                        rgb.r += data[i];
                        rgb.g += data[i + 1];
                        rgb.b += data[i + 2];
                    }
                    rgb.r = ~~(rgb.r / count);
                    rgb.g = ~~(rgb.g / count);
                    rgb.b = ~~(rgb.b / count);
                    cb('rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',.5)', (rgb.r + rgb.g + rgb.b) / 3 > 128);
                } catch (e) {
                    d();
                }
            }
            imgEl.onerror = function () {
                d();
            }
            function d() {
                sp.player.rs.push(musicapi._request('https://api.qjqq.cn/api/Imgcolor?img=' + img, function (n) {
                    if (!n) {
                        cb('rgba(0,0,0,0)', -1);
                    } else {
                        var h = n.RGB.slice(1);
                        var r = parseInt(h.substring(0, 2), 16);
                        var g = parseInt(h.substring(2, 4), 16);
                        var b = parseInt(h.substring(4, 6), 16);
                        cb('rgba(' + r + ',' + g + ',' + b + ',.5)', (r + g + b) / 3 > 128);
                    }
                }));
            }
        },
        formatTime:function(time){
            var min = Math.floor(time / 60);
            var sec = Math.floor(time % 60);
            if (isNaN(min)) {
                return '00:00';
            }
            if (min < 10) {
                min = '0' + min;
            }
            if (sec < 10) {
                sec = '0' + sec;
            }
            return min + ':' + sec;
        },
        performanse_test: function performanse_test() {
            var xinnenginter;
            var zhenshu = 0;
            var lowzhenshu = 0;

            function cxinneng() {
                function xnjc() {
                    requestAnimationFrame(function () {
                        zhenshu++;
                        (!isStopBlurBg) && xnjc();
                    })
                }
                setTimeout(function () {
                    xnjc();
                    checkxinnengInterval();
                }, 2000)
            }
            cxinneng();
            function checkxinnengInterval() {
                xinnenginter = setInterval(function () {
                    if (zhenshu <= 16) {
                        lowzhenshu++;
                        if (lowzhenshu > 5) {
                            if (confirm('你的电脑性能较差，是否取消模糊背景功能？')) {
                                clearTimeout(bx);
                                localStorage.chaxinneng = 'yes';
                                document.querySelector(".mbg").style.display = 'none';
                            } else {
                                localStorage.chaxinneng = 'no';
                            }
                            isStopBlurBg = true;
                            clearInterval(xinnenginter);
                        }
                    }
                    zhenshu = 0;
                }, 1000)
            }
            var bx = setTimeout(function () {
                clearInterval(xinnenginter);
                localStorage.chaxinneng = 'no';
            }, 6e5);
        },
        sp:function () {
            var a = true;
            document.body.style.transition = 'none';
            document.body.style.cursor = 'none';
            setInterval(function () {
                a = !a;
                if (a) {
                    document.querySelector('.siquan-player').style.transform = 'translateY(-10px)';
                } else {
                    document.querySelector('.siquan-player').style.transform = 'translateY(10px)';
                }
                sp.player.el.mode.click();
            }, 50);
            var b = true;

            setInterval(function () {
                document.body.style.opacity = Math.random();
                b = !b;
                if (b) {
                    document.querySelector('.siquan-player').style.transform = 'translateX(-10px)';
                } else {
                    document.querySelector('.siquan-player').style.transform = 'translateX(10px)';
                }
                sp.player.el.mode.click();
            }, 70);
        },
        resize:function resize() {
            var resizer = document.querySelector("#resizer");
            var w = window.innerWidth;
            var h = window.innerHeight;
            if (w < 700) {
                resizer.innerHTML = '';
                return;
            }
            var styles = `.siquan-player .container .left .music-album-pic{
width:${Math.min(w * 0.287, h * 0.5)}px;
height:${Math.min(w * 0.287, h * 0.5)}px;
}
.siquan-player .container .left .music-info .music-title{
font-size:${w * 0.02}px;
}
.iconbtn{
width:${h * 0.06}px;
height:${h * 0.06}px;
}
.siquan-player .container .left .music-info .music-message{
font-size:${w * 0.012}px;
}
.siquan-player .container .left .music-controls .range{
height:${h * 0.0045}px;
}
.siquan-player .container .left .music-controls .range .r1{
width:${h * 0.0105}px;
height:${h * 0.0105}px;
top:-${h * 0.003}px;
}
.siquan-player .container .left .music-controls .time{
font-size:${w * 0.012}px;
}
.siquan-player .container .left .music-controls .pl{
width:${h * 0.06 * 3.75 + 60}px;
height:${h * 0.06 * 1.25}px;
}
.siquan-player .container .left .music-controls .pl .iconbtn{
width:${h * 0.06 * 1.25}px;
height:${h * 0.06 * 1.25}px;
}
.siquan-player .container .right ul li{
font-size:${w * 0.019}px;
line-height:${w * 0.038}px;
}
.siquan-player .container .right ul li.act{
font-size:${w * 0.034}px;
}
.dialog .actionbar{
height:${h * 0.06}px;
}
.dialog .actionbar .title{
font-size:${h * 0.025}px;
line-height:${h * 0.06}px;
}
.musiclist.dialog .scroll-con ul li{
font-size:${h * 0.02}px;
height:${h * 0.045}px;
line-height:${h * 0.045}px;
}
.dialog .scroll-con{
height:calc(100% - ${h * 0.06 + 1}px);
}
.musiclist.dialog .scroll-con  ul li>*{
height:${h * 0.045}px;
}
.musiclist.dialog .scroll-con  ul li .index,
.musiclist.dialog .scroll-con  ul li .anim
{
width: ${h * 0.06}px;
}
.musiclist.dialog .scroll-con  ul li .name{
width: calc(100% - ${h * 0.06}px);
}
.musiclist.dialog .scroll-con  ul li .anim div{
height:${h * 0.015}px;
width:${h * 0.045 * 0.05}px;
}
.musiclist.dialog .scroll-con  ul li .anim div:nth-child(1){
left:${h * 0.06 * 0.375}px;
}
.musiclist.dialog .scroll-con  ul li .anim div:nth-child(2){
left:${h * 0.06 * 0.525}px;
}
.musiclist.dialog .scroll-con  ul li .anim div:nth-child(3){
left:${h * 0.06 * 0.675}px;
}
.musicinfo.dialog .d-c{
font-size:${h * 0.024}px;
}
.s-tag{
font-size:${h * 0.024 * 0.75}px;
}`;
            resizer.innerHTML = styles;
        },
        rs:[],
        nowplay:-1,
        musiclist:null,
        init: function () {
            var old_d=window.document;
            var document=$('.page.player');
            document.getElementById=function(id){
                return old_d.getElementById(id);
            }
            document.body=old_d.body;
            document.head=old_d.head;
            document.createElement=function(tag){
                return old_d.createElement(tag);
            }
            Object.defineProperty(document,'title',{
                get:function(){
                    return old_d.title;
                },
                set:function(v){
                    old_d.title=v;
                }
            });
            // 根据索引播放音乐
            function play(i) {
                sp.player.rs.forEach(function (r) {
                    r.abort();
                })
                sp.player.nowplay = i;
                redef();
                sp.songs.actItem(i);
                xrLRC();
                setSongData(i);
                setTagAndInfo(i);
                localStorage.spNowplay=i;
                localStorage.spMusiclist=sp.player.nowlistid;
            }
            
            this.play=play;

            // 设置歌曲标签和评价
            function setTagAndInfo(i) {
                // TAG
                if (config.TAG) el.info.tags.innerHTML = sp.player.musiclist[i].tag.map(function (v) { return '<span class="s-tag">' + v + '</span>' }).join('');

                // 评价
                if (i == -1 || !config.INFO || !config.ENABLED_MID) return;
                sp.player.rs.push(musicapi._request(config.INFO_ROOT + sp.player.musiclist[i].mid + '.txt', function (data) {
                    if (!data) {
                        el.info.pj.innerText = '暂无';
                    } else {
                        el.info.pj.innerText = data;
                    }
                }))
            }

            // 获取并设置歌曲信息
            function setSongData(i) {
                // 在i=-1时播放url的音乐信息
                sp.player.rs.push(musicapi.get(i == -1 ? lssong : sp.player.musiclist[i], function (data) {
                    if (data.error) {
                        notice('歌曲获取失败', function () {
                            alert(data.error);
                        });
                        //歌曲获取失败切下一首
                        el.nextbtn.click();
                    } else {
                        el.img.src = data.img;
                        document.querySelector(".mbg img").src = data.img;
                        $(".playing-mini img").src = data.img;
                        el.title.innerText = el.info.title.innerText = data.songname;
                        document.title = _title = data.songname;
                        el.audio.src = data.url;
                        el.album.innerText = el.info.album.innerText = data.album;
                        el.singer.innerText = el.info.singer.innerText = data.artist;
                        LRC = data.lrc;
                        xrLRC();

                        // 设置主题色
                        if (config.MAINCOLORBG && !config.BLURBG) {
                            sp.player.colorfulImg(data.minipic || data.img, function (n, b) {
                                document.querySelector('.siquan-player').style.background = n;
                                if (b != -1) {
                                    if ((b && mode == 0) || (!b && mode == 1)) {
                                        el.mode.click()
                                    }
                                }
                            });
                        }
                    }
                }))
            }

            // 恢复空内容
            function redef() {
                el.img.src = defimg;
                $(".playing-mini img").src = defimg;
                el.title.innerText =
                    el.album.innerText =
                    el.info.title.innerText =
                    el.info.album.innerText =
                    el.info.pj.innerText =
                    el.info.singer.innerText =
                    el.singer.innerText = '...';
                el.audio.src = '';
                LRC = { 0: '歌词加载中' };
            }

            // 重置歌词
            function xrLRC() {
                el.lrc.innerHTML = '';
                for (var k in LRC) {
                    var li = document.createElement('li');
                    li.innerText = LRC[k];
                    el.lrc.append(li);
                }
            }

            // audio事件初始化
            function initAudioEvents() {
                if (config.AUTOPLAY) {
                    el.audio.addEventListener('canplay', function () {
                        try { this.play(); } catch (e) { }
                    });
                }

                el.audio.addEventListener('timeupdate', function () {
                    if (activing) return;
                    var cur = el.audio.currentTime;
                    var max = el.audio.duration;
                    var per = cur / max;
                    if (rangeDragging) {
                        el.range.r2.style.width = per * 100 + '%'
                        el.range.r1.style.left = 'calc(' + per * 100 + '% - 6px)';
                    }

                    el.time.cur.innerText = sp.player.formatTime(cur);
                    el.time.max.innerText = sp.player.formatTime(max);
                    var i = -1;
                    for (var k in LRC) {
                        if (cur < k) {
                            break;
                        }
                        i++;
                    }
                    try {
                        el.lrc.querySelector('li.act').classList.remove('act');
                    } catch (e) { }
                    var h = document.querySelector(".right").getBoundingClientRect().height / 2;
                    var al = el.lrc.querySelectorAll('li');
                    for (var j = 0; j < i; j++) {
                        h -= al[j].getBoundingClientRect().height;
                    }
                    if (i != -1) {
                        h -= al[i].getBoundingClientRect().height / 2;
                        el.lrc.querySelectorAll('li')[i].classList.add('act');
                    }
                    el.lrc.style.marginTop = h + 'px';
                });

                el.audio.addEventListener('play', function () {
                    el.container.classList.add('playing');
                    $('.playing-mini .img').classList.add('playing');
                    el.playbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause" viewBox="0 0 16 16">  <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5"/></svg>'
                })

                el.audio.addEventListener('pause', function () {
                    el.container.classList.remove('playing');
                    $('.playing-mini .img').classList.remove('playing');
                    el.playbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>'
                });
                el.audio.addEventListener('ended', function () {
                    if (switchMode == 1) {
                        this.currentTime = 0;
                        this.play();
                    } else {
                        el.nextbtn.click();
                    }
                })
            }

            // 音乐播放器元素事件（除拖动条）
            function initPlayerEvents() {
                el.img.onerror =$('.playing-mini img')= function () {
                    this.src = defimg;
                }

                el.playbtn.addEventListener('click', function () {
                    if (el.container.classList.contains('playing')) {
                        el.audio.pause();
                    } else {
                        el.audio.play();
                    }
                })

                switchMode = ['order', 'loop', 'random'].indexOf(config.PLAY_MODE);
                var qhicon = ['<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-repeat" viewBox="0 0 16 16"><path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192Zm3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z"/></svg>',
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-repeat-1" viewBox="0 0 16 16"><path d="M11 4v1.466a.25.25 0 0 0 .41.192l2.36-1.966a.25.25 0 0 0 0-.384l-2.36-1.966a.25.25 0 0 0-.41.192V3H5a5 5 0 0 0-4.48 7.223.5.5 0 0 0 .896-.446A4 4 0 0 1 5 4zm4.48 1.777a.5.5 0 0 0-.896.446A4 4 0 0 1 11 12H5.001v-1.466a.25.25 0 0 0-.41-.192l-2.36 1.966a.25.25 0 0 0 0 .384l2.36 1.966a.25.25 0 0 0 .41-.192V13h6a5 5 0 0 0 4.48-7.223Z"/><path d="M9 5.5a.5.5 0 0 0-.854-.354l-1.75 1.75a.5.5 0 1 0 .708.708L8 6.707V10.5a.5.5 0 0 0 1 0z"/></svg>',
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shuffle" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/><path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/></svg>'];
                el.switchBtn.innerHTML = qhicon[switchMode];
                el.nextbtn.addEventListener('click', function () {
                    if (sp.player.nowplay == -1) return;
                    if (switchMode == 2) {
                        play(Math.floor(Math.random() * sp.player.musiclist.length));
                    } else {
                        if (sp.player.nowplay == sp.player.musiclist.length - 1) {
                            play(0);
                        } else {
                            play(sp.player.nowplay + 1);
                        }
                    }
                })
                el.lastbtn.addEventListener('click', function () {
                    if (sp.player.nowplay == -1) return;
                    if (switchMode == 2) {
                        play(Math.floor(Math.random() * musiclist.length));
                    } else {
                        if (sp.player.nowplay == 0) {
                            play(sp.player.musiclist.length - 1);
                        } else {
                            play(sp.player.nowplay - 1);
                        }
                    }
                })

                el.switchBtn.addEventListener('click', function () {
                    if (switchMode == 2) {
                        switchMode = 0;
                    } else {
                        switchMode++;
                    }
                    this.innerHTML = qhicon[switchMode];
                });
            }

            // 音乐播放器拖动条事件
            function initProgressEvents() {
                el.range.r1.addEventListener('mousedown', function () {
                    rangeDragging = false;
                    var per;
                    document.onmousemove = function (e) {
                        var x = e.pageX;
                        var w = el.range.r.getBoundingClientRect().width;
                        var l = el.range.r.getBoundingClientRect().left;
                        var r = x - l;
                        if (r < 0) {
                            r = 0;
                        }
                        if (r > w) {
                            r = w;
                        }
                        per = r / w;
                        el.range.r2.style.width = per * 100 + '%'
                        el.range.r1.style.left = 'calc(' + per * 100 + '% - 6px)';
                    }
                    document.onmouseup = function () {
                        document.onmousemove = null;
                        document.onmouseup = null;
                        rangeDragging = true;
                        el.audio.currentTime = el.audio.duration * per;
                    }
                })

                el.range.r1.addEventListener('touchstart', function () {
                    rangeDragging = false;
                    var per;
                    function move(e) {
                        var x = e.targetTouches[0].pageX;
                        var w = el.range.r.getBoundingClientRect().width;
                        var l = el.range.r.getBoundingClientRect().left;
                        var r = x - l;
                        if (r < 0) {
                            r = 0;
                        }
                        if (r > w) {
                            r = w;
                        }
                        per = r / w;
                        el.range.r2.style.width = per * 100 + '%'
                        el.range.r1.style.left = 'calc(' + per * 100 + '% - 6px)';
                    }
                    function end() {
                        document.removeEventListener('touchmove', move);
                        document.removeEventListener('touchend', end);
                        rangeDragging = true;
                        el.audio.currentTime = el.audio.duration * per;
                    }
                    document.addEventListener('touchmove', move, { passive: false });
                    document.addEventListener('touchend', end, { passive: false });
                }, {
                    passive: false // 阻止默认事件
                })

                el.range.r.addEventListener('click', function (e) {
                    if (rangeDragging) {
                        var per = (e.pageX - el.range.r.getBoundingClientRect().left) / el.range.r.getBoundingClientRect().width;
                        el.audio.currentTime = el.audio.duration * per;
                    }
                })
            }

            // 四个角的按钮事件
            function initBtnsEvents() {
                var modeicon = ['<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-fill" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278"/></svg>',
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sun-fill" viewBox="0 0 16 16"><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>']
                var modecl = ['dark', 'light']
                mode = modecl.indexOf(config.DEFAULT_MODE);
                document.body.classList.add(config.DEFAULT_MODE);
                el.mode.innerHTML = modeicon[mode];

                el.mode.addEventListener('click', function () {
                    document.body.classList.remove(modecl[mode]);
                    mode = mode == 1 ? 0 : 1;
                    this.innerHTML = modeicon[mode];
                    document.body.classList.add(modecl[mode])
                })

                el.musiclistbtn.addEventListener('click', function () {
                    $('.playing-mini').style.right='0';
                    if(sp.songs.nowlist!=null){
                        sp.util.switchPage('songs');
                        try{
                            $('.page.songs .active').scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            })
                        }catch(e){}
                    }else{
                        sp.util.switchPage('groups')
                    }
                    
                })

                el.musicinfobtn.addEventListener('click', function () {
                    document.querySelector(".dialog.musicinfo").classList.add('show');
                })
            }

            // 对话框事件
            function initDialog() {
                // dialog close
                document.querySelectorAll(".dialog .close").forEach(function (el) {
                    el.addEventListener('click', function () {
                        this.parentElement.parentElement.parentElement.parentElement.classList.remove('show');
                    })
                })
            }

            // 热键
            function initHotKey() {
                // hotkey
                document.addEventListener('keydown', function (e) {
                    if (e.key == " ") {
                        el.playbtn.click();
                    } else if (e.key == "ArrowLeft") {
                        el.lastbtn.click();
                    } else if (e.key == "ArrowRight") {
                        el.nextbtn.click();
                    }
                });
            }

            // 性能模式
            function initPerformanceMode() {
                document.addEventListener('visibilitychange', function () {
                    var isHidden = document.hidden;
                    if (isHidden) {
                        document.body.style.display = 'none';
                    } else {
                        document.body.style.display = '';
                    }
                });
                window.onfocus = function () {
                    if (BLURBG && !isStopBlurBg) {
                        clearInterval(xinnenginter);
                        checkxinnengInterval();
                    }
                    document.title = _title;
                    el.img.style.animationPlayState = ""
                    document.querySelector(".playing-anim").style.display = ""
                    activing = false;
                }
                window.onblur = function () {
                    if (BLURBG && !isStopBlurBg) {
                        clearInterval(xinnenginter);
                    }
                    document.title = "[性能模式冻结中]" + _title;
                    el.img.style.animationPlayState = "paused"
                    document.querySelector(".playing-anim").style.display = "none";
                    activing = true;
                }
            }

            // 初始化所有
            function init(){
                el={
                img:document.getElementById("img"),
                title:document.getElementById("music-title"),
                album:document.getElementById("music-album"),
                singer:document.getElementById("music-singer"),
                audio:document.getElementById("audio"),
                range:{
                    r1:document.querySelector(".range .r1"),
                    r2:document.querySelector(".range .r2"),
                    r:document.querySelector(".range")
                },
                time:{
                    cur:document.querySelector(".time .l"),
                    max:document.querySelector(".time .r"),
                },
                playbtn:document.querySelector(".playbtn"),
                container:document.querySelector(".siquan-player .container"),
                lrc:document.querySelector(".right ul"),
                lastbtn:document.querySelector(".lastbtn"),
                nextbtn:document.querySelector(".nextbtn"),
                switchBtn:document.querySelector(".sx"),
                mode:document.querySelector(".mode"),
                musiclistbtn:document.getElementById("siquan-player-musiclist"),
                musicinfobtn:document.getElementById("siquan-player-musicinfo"),
                info:{
                    title:document.querySelector(".info-name"),
                    album:document.querySelector(".info-album"),
                    singer:document.querySelector(".info-singer"),
                    tags:document.querySelector(".info-tags .in"),
                    pj:document.querySelector(".info-pj .in"),
                    tags_f:document.querySelector(".info-tags"),
                    pj_f:document.querySelector(".info-pj"),
                }
                }
                sp.player.el=el;
                window.addEventListener('resize',sp.player.resize);
                sp.player.resize();
                initAudioEvents();
                initPlayerEvents();
                initProgressEvents();
                initBtnsEvents();
                initDialog();
                initHotKey();
                if(config.PERFORMANCE_MODE)initPerformanceMode();
                if(!config.TAG){
                    el.info.tags_f.style.display='none';    
                }
                if(!config.INFO){
                    el.info.pj_f.style.display='none';
                }
                // 在开启模糊背景功能时检测电脑性能
                if(config.BLURBG&&localStorage.chaxinneng!='yes'){
                document.querySelector(".mbg").style.display='block';
                if(!localStorage.chaxinneng)sp.player.performanse_test();
                }
            }

            //标题缓存（用于性能模式）
            var _title="我的音乐盒子";
            var isStopBlurBg=false;
            var LRC={0:'歌词加载中'};
            var defimg='https://image.gumengya.cn/i/2023/10/15/652b46cf15392.png';
            // 页面主题
            var mode;
            var el;
            // 切换模式
            var switchMode;
            // 页面是否处于焦点
            var activing=false;
            var rangeDragging=true;
            // abort list
            var config=sp.player.config
            init();
        }
    },
    init: function () {
        sp.ready.setState('正在加载歌单...', 'loading');
        this.ready.init();
        this.initer.initMusicList();
        this.songs.init();
        this.player.init();
        $('.playing-mini').addEventListener('click',function(){
            sp.util.switchPage('player');
            this.style.right='';
        })
    }
}

var $ = sp.util.query;

sp.init();