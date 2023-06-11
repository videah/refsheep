curl --aws-sigv4 "aws:amz:auto:s3" \
 --user "$CLOUDFLARE_S3_token_id":"$cloudflare_s3_token_secret" \
  https://066350e15d51e9a547ca062c34f9a63a.r2.cloudflarestorage.com/otter-gallery/spencer/refsheet.png \
  --create-dirs --output ./public/test.png

# tsc && cross-env DEV=false npm-run-all zips:build zola:build vite:build
