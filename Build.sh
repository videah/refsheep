yarn
python Build.py
tsc && cross-env DEV=false npm-run-all zips:build zola:build vite:build
