cat ./base_url >> config.toml
cat ./config.base.toml >> config.toml
function cleanup {
  echo "Removing /config.toml"
  rm  config.toml
}
trap cleanup EXIT

npm-run-all --parallel tailwind:serve vite:serve zola:serve