import { NextResponse } from 'next/server';

// 网易云音乐官方 API
const NETEASE_API_BASE = 'https://music.163.com/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    // 1. 获取歌曲详情 - 需要特定的请求头
    const detailUrl = `${NETEASE_API_BASE}/song/detail/?id=${id}&ids=[${id}]`;
    const detailResponse = await fetch(detailUrl, {
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': 'https://music.163.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    if (!detailResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch song detail' }, { status: detailResponse.status });
    }

    const detailData = await detailResponse.json();
    
    if (!detailData.songs || detailData.songs.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const song = detailData.songs[0];
    
    // 2. 获取歌词
    const lyricUrl = `${NETEASE_API_BASE}/song/lyric?id=${id}&lv=-1&kv=-1&tv=-1`;
    let lrcText = '';
    try {
      const lyricResponse = await fetch(lyricUrl, {
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Referer': 'https://music.163.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (lyricResponse.ok) {
        const lyricData = await lyricResponse.json();
        lrcText = lyricData.lrc?.lyric || '';
      }
    } catch {
      // 歌词获取失败不影响播放
    }

    // 3. 播放地址使用外链
    const playUrl = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;

    // 返回格式兼容原有代码
    const result = [{
      id: id,
      name: song.name || '未知歌曲',
      author: song.ar?.map((a: any) => a.name).join('/') || '未知歌手',
      artist: song.ar?.map((a: any) => a.name).join('/') || '未知歌手',
      url: playUrl,
      pic: song.al?.picUrl || '',
      cover: song.al?.picUrl || '',
      lrc: lrcText
    }];

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Music API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch music data',
      message: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}