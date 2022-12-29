+++
title = "James"
description = "Loving father to Videah"

[extra]
icon = "https://videah.net/static/images/logo.png"
colors = ["#2d1413", "#5a292d", "#6c383c", "#f9d670", "#915856", "#b73341", "#6baac5", "#f6cfc9"]
color_tolerances = [10, 10, 5, 30, 10, 20, 35, 20]
require_nsfw_in_url = true
nsfw_refsheet = false
+++

{{ nsfwtoggle() }}

{{ nsfwdescription(path="content/dad/nsfw.toml") }}

{% card(title="About") %}
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Integer ac dui eu felis hendrerit fermentum.

 - Testing
{% end %}

{% card(title="⚠️ Common Mistakes") %}
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Integer ac dui eu felis hendrerit fermentum.
{% end %}

{{ gallery(path="content/dad/config.toml") }}

{{ nsfwgallery(path="content/dad/nsfw.toml") }}