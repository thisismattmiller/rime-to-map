#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const map_html_template = require('./map_template')


if (!process.argv[2] || !fs.existsSync(process.argv[2])){
  console.error("No rime file passed or incorrect path")
  process.exit()
}

var utilName = (process.argv[3]) ? process.argv[3] : 'plutil'

// try to convert it with system utils
var fileName = path.parse(process.argv[2]).name + '.xml';


exec(`${utilName} -convert xml1 "${process.argv[2]}" -o "${fileName}"`, (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command    
    console.log(err)
    console.log('It looks like you don\'t have the "plutil" command line tool on your system. Install it (OSX) or if it has a different name on your system pass its name as the second argument, for example on ubuntu: "rime-to-map my_file.rime plistutil"')
    process.exit()
    return;
  }

  if (!fs.existsSync(fileName)){
    console.error('Something went wrong converting the plist file! \n Try running this command manually and see what happens:\n',`${utilName} -convert xml1 ${process.argv[2]} -o ${fileName}`)
    process.exit()
  }


  var doc = new dom().parseFromString(fs.readFileSync(fileName).toString().replace(/\t|\n/g,''))
  var nodes = xpath.select("//*", doc)

  try {
    fs.mkdirSync('./images')
  }catch (e) {
    if (e.code !== 'EEXIST'){
      console.error('Could not create ./images directory to store the images!')
      process.exit()
    }
  }
  var count = -2
  var longitudes = []
  var latitudes = []
  nodes.forEach((n)=>{

    if (n.tagName === 'data'){
      var buf = Buffer.from(n.firstChild.data.trim(), 'base64');
      if (n.previousSibling.tagName === 'real'){
        longitudes.push(n.previousSibling.firstChild.data)
      }      
      fs.writeFileSync(`./images/${count++}.jpg`,buf)
    }

    if (n.tagName === 'string' && n.firstChild.data === 'SurveyPhoto'){
      if (n.nextSibling.tagName === 'real'){
        latitudes.push(n.nextSibling.firstChild.data)
      }
    }

  })


  if (latitudes.length === 0 || longitudes === 0){
    console.error('No lat/lng found! Report as issue with this rime file as example')
    process.exit()
  }
  if (latitudes.length !== longitudes.length){
    console.error('Uneven number of lat/lng found! Report as issue with this rime file as example')
    process.exit()
  }

  var results = []

  for (let x = 0; x<latitudes.length; x++){
    results.push({
      latitude: latitudes[x],
      longitude: longitudes[x],
      image: `${x}.jpg`,
      title: ''
    })
    fs.writeFileSync('data.json',JSON.stringify(results,null,2))
  }

  fs.writeFileSync('index.html',map_html_template.html)

  if (fs.existsSync('.gitignore')){
    fs.appendFile('.gitignore', `\n${process.argv[2]}\n${fileName}`, function (err) {
      if (err) throw err;      
    });
  }


});

