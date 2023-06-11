#!/usr/bin/env sh

mkdir -p static/zips;
cd content || exit;
for d in *; do
  (
    cd "$d" || exit;
    zip-files -o "../../static/zips/${d#content/}.zip" "./" -x "*.toml" -x "*.md" -x "./gallery_nsfw/*" -x "./refsheet_nsfw.png"
    if [ -d "./gallery_nsfw" ]; then
      zip-files -o "../../static/zips/${d#content/}_nsfw.zip" "./" -x "*.toml" -x "*.md"
    fi
  )
done