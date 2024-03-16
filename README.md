Welcome to the repository for my personal portfolio website, [szch.me](http://szch.me). This site showcases my work as a music producer, DJ, and visual artist, featuring a selection of my recent releases, tour dates, examples of my visual art, and links to my social media profiles.

I didn't want to overcomplicate things, so it's a cute and simple static website instead.
Multiple json files feed into JS that renders them and it's sort of a fake CMS solution and completely covers my needs. The JS scripts fetch the jsons, parse them and skip particular content if their specific fields are filled out.
It will also serve as my personal archive throughout the years (2024 marks the 10th anniversary of my project), so year selectors were also implemented.

WIP at the moment, hosted on GitHub Pages and Cloudflare DNS.