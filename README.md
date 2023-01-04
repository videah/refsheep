# 🐑 - refsheep

`refsheep` is a character reference page and gallery generator intended to make life easier when commissioning artists.

You can see it in action at [refs.videah.net/videah](https://refs.videah.net/videah/)

It is built on top of [Zola](https://www.getzola.org), [Vite](https://vitejs.dev), and [Tailwind](https://tailwindcss.com).
It is arguably overengineered. It is meant to serve my own purposes andif other people find use out of it that's just a nice bonus.

### Features
- Automatic color pallete indicator buttons that highlight parts of ref sheets
- Fully responsive and automatic mosiac card layout
- 3D model turntables powered by [\<model-viewer\>](https://modelviewer.dev)
- Automated image gallery with artist credit links
- Automatically resizes images for smaller filesizes
- NSFW content toggle, can be hidden behind URL parameters

## Usage

```bash
# Install necessary dependencies
yarn install

# Serve refsheep locally and hot-reload any changes made
yarn watch

# Build and bundle everything into a production ready package
yarn build

# Build a Caddy web server docker image with refsheep embeded inside
# This is what powers refs.videah.net
docker build
```

## Structure

Characters can be added by creating a directory in `content` named after your character and an `index.md` file.
The name of the directory is what your character's URL will be (i.e example.com/character-name).

The markdown file defines the character's page structure and content. This is done through a cursed combination of TOML, Markdown, and HTML.
You can see an example of what this looks like in the includedcharacters `videah` and `dad`.

The beginning of the file requires a TOML section in between +++'s that sets a few variables for the pages generation.

```toml
+++
# These appear on the landing page and at the top of the specific characters page
# Display name of the character.
title = "Videah"
# Description of the character.
description = "Nerdy gay werewolf"

[extra]
# Emoji that's used in the browser tab title
emoji = "🐺"
# These are colors that are used in the color pallete below the reference sheet.
colors = ["#2d1413", "#5a292d", "#6c383c", "#f9d670", "#915856", "#b73341", "#6baac5", "#f6cfc9"]
# Tolerances of the colors specificed above in the same order.
# Used to highlight colors that are close but not quite an exact match.
color_tolerances = [10, 10, 5, 30, 10, 20, 35, 20]
# By default a NSFW toggle will appear if you have NSFW content.
# This option makes it so ?nsfw=true is needed at the end of your URL for that to appear.
require_nsfw_in_url = true
+++
```

## Shortcodes

This project makes heavy use of [Zola shortcodes](https://www.getzola.org/documentation/content/shortcodes).

These can be found in `templates/shortcodes`
