# rime-to-map
Convert a rime file from the PointPlot App to a map

This is a simple npm modules to be used as a global CLI tool (you need Node and NPM installed). You give it a RIME file, which it output from the PointPlot iOS App (https://itunes.apple.com/us/app/pointplot/id899580399 v 3.1.0) that contains geo located images taken with the app and it will turn it into a ready to go Leaflet powered web map.

The RIME filetype is just a binary plist (https://en.wikipedia.org/wiki/Property_list) so you need to have `plutil` (on OSX, comes with xcode) or `plistutil` (linux) installed.

This module runs the local plutil, converts it to XML and pulls out the image data and lat/lng. Generates a Leaflet map and needed image assests. 

To publish to github pages the work flow would be:
- Install this tool globally: `npm install -g rime-to-map`
- Create a new github repo
- Clone that repo locally `git clone https://github.com/yourname/your-map-repo-name.git`
- Export the rime file out of the App and put it into that cloned directory
- run `rime-to-map name-of-your-rime-file.rime`
- This generates the web map and assets, `git add .` and `git commit -m 'cool'` and `git push`
- Go to your repo on github and enable github pages for the repo under settings, your web map should now be published

