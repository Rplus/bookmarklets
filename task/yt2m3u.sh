#!/bin/bash

# 捕捉 SIGPIPE，避免 Broken pipe 錯誤中斷
trap '' SIGPIPE

# 檢查 yt-dlp 是否安裝
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ 請先安裝 yt-dlp：https://github.com/yt-dlp/yt-dlp"
    exit 1
fi

# 檢查是否有輸入 URL
if [ -z "$1" ]; then
    echo "用法：$0 <YouTube 播放清單 URL>"
    exit 1
fi

URL="$1"

# 建立暫存 JSON 檔案
TMP_JSON=$(mktemp)

yt-dlp --flat-playlist -J "$URL" > "$TMP_JSON" || {
    echo "❌ 無法取得播放清單資料"
    rm "$TMP_JSON"
    exit 1
}

# 取得播放清單標題
# TITLE=$(yt-dlp --flat-playlist --print "%(playlist_title)s" "$URL" | head -n 1)
TITLE=$(jq -r '.title' "$TMP_JSON")
PLAYLIST_ID=$(jq -r '.id' "$TMP_JSON")
SAFE_TITLE=$(echo "${TITLE}_[${PLAYLIST_ID}]" | tr -d '/:*?"<>|' | sed 's/ /_/g')

# 檢查標題是否成功取得
if [ -z "$SAFE_TITLE" ]; then
    echo "❌ 無法取得播放清單標題"
    exit 1
fi

# 開始寫入 M3U 檔案
echo "#EXTM3U" > "$SAFE_TITLE.m3u"

# 解析 JSON 並寫入影片資訊
# jq -r '.entries[] | "#EXTINF:-1," + .title + "\nhttps://www.youtube.com/watch?v=" + .id' "$TMP_JSON" >> "$SAFE_TITLE.m3u"
jq -r '.entries[] | "#EXTINF:" + (.duration // -1 | tostring) + "," + .title + "\nhttps://www.youtube.com/watch?v=" + .id' "$TMP_JSON" >> "$SAFE_TITLE.m3u"

# 清理暫存
rm "$TMP_JSON"

echo "✅ 已產生播放清單：$SAFE_TITLE.m3u"
