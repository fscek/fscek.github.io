Welcome to the repository for my personal portfolio website, [szch.me](http://szch.me). This site showcases my work as a music producer, DJ, and visual artist, featuring a selection of my recent releases, tour dates, examples of my visual art, and links to my social media profiles.

I didn't want to overcomplicate things, so it's a cute and simple static website instead.

Multiple JSON files feed into JS scripts that render them, and that sort of makes it like a small and fake CMS solution, which covers my needs completely at this time.
The JS scripts fetches the JSONs, parse them and skip particular content if their specific fields are filled out.
It will also serve as my personal archive throughout the years (2024 marks the 10th anniversary of my project), so year selectors were also implemented.

Using jsDeliver as the CDN, grabbing assets from [the other repo hosting the files](https://github.com/fscek/szch-me-assets), inserting them in their respective JSONs and rendering them using the JS scripts.

WIP at the moment, hosted on GitHub Pages and Cloudflare DNS.