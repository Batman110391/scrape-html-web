import axios from "axios";
import cheerio from "cheerio";

type ChildSelector = {
  key: string;
  selector: string;
  type?: string;
  attr?: string;
  canBeEmpty?: boolean;
  replace?: RegExp | ((text: string) => string);
};

type Options = {
  url: string;
  mainSelector: string;
  childrenSelector: ChildSelector[];
  proxy?: string;
  list?: boolean;
};

export async function scrapeHtmlWeb(options: Options) {
  let result: any[] = [];

  const { url, mainSelector, childrenSelector, list, proxy } = options || {};

  const proxyURI = proxy ? proxy : "";

  await axios(`${proxyURI}${encodeURIComponent(url)}`)
    .then((response) => {
      const html_data = response.data.contents;

      const $ = cheerio.load(html_data);

      $(mainSelector)
        .children()
        .each((_, parentElem) => {
          let obj: any = {};

          childrenSelector.forEach((el) => {
            const { key, selector, attr, type, canBeEmpty, replace } = el;

            const value = $(parentElem).find(selector).length
              ? $(parentElem).find(selector)
              : $(parentElem);

            if (!attr && !type) {
              let text = value.text().trim();

              if (replace) {
                if (replace instanceof RegExp) {
                  text = text.replace(replace, "");
                } else if (typeof replace === "function") {
                  text = replace(text);
                }
              }

              obj = { ...obj, [key]: text };
            }

            if (attr && attr !== "") {
              if (value.attr(attr) || canBeEmpty) {
                obj = { ...obj, [key]: value.attr(attr) };
              }
            } else if (type === "text") {
              if (value.text().trim() || canBeEmpty) {
                let text = value.text().trim();

                if (replace) {
                  if (replace instanceof RegExp) {
                    text = text.replace(replace, "");
                  } else if (typeof replace === "function") {
                    text = replace(text);
                  }
                }

                obj = { ...obj, [key]: text };
              }
            } else if (type === "html") {
              if (value.prop("outerHTML") || canBeEmpty) {
                let html = value.prop("outerHTML");

                if (replace) {
                  if (replace instanceof RegExp) {
                    if (html) {
                      html = html.replace(replace, "");
                    }
                  } else if (typeof replace === "function") {
                    if (html) {
                      html = replace(html);
                    }
                  }
                }

                obj = { ...obj, [key]: html };
              }
            }
          });

          if (Object.keys(obj).length) {
            result.push(obj);
          }

          if (list === false) {
            return false;
          }
        });
    })
    .catch((err) => {
      throw new Error(err);
    });

  return result;
}

export default {
  scrapeHtmlWeb,
};
