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
    infolist: null,
    mgroups: null,
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
                        var nowlistid=parseInt(localStorage.spMusiclist);
                        var musiclist=sp.mgroups[nowlistid].songs;
                        var mid=localStorage.spNowplay;
                        for(var i=0;i<musiclist.length;i++){
                            if(musiclist[i].mid==mid){
                                sp.player.nowlistid=nowlistid;
                                sp.player.musiclist=musiclist;
                                sp.player.play(i);
                                $('.playing-mini').style.right='0px';
                                return;
                            }
                        }
                        delete localStorage.spMusiclist;
                        delete localStorage.spNowplay;
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
        nowgroup:null,
        to: function (index) {
            this.nowlist = index;
            sp.util.switchPage('songs');
            var group = this.getGroup(index);
            $('.page.songs .cover img').src = group.img;
            $('.page.songs .group-info .name').innerText = group.name;
            $('.page.songs .group-info .desc').innerText = group.desc;
            this.drawList(group,index);
            try{
                $('.page.songs .active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }catch(e){
                console.log(e);
            }
        },
        getGroup:function(i){
            if(typeof i=='undefined'){
                i=this.nowlist;
            }
            return JSON.parse(JSON.stringify(sp.mgroups[i]));
        },
        drawList:function(group,index){
            var h = '';
            group.songs=this.sortList(group.songs);
            this.nowgroup=group;
            group.songs.forEach(function (song, i) {
                h += `<div class="item" data-index="${i}" data-mid="${song.mid}">
                <div class="name">${song.name}</div>
                <div class="artist">${song.artist}</div>
            </div>`
            })
            $('.page.songs .list').innerHTML = h;
            if(index==sp.player.nowlistid){
                this.actItem(sp.player.mid);
            }
            $('.page.songs .list .item',true).forEach(function(item){
                item.addEventListener('click',function(){
                    sp.player.nowlistid=sp.songs.nowlist;
                    sp.player.musiclist=sp.songs.nowgroup.songs;
                    sp.player.play(parseInt(this.getAttribute('data-index')));
                    sp.util.switchPage('player');
                    $('.playing-mini').style.right='';
                    if(this.querySelector('.name').innerText.trim()=='DESTRUCTION 3,2,1'){
                        sp.player.sp();
                    }
                })
            });
        },
        sortList:function(group){
            var {mode,sort}=this.getSortMode();
            if(mode==1){
                group.sort(function(a,b){
                    return a.name.localeCompare(b.name);
                })
            }else if(mode==2){
                group.sort(function(a,b){
                    return a.artist.localeCompare(b.artist);
                })
            }
            if(sort==1){
                group.reverse();
            }
            return group;
        },
        getSortMode:function(){
            var sort=parseInt(localStorage.spSort);
            sort=isNaN(sort)?0:sort;
            var mode=parseInt(localStorage.spSortMode);
            mode=isNaN(mode)?0:mode;
            return {mode,sort};
        },
        init: function () {
            $('.page.songs .back').addEventListener('click', function () {
                sp.util.switchPage('groups');
                sp.songs.nowlist = null;
                $('.page.songs .list').innerHTML = '';
            });
            var {mode,sort}=this.getSortMode();
            var sortEl=$('.page.songs .control .sort');
            var modeEl=$('.page.songs .control .mode');
            sortEl.innerText=['↓','↑'][sort];
            modeEl.innerText=['默认','字母','歌手'][mode];
            sortEl.addEventListener('click',function(){
                sort=sort==0?1:0;
                sortEl.innerText=['↓','↑'][sort];
                localStorage.spSort=sort;
                sp.songs.drawList(sp.songs.getGroup(),sp.songs.nowlist);
                sp.player.musiclist=sp.songs.nowgroup.songs;
                var act=$('.page.songs .list .item.active');
                if(act)sp.player.nowplay=parseInt(act.getAttribute('data-index'));
            })
            modeEl.addEventListener('click',function(){
                mode=mode==0?1:(mode==1?2:0);
                modeEl.innerText=['默认','字母','歌手'][mode];
                localStorage.spSortMode=mode;
                sp.songs.drawList(sp.songs.getGroup(),sp.songs.nowlist);
                sp.player.musiclist=sp.songs.nowgroup.songs;
                var act=$('.page.songs .list .item.active');
                if(act)sp.player.nowplay=parseInt(act.getAttribute('data-index'));
            })
        },
        actItem:function(mid){
            try {
                $('.page.songs .list .item',true).forEach(function(item){
                    item.className = 'item';
                })
                $('.page.songs .list .item[data-mid="'+mid+'"]').className = 'item active';
            } catch (error) {
                console.log(error);
                console.log(mid);
            }
           
        }
    },
    initer: {
        initState:0,
        initMusicList: function () {
            fetch('/mymusicbox2/musiclist-min.json').then(function (res) {
                return res.json();
            }).then(function (data) {
                sp.musiclist = data;
                sp.initer.initState++;
                sp.initer.finish();
            }).catch(function (err) {
                sp.ready.setState('加载歌单失败', 'error');
                console.log(err);
            })
        },
        initGroups:function(){
            fetch('./group-min.json').then(function (res) {
                return res.json();
            }).then(function (data) {
                sp.mgroups = data;
                sp.initer.initState++;
                sp.initer.finish();
            }).catch(function (err) {
                sp.ready.setState('加载歌单组失败', 'error');
                console.log(err);
            })
        },
        initInfos:function(){
            fetch('/mymusicbox2/info.json').then(function (res) {
                return res.json();
            }).then(function (data) {
                sp.infolist = data;
                sp.initer.initState++;
                sp.initer.finish();
            }).catch(function (err) {
                sp.ready.setState('加载歌曲评价失败', 'error');
                console.log(err);
            })
        },
        finish:function(){
            if(this.initState==3){
                sp.ready.isReady = true;
                sp.ready.setState('点击进入');
                sp.groups.init();
            }
        }
    },
    player: {
        nowlistid:null,
        noticeinter: null,
        notice:function(text, fn = function () { }){
            clearTimeout(this.noticeinter);
            $(".notice").innerText = text;
            $(".notice").onclick = fn;
            $(".notice").style.display = 'block';
            this.noticeinter = setTimeout(function () {
                $(".notice").style.display = 'none';
                $(".notice").onclick = function () { };
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
                    var m=(rgb.r + rgb.g + rgb.b) / 3 > 150;
                    function ccl(c){
                        return 256-(256-c)/2;
                    }
                    var m2=(rgb.r/2)+','+(rgb.g/2)+','+(rgb.b/2);
                    var m3=ccl(rgb.r)+','+ccl(rgb.g)+','+ccl(rgb.b);
                    // if((rgb.r + rgb.g + rgb.b) / 1.5 < 150){
                    //     m3='255,255,255';
                    // }
                    cb('rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',.5)', m,[['rgb('+m2+')','rgba('+m2+',.5)'],['rgb('+m3+')','rgba('+m3+',.5)']]);
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
                        var rgb={r,g,b};
                        var m=(rgb.r + rgb.g + rgb.b) / 3 > 150;
                        function ccl(c){
                            return 256-(256-c)/2;
                        }
                        var m2=(rgb.r/2)+','+(rgb.g/2)+','+(rgb.b/2);
                        var m3=ccl(rgb.r)+','+ccl(rgb.g)+','+ccl(rgb.b);
                        // if((rgb.r + rgb.g + rgb.b) / 1.5 < 150){
                        //     m3='255,255,255';
                        // }
                        cb('rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',.5)', m,[['rgb('+m2+')','rgba('+m2+',.5)'],['rgb('+m3+')','rgba('+m3+',.5)']]);
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
        sp:function () {
            var k,p,e=10,o=50;
            $('.siquan-player').style.pointerEvents='none';
            function jt(){
                var a = true;
                document.body.style.transition = 'none';
                document.body.style.cursor = 'none';
                k=setInterval(function () {
                    a = !a;
                    if (a) {
                        $('.siquan-player').style.transform = 'translateY(-'+e+'px)';
                    } else {
                        $('.siquan-player').style.transform = 'translateY('+e+'px)';
                    }
                    sp.player.el.mode.click();
                }, 50);
                var b = true;
    
                p=setInterval(function () {
                    document.body.style.opacity = Math.random()*(o*0.01)+1-o*0.01;
                    b = !b;
                    if (b) {
                        $('.siquan-player').style.transform = 'translateX(-'+e+'px)';
                    } else {
                        $('.siquan-player').style.transform = 'translateX('+e+'px)';
                    }
                    sp.player.el.mode.click();
                }, 70);
            }

            var jd=0;
            $('audio').addEventListener('timeupdate',function(){
                var time=this.currentTime;
                if(jd==0&time>=14.4){
                    jt();
                    jd++;
                }

                if(jd==1&time>=20){
                    o=10;
                    e=4;
                    jd++;
                }

                if(jd==2&time>=20.5){
                    o=50;
                    e=10;
                    jd++;
                }
                if(jd==3&time>=22.7){
                    o=10;
                    e=4;
                    jd++;
                }
                if(jd==4&time>=23.2){
                    o=50;
                    e=10;
                    jd++;
                }
                if(jd==5&time>=24.2){
                    o=20;
                    e=8;
                    jd++;
                }
                if(jd==6&time>=26){
                    o=60;
                    e=60;
                    jd++;
                }
                if(jd==7&time>=36.5){
                    o=20;
                    e=5;
                    jd++;
                }

                if(jd==8&time>=38.5){
                    o=80;
                    e=80;
                    jd++;
                }

                if(jd==9&time>=44){
                    o=20;
                    e=5;
                    jd++;
                }
                if(jd==10&time>=45){
                    o=80;
                    e=80;
                    jd++;
                }
                if(jd==11&time>=50){
                    o=20;
                    e=5;
                    jd++;
                }
                if(jd==11&time>=61.5){
                    o=100;
                    e=120;
                    jd++;
                }
                if(jd==12&time>=73){
                    o=10;
                    e=5;
                    jd+=1;
                }
                if(jd==13&time>=78){
                    clearInterval(k);
                    clearInterval(p);
                    document.body.style.transition = '';
                    document.body.style.opacity='1';
                    document.body.classList.remove('light');
                    document.body.classList.add('dark');
                    o=100;
                    e=10;
                    jd++;
                }
                
                if(jd==14&time>=91){
                    jt();
                    jd++;
                }
                if(jd==15&time>=98){
                    o=10;
                    e=5;
                    jd++;
                }
                if(jd==16&time>=102){
                    o=100;
                    e=50;
                    jd++;
                }
                if(jd==17&time>=116){
                    o=100;
                    e=80;
                    jd++;
                }
                if(jd==18&time>=122.5){
                    o=0;
                    e=0;
                    jd++;
                }
                if(jd==19&time>=123.5){
                    o=100;
                    e=80;
                    jd++;
                }
                if(jd==20&time>=124.5){
                    o=0;
                    e=0;
                    jd++;
                }
                if(jd==21&time>=125.5){
                    o=100;
                    e=80;
                    jd++;
                }
                if(jd==22&time>=129){
                    o=10;
                    e=10;
                    jd++;
                }
                if(jd==23&time>=137){
                    o=100;
                    e=150;
                    jd++;
                }


                if(jd==24&time>=155){
                    clearInterval(k);
                    clearInterval(p);
                    document.body.style.opacity = '0';
                    var _=['#000','#00f'],__=0;
                    setInterval(function(){
                        document.documentElement.style.backgroundColor=_[__];
                        __=__==0?1:0;
                    },1000)
                    jd++;
                }
            })
            $('audio').addEventListener('ended',function(){
                $('audio').src='';
                $('audio').remove();
            })
        },
        resize:function resize() {
            var resizer = $("#resizer");
            var w = document.documentElement.clientWidth;
            var h = document.documentElement.clientHeight;
            document.body.style.width=w+'px';
            document.body.style.height=h+'px';
            if (w < 700) {
                resizer.innerHTML = '';
                return;
            }
            var styles = `.siquan-player .container .left .music-album-pic,
            .pure .siquan-player .container .left .music-controls .pl .iconbtn.playbtn{
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
        mid:null,
        musiclist:null,
        init: function () {
            var old_d=window.document;
            old_d.querySelector(".mbg img").onload=function(){
                this.style.opacity=1;
            }
            var document=$('.page.player');
            function $_(a,b){
                return document['querySelector' + (b ? 'All' : '')](a);
            }
            document.getElementById=function(id){
                return old_d.getElementById(id);
            }
            document.body=old_d.body;
            document.documentElement=old_d.documentElement;
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
                old_d.querySelector(".mbg img").style.opacity=0;
                sp.player.rs.forEach(function (r) {
                    r.abort();
                })
                sp.player.nowplay = i;
                sp.player.mid = sp.player.musiclist[i].mid;
                redef();
                sp.songs.actItem(sp.player.mid);
                xrLRC();
                setSongData(i);
                setTagAndInfo(i);
                localStorage.spNowplay=sp.player.musiclist[i].mid;
                localStorage.spMusiclist=sp.player.nowlistid;
            }
            
            this.play=play;

            // 设置歌曲标签和评价
            function setTagAndInfo(i) {
                var m=sp.player.musiclist[i];
                // TAG
                if (config.TAG) el.info.tags.innerHTML = m.tag.map(function (v) { return '<span class="s-tag">' + v + '</span>' }).join('');

                // 评价
                if (i == -1 || !config.INFO || !config.ENABLED_MID) return;
                el.info.pj.innerText=sp.infolist[m.mid]||'暂无';
            }

            // 获取并设置歌曲信息
            function setSongData(i) {
                var m=sp.player.musiclist[i];
                if(i>=0){
                    el.title.innerText=el.info.title.innerText=m.name;
                    document.title=_title=m.name;
                    el.singer.innerText=el.info.singer.innerText=m.artist;
                  }
                // 在i=-1时播放url的音乐信息
                sp.player.rs.push(musicapi.get(i == -1 ? lssong : m, function (data) {
                    if (data.error) {
                        sp.player.notice('歌曲获取失败', function () {
                            alert(data.error);
                        });
                        //歌曲获取失败切下一首
                        el.nextbtn.click();
                    } else {
                        el.img.src = data.img;
                        try{
                            old_d.querySelector(".mbg img").src = data.img;
                        }catch(e){}
                        $(".playing-mini img").src = data.img;
                        el.title.innerText = el.info.title.innerText = data.songname;
                        document.title = _title = data.songname;
                        el.audio.src = data.url;
                        el.album.innerText = el.info.album.innerText = data.album;
                        el.singer.innerText = el.info.singer.innerText = data.artist;
                        LRC = data.lrc;
                        if(data.lrcstr==''||data.nolrc){
                            if(m.tag&&m.tag.indexOf('纯音乐')!=-1){
                                LRC={0:'纯音乐，请欣赏'}
                            }
                        }
                        xrLRC();

                        if(m.tag&&m.tag.indexOf('纯音乐')!=-1){
                            document.classList.add('pure');
                        }else{
                            document.classList.remove('pure');
                        }

                        // 设置主题色
                        if (config.MAINCOLORBG) {
                            sp.player.colorfulImg(data.minipic || data.img, function (n, b,tt) {
                                old_d.querySelector('.bg').style.background = n;
                                if(config.MAINCOLORPLUS){
                                    old_d.getElementById('f').innerHTML='.siquan-player .container .right ul li{color:'+tt[0][1]+'}.siquan-player,.siquan-player .container .right ul li.act{color:'+tt[0][0]+'}'+
                                    '.siquan-player .container .left .music-controls .range .r1,.siquan-player .container .left .music-controls .range .r2{background-color:'+tt[0][0]+'}.siquan-player .container .left .music-controls .range{background-color:'+tt[0][1]+'}'+
                                    'body.dark .siquan-player .container .left .music-controls .range .r1,body.dark .siquan-player .container .left .music-controls .range .r2{background-color:'+tt[1][0]+'}body.dark .siquan-player .container .left .music-controls .range{background-color:'+tt[1][1]+'}'+
                                    'body.dark .siquan-player .container .right ul li{color:'+tt[1][1]+'}body.dark .siquan-player,body.dark .siquan-player .container .right ul li.act{color:'+tt[1][0]+'}';
                                }
                                if (b != -1) {
                                    if ((b && mode == 0) || (!b && mode == 1)) {
                                        el.mode.click()
                                    }
                                }
                            });
                        }

                        let img=data.minipic || data.img;
                        img=img.replace('http://','https://');
                        if ("mediaSession" in navigator) {
                            let metadata = new MediaMetadata({
                                title: data.songname,
                                artist: data.artist,
                                album: data.album||"",
                                artwork: [
                                    { src: img, sizes: "256x256", type: "image/jpeg" }
                                ]
                            });
                            navigator.mediaSession.metadata = metadata;
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
                LRC = { 0: '正在加载' };
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
                    var rli=el.lrc.querySelector('li.act');
                    var tli;
                    if(i!=-1){
                        tli=el.lrc.querySelectorAll('li')[i];
                        if(tli.classList.contains('act')){
                            return then();
                        }else{
                            rli&&rli.classList.remove('act');
                        }
                        tli.classList.add('act');
                    }else{
                        rli&&rli.classList.remove('act');
                        tli=el.lrc.querySelector('li');
                    }
                    function then(){
                        rli=null;
                        var tlitop=tli.offsetTop-el.lrc.offsetTop;
                        var h=$(".right").getBoundingClientRect().height/2-tli.getBoundingClientRect().height/2;      
                        el.lrc.style.marginTop=h-tlitop+'px';
                        tli=null;
                    }
                    then();
                    
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

            function initMediaSession() {
                if ("mediaSession" in navigator) {
                    navigator.mediaSession.setActionHandler('play', function () {
                        el.audio.play();
                    });
                    navigator.mediaSession.setActionHandler('pause', function () {
                        el.audio.pause();
                    });
                    navigator.mediaSession.setActionHandler('seekbackward', function () {
                        el.audio.currentTime -= 10;
                    });
                    navigator.mediaSession.setActionHandler('seekforward', function () {
                        el.audio.currentTime += 10;
                    });
                    navigator.mediaSession.setActionHandler('previoustrack', function () {
                        el.lastbtn.click();
                    });
                    navigator.mediaSession.setActionHandler('nexttrack', function () {
                        el.nextbtn.click();
                    });
                }
            }

            // 音乐播放器元素事件（除拖动条）
            function initPlayerEvents() {
                el.img.onerror =$('.playing-mini img').onerror= function () {
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
                        play(Math.floor(Math.random() * sp.player.musiclist.length));
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
                    $_(".dialog.musicinfo").classList.add('show');
                })
                el.fullBtn.addEventListener('click',function(){
                    if(old_d.fullscreenElement){
                        old_d.exitFullscreen();
                    }else{
                        document.documentElement.requestFullscreen();
                    }
                })

                old_d.addEventListener('fullscreenchange',function(){
                    if(old_d.fullscreenElement){
                        el.fullBtn.querySelector('.full').style.display='block';
                        el.fullBtn.querySelector('.unfull').style.display='none';
                    }else{
                        el.fullBtn.querySelector('.unfull').style.display='block';
                        el.fullBtn.querySelector('.full').style.display='none';
                    }
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
                console.log('inited');
                document.addEventListener('visibilitychange', function () {
                    var isHidden = document.hidden;
                    if (isHidden) {
                        document.body.style.display = 'none';
                    } else {
                        document.body.style.display = '';
                    }
                });
                window.onfocus = function () {
                    document.title = _title;
                    el.img.style.animationPlayState = ""
                    $_(".playing-anim").style.display = ""
                    activing = false;
                }
                window.onblur = function () {
                    document.title = "[性能模式冻结中]" + _title;
                    el.img.style.animationPlayState = "paused"
                    $_(".playing-anim").style.display = "none";
                    activing = true;
                }
            }

            // 初始化所有
            function init(){
                el={
                img:$_("#img"),
                title:$_("#music-title"),
                album:$_("#music-album"),
                singer:$_("#music-singer"),
                audio:$_("#audio"),
                range:{
                    r1:$_(".range .r1"),
                    r2:$_(".range .r2"),
                    r:$_(".range")
                },
                time:{
                    cur:$_(".time .l"),
                    max:$_(".time .r"),
                },
                playbtn:$_(".playbtn"),
                container:$_(".siquan-player .container"),
                lrc:$_(".right ul"),
                lastbtn:$_(".lastbtn"),
                nextbtn:$_(".nextbtn"),
                switchBtn:$_(".sx"),
                fullBtn:$_(".full"),
                mode:$_(".mode"),
                musiclistbtn:$_("#siquan-player-musiclist"),
                musicinfobtn:$_("#siquan-player-musicinfo"),
                info:{
                    title:$_(".info-name"),
                    album:$_(".info-album"),
                    singer:$_(".info-singer"),
                    tags:$_(".info-tags .in"),
                    pj:$_(".info-pj .in"),
                    tags_f:$_(".info-tags"),
                    pj_f:$_(".info-pj"),
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
                initMediaSession();
                if(config.PERFORMANCE_MODE)initPerformanceMode();
                if(!config.TAG){
                    el.info.tags_f.style.display='none';    
                }
                if(!config.INFO){
                    el.info.pj_f.style.display='none';
                }
                // 在开启模糊背景功能时检测电脑性能
                if(config.BLURBG){
                    old_d.querySelector(".mbg").style.display='block';
                }
            }

            //标题缓存（用于性能模式）
            var _title="我的音乐盒子";
            var isStopBlurBg=false;
            var LRC={0:'歌词加载中'};
            var defimg='https://image.gumengya.com/i/2023/10/15/652b46cf15392.png';
            // 页面主题
            var mode;
            var el;
            // 切换模式
            var switchMode;
            // 页面是否处于焦点
            var activing=false;
            var rangeDragging=true;
            // abort list
            config.ENABLED_MID=true;
            init();
        }
    },
    init: function () {
        sp.ready.setState('正在加载歌单...', 'loading');
        this.ready.init();
        this.initer.initMusicList();
        this.initer.initInfos();
        this.initer.initGroups();
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