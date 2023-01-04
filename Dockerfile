# Version of caddy to be used for hosting
ARG CADDY_VERSION=2.6.2

FROM node:lts-bullseye as constructer
WORKDIR app
COPY package.json yarn.lock ./

# Installs dependencies/plugins and compiles the blog's CSS
RUN yarn install
COPY . .
RUN yarn build

FROM tdewolff/minify:latest AS minifier
WORKDIR app
COPY --from=constructer /app/public public

# Minify the sites content
RUN minify -r -a -s -o minified public

FROM alpine:3.16 AS compressor
WORKDIR app
COPY --from=minifier /app/minified minified

RUN apk add --no-cache brotli gzip

# Precompress site content for faster delivery
RUN find ./minified -type f -size +1400c \
    -regex ".*\.\(css\|html\|js\|json\|svg\|xml\)$" \
    -exec brotli --best {} \+ \
    -exec gzip --best -k {} \+

FROM videah/oxipng AS optimizer
WORKDIR /app
COPY --from=compressor /app/minified minified

# find all PNGs and optimize them
RUN find ./minified -type f -name "*.png" -exec oxipng --opt 3 --interlace 0 --strip safe {} \+

FROM caddy:${CADDY_VERSION}-builder AS embedder
RUN git clone https://github.com/mholt/caddy-embed.git && cd caddy-embed && git checkout 6bbec9d
WORKDIR caddy-embed

# Do a dry run to ache go dependencies for building caddy
ENV XCADDY_SKIP_BUILD=1
RUN xcaddy build \
    --with github.com/mholt/caddy-embed=. \
    --with github.com/caddyserver/cache-handler

COPY --from=optimizer /app/minified files

# Build a custom caddy binary with the site's files embedded.
# This is so we can serve the site straight from memory.
ENV XCADDY_SKIP_BUILD=0
RUN xcaddy build \
    --with github.com/mholt/caddy-embed=. \
    --with github.com/caddyserver/cache-handler

FROM caddy:${CADDY_VERSION}-alpine AS runtime
WORKDIR app
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=embedder /usr/bin/caddy-embed/caddy /usr/bin/caddy