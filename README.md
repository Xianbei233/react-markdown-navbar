# React-Markdown-Navbar

![npm](https://img.shields.io/npm/l/react-markdown-navbar.svg)
![npm](https://img.shields.io/npm/dt/react-markdown-navbar.svg)
![npm](https://img.shields.io/npm/v/react-markdown-navbar/latest.svg)
![GitHub file size in bytes](https://img.shields.io/github/size/xianbei233/react-markdown-navbar/lib/index.jsx)

A React component renders an interactive navbar panel of Markdown docs for your blog or website.

A update version of [Markdown-navbar](https://www.npmjs.com/package/markdown-navbar),clean the unreasonable code, support the hash mode route

[![Demo on Netlify](https://screenshots.codesandbox.io/e7e0n.png)](https://csb-e7e0n.netlify.com/)

## Features

Implement some regular functions easily by using this component, such as:

- Display the structure tree of your article defined by the headings.
- Render anchors that navigate to specific headings in the article.
- Share one URL to readers to navigate to a specific area of the article.

## Install

```bash
yarn add react-markdown-navbar # or `npm i react-markdown-navbar --save`
```

## Quickstart

[![Edit markdown-navbar-demo-online](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/markdown-navbar-demo-online-forked-ltec2?file=/src/index.js)

```jsx
import React from "react";
import ReactDOM from "react-dom";
// One third-part component for render markdown documentation
import ReactMarkdown from "react-markdown";
import MarkdownNavbar from "react-markdown-navbar";
// The default style of markdown-navbar should be imported additionally
import "react-markdown-navbar/dist/style.css";

const article = `# Markdown-Navbar Demo

## Chicken Chicken

Chicken Chicken Chicken Chicken Chicken.

* Chicken Chicken Chicken Chicken Chicken.
* Chicken Chicken Chicken Chicken Chicken.
* Chicken Chicken Chicken Chicken Chicken.

### Chicken Chicken Chicken

Chicken Chicken Chicken Chicken Chicken.

#### Chicken Chicken Chicken Chicken

Chicken Chicken Chicken Chicken Chicken Chicken.`;

function App() {
  return (
    <div className="App">
      <div className="article">
        <ReactMarkdown source={article} />
      </div>
      <div className="navigation">
        <MarkdownNavbar source={article} />
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```

## Tips

- The component only parses article headings at level 2 and below. The article title, which is usually used once in an article, will not appear in the navigation bar.
- The component needs to be used in **conjunction** with your article content. When using this component, you must ensure that your article under the same page content.
- Please confirm that every heading of your markdown document is different by each other when the value of property `declarative` is setted as `true`.

## Props

|     Property     | Data Type |           Default Value           |                                               Description                                                |
| :--------------: | :-------: | :-------------------------------: | :------------------------------------------------------------------------------------------------------: |
|    className     |  string   |                ""                 |                       The className that defines the outermost container of navbar                       |
|      source      |  string   |                ""                 |                                          Markdown text content                                           |
| headingTopOffset |  number   |                 0                 |               Anchor displacement relative to the top of the window (for the anchor jump)                |
|  updateHashAuto  |  boolean  |               false               |            Automatically update the hash value of browser address when page scrolling if true            |
|     hashMode     |  boolean  |               false               | enable this attr to support the hash value of browser detection when SPA do not use the hash mode routes |
|   declarative    |  boolean  |               false               |         Use the text of the title from Markdown content as the hash value for the anchor if true         |
|    container     |   node    |              window               |           the container of scroll bar,use the dom of ref instance(ref.current or callback ref)           |
|     ordered      |  boolean  |               true                |                   Whether the title contains a numerical prefix, such as: `1. 2. 2.2`                    |
|     behavior     |  string   |              "auto"               |                                       the behavior of scroll event                                       |
|  onNavItemClick  | function  | (event, element, hashValue) => {} |                          The event callback function after clicking navbar item                          |
|   onHashChange   | function  |     (newHash, oldHash) => {}      |              The event callback function before the hash value of browser address changing               |

## License

[MIT license](./LICENSE)
