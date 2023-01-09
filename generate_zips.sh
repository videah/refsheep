#!/usr/bin/env sh

mkdir -p static/zips;
cd content || exit;
for d in *; do
  (
    cd "$d" || exit;
    zip -9 -r "../../static/zips/${d#content/}.zip" "./" -i "./*.jpg" "./*.png" -x "./gallery_nsfw/*" -x "./refsheet_nsfw.png"
    if [ -d "./gallery_nsfw" ]; then
      zip -9 -r "../../static/zips/${d#content/}_nsfw.zip" "./" -i "./*.jpg" "./*.png"
    fi
  )
done