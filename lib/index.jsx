import PropTypes from "prop-types";
import React, { Component } from "react";
import styles from "./index.module.css";

function throttle(fn, wait) {
  let callback = fn;
  let timerId = null;

  // 是否是第一次执行
  let firstInvoke = true;

  function throttled() {
    let context = this;
    let args = arguments;

    // 如果是第一次触发，直接执行
    if (firstInvoke) {
      callback.apply(context, args);
      firstInvoke = false;
      return;
    }

    // 如果定时器已存在，直接返回。
    if (timerId) {
      return;
    }

    timerId = setTimeout(function () {
      // 注意这里 将 clearTimeout 放到 内部来执行了
      clearTimeout(timerId);
      timerId = null;

      callback.apply(context, args);
    }, wait);
  }

  // 返回一个闭包
  return throttled;
}

class MarkdownNavbar extends Component {
  static propTypes = {
    source: PropTypes.string.isRequired,
    ordered: PropTypes.bool,
    headingTopOffset: PropTypes.number,
    updateHashAuto: PropTypes.bool,
    hashMode: PropTypes.bool.isRequired,
    declarative: PropTypes.bool,
    className: PropTypes.string,
    container: PropTypes.node,
    behavior: PropTypes.string,
    onNavItemClick: PropTypes.func,
    onHashChange: PropTypes.func,
  };

  static defaultProps = {
    source: "",
    ordered: true,
    headingTopOffset: 0,
    updateHashAuto: false,
    hashMode: false,
    declarative: false,
    className: "",
    container: window,
    behavior: "auto",
    onNavItemClick: () => {},
    onHashChange: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      currentListNo: "",
      navStructure: [],
    };
  }

  componentDidMount() {
    // 初始化列表数据
    const { source } = this.props;
    this.refreshNav(source);
  }

  UNSAFE_componentDidUpdate(nextProps) {
    // 复用时开启，用于在source更新时刷新列表
    if (nextProps.source !== this.props.source) {
      this.refreshNav(nextProps.source);
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.source !== this.props.source) {
      if (this.scrollEventLockTimer) {
        clearTimeout(this.scrollEventLockTimer);
      }
      this.scrollEventLock = true;

      this.safeScrollTo(this.props.container, 0);
      this.setState({
        currentListNo: "",
      });
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      Array.prototype.slice.apply(headings).forEach((h) => {
        h.dataset.id = "";
      });

      this.scrollEventLockTimer = setTimeout(() => {
        this.initHeadingsId();
        this.scrollEventLock = false;
      }, 500);
    }
    return true;
  }

  componentWillUnmount() {
    if (this.addTargetTimeout) {
      clearTimeout(this.addTargetTimeout);
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    document.removeEventListener("scroll", this.winScroll, true);
    window.removeEventListener("hashchange", this.winHashChange, false);
  }

  trimArrZero(arr) {
    let start;
    let end;
    for (start = 0; start < arr.length; start += 1) {
      if (arr[start]) {
        break;
      }
    }
    for (end = arr.length - 1; end >= 0; end -= 1) {
      if (arr[end]) {
        break;
      }
    }
    return arr.slice(start, end + 1);
  }

  getNavStructure(source) {
    const contentWithoutCode = source
      .replace(/^[^#]+\n/g, "")
      .replace(/(?:[^\n#]+)#+\s([^#\n]+)\n*/g, "") // 匹配行内出现 # 号的情况
      .replace(/^#\s[^#\n]*\n+/, "")
      .replace(/```[^`\n]*\n+[^```]+```\n+/g, "")
      .replace(/`([^`\n]+)`/g, "$1")
      .replace(/\*\*?([^*\n]+)\*\*?/g, "$1")
      .replace(/__?([^_\n]+)__?/g, "$1")
      .trim();

    const pattOfTitle = /#+\s([^#\n]+)\n*/g;
    const matchResult = contentWithoutCode.match(pattOfTitle);

    if (!matchResult) {
      return [];
    }

    const navData = matchResult.map((r, i) => ({
      index: i,
      level: r.match(/^#+/g)[0].length,
      text: r.replace(pattOfTitle, "$1"),
    }));

    let maxLevel = 0;
    navData.forEach((t) => {
      if (t.level > maxLevel) {
        maxLevel = t.level;
      }
    });
    const matchStack = [];
    // 此部分重构，原有方法会出现次级标题后再次出现高级标题时，listNo重复的bug
    for (let i = 0; i < navData.length; i++) {
      const t = navData[i];
      const { level } = t;
      while (
        matchStack.length &&
        matchStack[matchStack.length - 1].level > level
      ) {
        matchStack.pop();
      }
      if (matchStack.length === 0) {
        const arr = new Array(maxLevel).fill(0);
        arr[level - 1] += 1;
        matchStack.push({
          level,
          arr,
        });
        t.listNo = this.trimArrZero(arr).join(".");
      } else {
        const { arr } = matchStack[matchStack.length - 1];
        const newArr = arr.slice();
        newArr[level - 1] += 1;
        matchStack.push({
          level,
          arr: newArr,
        });
        t.listNo = this.trimArrZero(newArr).join(".");
      }
    }
    return navData;
  }

  safeScrollTo(element, top, left = 0) {
    // element only supports dom of ref instance(ref.current or callback ref)

    const { behavior } = this.props;

    element.scrollTo({ behavior, top, left });
  }

  refreshNav(source) {
    if (this.addTargetTimeout) {
      clearTimeout(this.addTargetTimeout);
    }
    this.setState({ navStructure: this.getNavStructure(source) }, () => {
      this.addTargetTimeout = setTimeout(() => {
        this.initHeadingsId();
        if (this.state.navStructure.length) {
          const { listNo } = this.state.navStructure[0];
          this.setState({
            currentListNo: listNo,
          });
        }
        document.addEventListener("scroll", this.winScroll, true);
        window.addEventListener("hashchange", this.winHashChange, false);
      }, 500);
    });
  }

  scrollToTarget(dataId) {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      const target = document.querySelector(`[data-id="${dataId}"]`);
      if (target && typeof target.offsetTop === "number") {
        this.safeScrollTo(
          this.props.container,
          target.offsetTop - this.props.headingTopOffset
        );
      }
    }, 0);
  }

  initHeadingsId() {
    const headingId = decodeURIComponent(
      this.props.declarative
        ? window.location.hash.replace(/^#/, "").trim()
        : (window.location.hash.match(/heading-\d+/g) || [])[0]
    );

    this.state.navStructure.forEach((t) => {
      const headings = document.querySelectorAll(`h${t.level}`);
      const curHeading = Array.prototype.slice
        .apply(headings)
        .find(
          (h) =>
            h.innerText.trim() === t.text.trim() &&
            (!h.dataset || !h.dataset.id)
        );

      if (curHeading) {
        curHeading.dataset.id = this.props.declarative
          ? `${t.listNo}-${t.text}`
          : `heading-${t.index}`;

        if (headingId && headingId === curHeading.dataset.id) {
          this.scrollToTarget(headingId);
          this.setState({
            currentListNo: t.listNo,
          });
        }
      }
    });
  }

  getHeadingList() {
    const headingList = [];
    const { navStructure } = this.state;

    navStructure.forEach((t) => {
      const headings = document.querySelectorAll(`h${t.level}`);
      const curHeading = Array.prototype.slice
        .apply(headings)
        .find(
          (h) =>
            h.innerText.trim() === t.text.trim() &&
            !headingList.find((x) => x.offsetTop === h.offsetTop)
        );
      if (curHeading) {
        headingList.push({
          dataId: this.props.declarative ? t.text : `heading-${t.index}`,
          listNo: t.listNo,
          offsetTop: curHeading.offsetTop,
        });
      }
    });

    return headingList;
  }

  getCurrentHashValue = () =>
    decodeURIComponent(window.location.hash.replace(/^#/, ""));

  winScroll = throttle(() => {
    if (this.scrollEventLock) return;
    const scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      this.props.container.scrollTop ||
      0;
    const newHeadingList = this.getHeadingList().map((h) => ({
      ...h,
      distanceToTop: Math.abs(
        scrollTop + this.props.headingTopOffset - h.offsetTop
      ),
    }));
    const minDistance = Math.min(...newHeadingList.map((h) => h.distanceToTop));
    const curHeading = newHeadingList.find(
      (h) => h.distanceToTop === minDistance
    );

    if (!curHeading) return;

    if (this.props.updateHashAuto && this.props.hashMode) {
      // Hash changing callback
      if (curHeading.dataId !== this.getCurrentHashValue()) {
        this.props.onHashChange(curHeading.dataId, this.getCurrentHashValue());
      }

      this.updateHash(curHeading.dataId);
    }
    this.setState({
      currentListNo: curHeading.listNo,
    });
  }, 300);

  winHashChange = () => {
    this.scrollToTarget(this.state.currentListNo);
  };

  updateHash(value) {
    if (this.updateHashTimeout) {
      clearTimeout(this.updateHashTimeout);
    }

    this.updateHashTimeout = setTimeout(() => {
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${window.location.search}#${value}`
      );
    }, 0);
  }

  render() {
    const { ordered, onHashChange, onNavItemClick, className, declarative } =
      this.props;
    const { currentListNo, navStructure } = this.state;
    const tBlocks = navStructure.map((t) => {
      const cls = `${styles["title-anchor"]} ${
        styles[`title-level${t.level}`]
      }  ${this.state.currentListNo === t.listNo ? styles.active : ""}`;

      return (
        <div
          className={cls}
          onClick={(evt) => {
            const currentHash = declarative
              ? `${t.listNo}-${t.text}` // 加入listNo确保hash唯一ZZ
              : `heading-${t.index}`;

            // Avoid execution the callback `onHashChange` when clicking current nav item
            if (t.listNo !== currentListNo) {
              // Hash changing callback
              onHashChange(currentHash, this.getCurrentHashValue());
            }

            // Nav item clicking callback
            onNavItemClick(evt, evt.target, currentHash);

            if (this.props.hashMode) {
              this.updateHash(currentHash);
            }
            this.scrollToTarget(currentHash);
            this.setState({
              currentListNo: t.listNo,
            });
          }}
          key={`title_anchor_${Math.random().toString(36).substring(2)}`}
        >
          {ordered ? <small>{t.listNo}</small> : null}
          {t.text}
        </div>
      );
    });

    return (
      <div className={`${styles["markdown-navigation"]} ${className}`}>
        {tBlocks}
      </div>
    );
  }
}

export default MarkdownNavbar;
