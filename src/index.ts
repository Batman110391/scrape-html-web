import * as cheerio from "cheerio";
import axios from "axios";

type ChildSelector = {
  key: string;
  selector: string;
  type?: string;
  attr?: string;
  canBeEmpty?: boolean;
  replace?: RegExp | ((text: string) => string);
};

type ByPassCors = {
  customURI?: string;
  paramExstract?: string;
};

type Options = {
  url: string;
  mainSelector: string;
  childrenSelector: ChildSelector[];
  bypassCors?: boolean | ByPassCors;
  list?: boolean;
};

function buildDefineURI(
  url: string,
  bypassCors?: boolean | ByPassCors
): string {
  if (bypassCors) {
    if (typeof bypassCors === "boolean") {
      return bypassCors
        ? `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
        : url;
    } else {
      const { customURI } = bypassCors;
      return customURI
        ? `${customURI}${encodeURIComponent(url)}`
        : `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    }
  } else {
    return url;
  }
}

function buildbodyHTML(
  response: { data: any },
  bypassCors?: boolean | ByPassCors
): string {
  if (bypassCors) {
    if (typeof bypassCors === "boolean") {
      return response.data.contents;
    } else {
      const { paramExstract } = bypassCors;

      return paramExstract ? response.data[paramExstract] : response.data;
    }
  } else {
    return response.data;
  }
}

export async function scrapeHtmlWeb(options: Options) {
  let result: any[] = [];

  const { url, mainSelector, childrenSelector, list, bypassCors } =
    options || {};

  const defineURI = buildDefineURI(url, bypassCors);

  try {
    // Use axios for HTTP requests
    const response = await axios.get(defineURI);

    const bodyHTML = buildbodyHTML(response, bypassCors);

    const $ = cheerio.load(bodyHTML);

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

        if (!list) {
          return false;
        }
      });
  } catch (err) {
    console.error("Error during request:", err);
    throw err;
  }

  return result;
}

export default {
  scrapeHtmlWeb,
};
