
'use strict';

const configureWebpack = require('./webpack');
const markdown = require('./markdown');
const fs = require("fs");

function getSidebarArr() {
  const docsPath = __dirname + "/../";
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
    } else {
      // NOT directory
      // title is '/' children is file
      HomeFilelist.push(file);
    }
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

const sidebar = getSidebarArr()
const postItems = sidebar.map((o) => {
  return { text: o.title, link: o.children[0] };
})

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
      {
        text: 'Post', 
        ariaLabel: 'Language Menu',
        items: postItems,
      },
    ],
    sidebar,
  },
  plugins: [
    'vuepress-plugin-mermaidjs'
  ],
}
