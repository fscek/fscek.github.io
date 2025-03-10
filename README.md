# szch.me

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/fscek/fscek.github.io.svg)](https://github.com/fscek/fscek.github.io/issues)
[![Last Commit](https://img.shields.io/github/last-commit/fscek/fscek.github.io.svg)](https://github.com/fscek/fscek.github.io/commits/main)
[![Build Status](https://github.com/fscek/fscek.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/fscek/fscek.github.io/actions/workflows/pages/pages-build-deployment)

---

Welcome to the repository for my personal portfolio website, [szch.me](http://szch.me). This site showcases my work as a music producer, DJ, and visual artist, featuring a selection of my recent releases, tour dates, examples of my visual art, and links to my social media profiles.

I didn't want to overcomplicate things, so it's a cute and simple static website instead.

Multiple JSON files feed into JS scripts that render them, and that sort of makes it like a small makeshift CMS solution, which covers my needs completely at this time.
The JS scripts fetch the JSONs, parse them and skip particular content if their predefined fields are/aren't filled out.
It will also serve as my personal archive throughout the years (2024 marks the 10th anniversary of my project), so year selectors were also implemented.

Using jsDeliver as the CDN, grabbing assets from [the other repo hosting the files](https://github.com/fscek/szch-me-assets), inserting them in their respective JSONs and rendering them using the JS scripts.

Some future plans and improvements are addressed via the repository's GitHub Issues page.
WIP at the moment, hosted on GitHub Pages and Cloudflare DNS.
