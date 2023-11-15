const { scrapeHtmlWeb } = require("../lib/cjs/index");

const options = {
  url: "https://nodejs.org/en/blog/",
  // bypassCors: {
  //   customURI: "https://api.allorigins.win/get?url=",
  //   paramExstract: "contents", //Facoltativo parametro di estrazione per un eventuale JSON che ritorna dall'API di cors
  // }, // bypass cors error in ESM
  bypassCors: true,
  mainSelector: ".blog-index",
  list: false,
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
