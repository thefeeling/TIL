
'use strict';

const configureWebpack = require('./webpack');
const markdown = require('./markdown');
const fs = require("fs");
const docsPath = __dirname + "/../";


// const markdownLinkExtractor = require('markdown-link-extractor');
// const dirTree = require('directory-tree');
// const debug = require('debug')
// const { logger } = require('@vuepress/shared-utils')
// const sidebar = () => {
//   const data = dirTree(docsPath, {
//     extensions: /\.md/,
//     attributes:['mode', 'mtime']
//   });
//   logger.debug('data', data);
//   return data.children;
// }


function getSidebarArr() {
  const sidebarArr = [];
  const HomeFilelist = [];
  const filelist = fs.readdirSync(docsPath);
  filelist.forEach(function(file) {
    if (file === ".vuepress") return;
    const stat = fs.lstatSync(docsPath + "/" + file);
    if (stat.isDirectory()) {
      // directory
      // title is file, children is readdirSync
      const docsFolderPath = docsPath + "/" + file;
      const list = fs.readdirSync(docsFolderPath);
      sidebarArr.push(makeSidebarObject(file, list));
    } 
    // else {
    //   // NOT directory
    //   // title is '/' children is file
    //   HomeFilelist.push(file);
    // }
  });
  sidebarArr.unshift(makeSidebarObject("", HomeFilelist));
  console.error(sidebarArr)
  return sidebarArr;
}

function makeSidebarObject(folder, mdfileList) {
  let title;
  const path = folder ? "/" + folder + "/" : "/";
  mdfileList = aheadOfReadme(mdfileList);
  const tmpMdfileList = [];
  // remove .md, add Path
  mdfileList.forEach(function(mdfile) {
    if (mdfile.substr(-3) === ".md") {
      mdfile = mdfile.slice(0, -3) === "README" ? "" : mdfile.slice(0, -3);
      tmpMdfileList.push(path + mdfile);
    }
  });
  mdfileList = tmpMdfileList;
  // remove folder prefix number
  if (folder) {
    const dotIdx = folder.indexOf(".");
    title = Number(folder.substr(0, dotIdx))
        ? folder.substr(dotIdx + 1)
        : folder;
  } else {
    title = "HOME";
  }
  return {
    title: title,
    children: mdfileList
  };
}
function aheadOfReadme(arr) {
  // ['1.test.md','README.md'] => ['README.md','1.test.md']
  const readmeIdx = arr.indexOf("README.md");
  if (readmeIdx > 0) {
    arr.unshift(arr.splice(readmeIdx, 1)[0]);
  }
  return arr;
}

module.exports = {
  displayAllHeaders: true,
  docsDir: 'docs',
  title: "Choi's Dev",
  description: 'Software Engineer, Backend-Developer',
  configureWebpack,
  markdown,
  theme: 'antdocs',
  themeConfig: {
    lastUpdated: 'Last Updated',
    smoothScroll: true,
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Github', link: 'https://www.github.com/thefeeling' },
    ],
    sidebar: getSidebarArr(),
  },
  plugins: [
    'vuepress-plugin-mermaidjs',
    ["sitemap", { hostname: "https://thefeeling.github.io/" }],
    [
      '@vuepress/google-analytics',
      {
        ga: 'G-9EB3LVE0E9',
      }
    ]
  ],
}
