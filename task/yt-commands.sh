#!/bin/bash

# echo "使用方式: bash $0 <youtube-url>"

DOWNLOAD_DIR="/mnt/D/DW"

URL="$1"

# 如果沒傳入參數，就互動輸入
if [ -z "$URL" ]; then
  read -p "請輸入 YouTube URL: " URL
  # 再檢查一次，避免空值
  if [ -z "$URL" ]; then
    echo "未輸入 URL，程式結束。"
    exit 1
  fi
fi

while true; do
  echo "請選擇要對 $URL 執行的功能："
  echo "0) 修改 URL"
  echo "1) 下載縮圖"
  echo "2) 列出&下載[影音]"
  echo "3) 列出&下載<字幕>"
  echo "000) 離開"
  read -p "輸入數字選項: " choice

  case $choice in
    0)
      read -p "請輸入新的 YouTube URL: " newurl
      if [ -n "$newurl" ]; then
        URL="$newurl"
        echo "已更新 URL 為: $URL"
      fi
      ;;

    1)
      yt-dlp --write-thumbnail --no-mtime --skip-download --convert-thumbnails webp -P "$DOWNLOAD_DIR" "$URL"
      ;;

    2)
      yt-dlp -F "$URL"
      echo "請輸入要下載的影音代碼"
      read -p "影音代碼: " avcode
      if [ -z "$avcode" ]; then
        echo "錯誤：沒有輸入影音代碼，回上層選單。"
        continue
      fi
      yt-dlp -P "$DOWNLOAD_DIR" "$URL" -f "$av"
      ;;

    3)
      echo "列出字幕清單..."
      yt-dlp --list-subs "$URL"

      echo "請輸入要下載的語言代碼 (例如: en, zh-Hant, ja，多個用逗號分隔):"
      read -p "語言代碼: " langs

      if [ -z "$langs" ]; then
        echo "錯誤：沒有輸入語言代碼，回上層選單。"
        continue
      fi

      echo "下載字幕中..."
      yt-dlp --sub-lang "$langs" --write-sub --skip-download -P "$DOWNLOAD_DIR" "$URL"
      echo "字幕下載完成"
      ;;

    000)
      echo "結束程式。"
      break
      ;;

    # 1)
    #   echo "列出字幕..."
    #   yt-dlp --list-subs "$URL"
    #   ;;

    # 4)
    #   yt-dlp -F "$URL"
    #   ;;

    *)
      echo "無效選項，請重新輸入。"
      ;;
  esac
done
