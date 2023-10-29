const { scrapeHtmlWeb } = require("../lib/cjs/index");

const options = {
  url: "https://nodejs.org/en/blog/",
  proxy: "https://api.allorigins.win/get?url=", // example open source proxy for bypass cors error
  mainSelector: ".blog-index",
  childrenSelector: [
    { key: "date", selector: "time", type: "text" },
    { key: "version", selector: "a", type: "text" },
    { key: "link", selector: "a", attr: "href" },
  ],
};

(async () => {
  const data = await scrapeHtmlWeb(options);
  console.log("data", data);
})();
