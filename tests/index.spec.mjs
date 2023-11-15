import "mocha";
import { assert } from "chai";

import { scrapeHtmlWeb } from "../lib/esm/index.mjs";

describe("scrapeHtmlWeb Function MJS", () => {
  it("should be a function", () => {
    assert.isFunction(scrapeHtmlWeb);
  });

  it("should return valid data when scraping", async () => {
    const options = {
      url: "https://nodejs.org/en/blog/",
      mainSelector: ".blog-index",
      childrenSelector: [
        { key: "date", selector: "time", type: "text" },
        { key: "version", selector: "a", type: "text" },
        { key: "link", selector: "a", attr: "href" },
      ],
    };

    const data = await scrapeHtmlWeb(options);
    assert.deepStrictEqual(typeof data, "object");
  });

  it("should handle errors gracefully", async () => {
    const options = {
      url: "invalidurl", // an invalid URL to test error handling
      mainSelector: ".blog-index",
      childrenSelector: [
        { key: "date", selector: "time", type: "text" },
        { key: "version", selector: "a", type: "text" },
        { key: "link", selector: "a", attr: "href" },
      ],
    };

    let error;

    try {
      await scrapeHtmlWeb(options);
    } catch (err) {
      error = "An error occurred during the scraping process!";
    }

    assert.deepStrictEqual(
      error,
      "An error occurred during the scraping process!"
    );
  });
});
