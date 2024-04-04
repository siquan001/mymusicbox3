var musicapi = {
  get: function (details, callback) {
    var r,k=0,errs={qq:{error:null},kugou:{error:null},netease:{error:null}};
    details.def=details.def?details.def:{};
    details.def.title=details.def.title?details.def.title:(details.artist+'-'+details.name);
    details.def.songname=details.def.songname?details.def.songname:details.name;
    details.def.artist=details.def.artist?details.def.artist:details.artist;
    if(details.def.lrcstr){
      details.def.lrc=this.parseLrc(details.def.lrcstr);
    }
    function checkUrl(url,cb){
      var audio=document.createElement('audio');
      audio.src=url;
      audio.onloadedmetadata=function(){
        cb(true);
      }
      audio.onerror=function(){
        cb(false);
      }
    }
    function g(){
       if (details.kugou && details.kugou.hash && k<1) {
        r = musicapi._kugou(details.kugou.hash, details.kugou.album_id, function (res) {
          console.log(res);
          if (res.error||!res.url) {
            errs.kugou=res;
            k++;
            g();
            return;
          }else{
            checkUrl(res.url,function(ok){
              if(ok){
                callback(musicapi._compareDef(res, details.def));
              }else{
                errs.kugou=res;
                k++;
                g();
              }
            })
          }
        });
      } else if (details.netease && details.netease.id && k<2) {
        r = musicapi._netease(details.netease.id, function (res) {
          if (res.error) {
            errs.netease=res;
            k++;
            g();
            return;
          }else{
            checkUrl(res.url,function(ok){
              if(ok){
                callback(musicapi._compareDef(res, details.def));
              }else{
                errs.kugou=res;
                k++;
                g();
              }
            })
          }
        });
      } else if (details.qq && details.qq.mid && k<3) {
        r = musicapi._qq(details.qq.mid, function (res) {
          if (res.error) {
            errs.qq=res;
            k++;
            g();
            return;
          }else{
            checkUrl(res.url,function(ok){
              if(ok){
                callback(musicapi._compareDef(res, details.def));
              }else{
                errs.kugou=res;
                k++;
                g();
              }
            })
          }

        });
      } else {
        if(k==0){
          callback(details.def)
        }else{
          console.log(errs);
          callback({
            error:"QQ:"+errs.qq.error+"\nKugou:"+errs.kugou.error+"\nNetease:"+errs.netease.error,
            errs:errs
          })
        }
        
      }
    }
    g()
    return r;
  },
  search: function (keyword, cb, details={}) {
    if(typeof details!=='object'||!details){
      details={}
    }
    if(details.type=='qq'){
      return musicapi._qq_search(keyword, cb, details);
    }else if(details.type=='netease'){
      return musicapi._netease_search(keyword, cb, details);
    }else{
      return musicapi._kugou_search(keyword, cb, details);
    }
  },
  _kugou: function (hash, album_id, cb) {
    var url = "https://api.gumengya.com/Api/KuGou?format=json&id=" + hash.toUpperCase()
    var a = musicapi._request(url, function (res) {
      if (res.code == 200) {
        cb({
          title: res.data.author+' - '+res.data.title,
          songname: res.data.title,
          artist: res.data.author,
          lrc: musicapi.parseLrc(res.data.lrc),
          url: res.data.url,
          album: '',
          img: res.data.pic.replace('/150',''),
          lrcstr: res.data.lrc,
          minipic:res.data.pic
        });
      } else {
        cb({
          error: '获取歌曲失败',
          code: res.err_code
        })
      }
    });
    return a;
  },
  _qq: function (mid, cb) {
    var c = 0, d = {},b;
    var a = musicapi._request('https://api.gumengya.com/Api/Tencent?format=json&id=' + mid, function (res) {
      if (res == false || !res.data) {
        a = musicapi._request('https://siquan-api.wdnmd.top/api/QQMusic?mid=' + mid, function (r) {
          if (r == false || r.code != 200) {
            cb({
              error: '获取歌曲失败',
              code: 10000
            })
            b.abort();
          } else {
            var e = {
              title: r.data.singer + ' - ' + r.data.song,
              songname: r.data.song,
              artist: r.data.singer,
              url: r.data.url,
              album: r.data.album,
              img: r.data.cover,
            };
            for (var k in e) {
              d[k] = e[k];
            }
            c++;
            if (c == 2) {
              cb(d);
            }
          }
        })
        b = musicapi._request('https://siquan-api.wdnmd.top/api/QQMusic?type=lyrics&mid=' + mid, function (r) {
          if (r == false || r.code != 200) {
            d.nolrc=true;
            d.lrc = { 0: "歌词获取失败" }
            d.lrcstr = '[00:00.00] 歌词获取失败'
          } else {
            d.lrc = musicapi.parseLrc(r.data);
            d.lrcstr = r.data;
          }
          c++;
          if (c == 2) {
            cb(d);
          }
        })
        
      } else {
        cb({
          title: res.data.author + ' - ' + res.data.title,
          songname: res.data.title,
          artist: res.data.author,
          lrc: musicapi.parseLrc(res.data.lrc),
          url: res.data.url.replace('https://','http://'),
          album: '',
          img: res.data.pic,
          lrcstr: res.data.lrc,
        });
      }
    })
    return {
      abort: function () {
        a.abort();
        b&&b.abort();
      }
    };
  },
  _netease: function (id, cb) {
    var c = 0, d = {},b;
    var a = musicapi._request('https://api.gumengya.com/Api/Netease?format=json&id=' + id, function (res) {
      if (res == false || !res.data) {
        a = musicapi._request('https://api.epdd.cn/V1/Music/Netease?q=4&id=' + id, function (r) {
          if (r == false || r.code != 200) {
            cb({
              error: '获取歌曲失败',
              code: 10000
            })
            b.abort();
          } else {
            var e = {
              title: r.data.singer + ' - ' + r.data.song,
              songname: r.data.song,
              artist: r.data.singer,
              url: r.data.url,
              album: r.data.album,
              img: r.data.cover,
            };
            for (var k in e) {
              d[k] = e[k];
            }
            c++;
            if (c == 2) {
              cb(d);
            }
          }
        })
        b = musicapi._request('https://api.vkeys.cn/API/Netease_Cloud/Lyric?id=' + id, function (r) {
          if (r == false || r.code != 200) {
            d.lrc = { 0: "歌词获取失败" }
            d.lrcstr = '[00:00.00] 歌词获取失败'
          } else {
            d.lrc = musicapi.parseLrc(r.data);
            d.lrcstr = r.data;
          }
          c++;
          if (c == 2) {
            cb(d);
          }
        })
        
      } else {
        cb({
          title: res.data.author + ' - ' + res.data.title,
          songname: res.data.title,
          artist: res.data.author,
          lrc: musicapi.parseLrc(res.data.lrc),
          url: res.data.url.replace('https://','http://'),
          album: '',
          img: res.data.pic,
          lrcstr: res.data.lrc,
        });
      }
    })
    return {
      abort: function () {
        a.abort();
        b&&b.abort();
      }
    };
  },
  _request: function (url, cb) {
    // if(url.indexOf('api.epdd.cn')!=-1) url='https://util.siquan.tk/api/cors?url='+encodeURIComponent(url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        k=xhr.responseText;
        try {
          k=JSON.parse(k);
        } catch (e) {
          
        }
        cb(k)
      }else if (xhr.status > 400) {
        cb(false);
      }
      
    };
    xhr.onerror = function () {
      cb(false);
    }
    try {
      xhr.send();
    } catch (e) { }
    return {
      abort: function () {
        xhr.abort();
      }
    }
  },
  _jsonp: function (url, cb, cbname) {
    var script = document.createElement('script');
    var fnname = 'jsonp_' + Math.random().toString().replace('.', '');
    var urlm = url + (url.indexOf('?') >= 0 ? '&' : '?') + (cbname || 'callback') + '=' + fnname;
    script.src = urlm;
    window[fnname] = function () {
      delete window[fnname];
      cb.apply(null, arguments);
    }
    document.body.appendChild(script);
    script.onload = function () {
      document.body.removeChild(script);
    }
    return {
      abort: function () {
        try {
          script.remove();
          script = null;
        } catch (e) {/* script 因为document.body.innerHTML改变或已被删除 */ }
      }
    }
  },
  _kugou_search: function (keyword, cb, details) {
    var url = 'https://mobiles.kugou.com/api/v3/search/song?format=jsonp&keyword=' + encodeURI(keyword) + '&page=' + (details.page||1) + '&pagesize='+(details.pagesize||30)+'&showtype=1';
    var a=musicapi._jsonp(url, function (data) {
      var res = {
        total: data.data.total,
        page: details.page||1,
        songs: [],
      }
      data.data.info.forEach(function (song) {
        var pushed={
          name: song.songname,
          artist: song.singername,
          kugou:{
            hash: song.hash,
            album_id: song.album_id,
            ispriviage: song.privilege >= 10,
          }
        };
        if(song.filename.match(/【歌词 : .*】/)){
          var matched=song.filename.match(/【歌词 : .*】/);
          pushed.title=song.filename.replace(matched[0], '');
          pushed.matchLyric=matched[0].replace('【歌词 : ', '').replace('】', '');
        }else{
          pushed.title=song.filename;
        }
        res.songs.push(pushed);
      });
      cb(res);
    })
    return a;
  },
  _qq_search: function (keyword, cb, details) {
    var url = 'https://api.lolimi.cn/API/yiny/?word='+encodeURIComponent(keyword)+'&num='+(details.pagesize||30)+'&page='+(details.page||1);
    var a=musicapi._request(url, function (data) {
      var res = {
        total: Infinity,
        page: details.page||1,
        songs: [],
      }
      data.data.forEach(function (song) {
        var pushed={
          name: song.song,
          artist: song.singer,
          qq:{
            mid:song.mid
          }
        };
        pushed.title=song.singer+' - '+song.song;
        res.songs.push(pushed);
      });
      cb(res);
    })
    return a;
  },
  _netease_search: function (keyword, cb, details) {
    var url = 'https://api.gumengya.com/Api/Music?format=json&site=netease&text='+encodeURIComponent(keyword)+'&num='+(details.pagesize||30)+'&page='+(details.page||1);
    var a=musicapi._request(url, function (data) {
      var res = {
        total: Infinity,
        page: details.page||1,
        songs: [],
      }
      data.data.forEach(function (song) {
        var pushed={
          name: song.title,
          artist: song.author,
          netease:{
            id:song.songid
          }
        };
        pushed.title=song.author+' - '+song.title;
        res.songs.push(pushed);
      });
      cb(res);
    })
    return a;
  },
  parseLrc: function (lrc) {
    var oLRC = [];
    if (lrc.length == 0) return;
    var lrcs = lrc.split('\n');//用回车拆分成数组
    for (var i in lrcs) {//遍历歌词数组
      lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
      var t = lrcs[i].substring(lrcs[i].indexOf("[") + 1, lrcs[i].indexOf("]"));//取[]间的内容
      var s = t.split(":");//分离:前后文字
      if (!isNaN(parseInt(s[0]))) { //是数值
        var arr = lrcs[i].match(/\[(\d+:.+?)\]/g);//提取时间字段，可能有多个
        var start = 0;
        for (var k in arr) {
          start += arr[k].length; //计算歌词位置
        }
        var content = lrcs[i].substring(start);//获取歌词内容
        for (var k in arr) {
          var t = arr[k].substring(1, arr[k].length - 1);//取[]间的内容
          var s = t.split(":");//分离:前后文字
          oLRC.push({//对象{t:时间,c:歌词}加入ms数组
            t: (parseFloat(s[0]) * 60 + parseFloat(s[1])).toFixed(3),
            c: content
          });
        }
      }
    }
    oLRC.sort(function (a, b) {//按时间顺序排序
      return a.t - b.t;
    });
    var r = {};
    oLRC.forEach(function (a) {
      r[a.t] = a.c;
    })
    return r;
  },
  _compareDef: function (r, def) {
    if (!def) return r;
    for (var k in def) {
      r[k] = def[k];
    }
    return r;
  }
}