import url from 'url'
import path from 'path'
import nunjucks from 'nunjucks'
import { minify } from 'html-minifier-terser'
import { getLinkLabelBasedOnUrl } from './getLinkLabelBasedOnUrl.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(path.join(__dirname, 'templates')),
  {
    autoescape: true
  }
)
env.addFilter('getLinkLabelBasedOnUrl', getLinkLabelBasedOnUrl)

const minifySettings = {
  collapseWhitespace: true,
  keepClosingSlash: true,
  minifyCSS: false
}

/**
   * Renders the email template for mailchimp
   * @param {Object} data
   * @param {number} data.issueNumber
   * @param {Object} data.quote
   * @param {number} data.quote.id
   * @param {string} data.quote.text
   * @param {string} data.quote.author
   * @param {string} data.quote.authorDescription
   * @param {string} [data.quote.authorUrl]
   * @param {Object} data.book
   * @param {string} data.book.id
   * @param {string} data.book.title
   * @param {string} data.book.author
   * @param {Object} data.book.links
   * @param {string} data.book.links.usa
   * @param {string} data.book.links.uk
   * @param {string} data.book.coverPicture
   * @param {string} data.book.description
   * @param {Object[]} data.links
   * @param {string} data.links[].title
   * @param {string} data.links[].url
   * @param {string} data.links[].description
   * @param {string} data.links[].image
   * @param {number} data.links[].score
   * @param {string} data.links[].originalImage
   * @param {Object} data.links[].campaignUrls
   * @param {string} data.links[].campaignUrls.title
   * @param {string} data.links[].campaignUrls.image
   * @param {string} data.links[].campaignUrls.description
   * @returns string
   */
export function renderTemplate (data) {
  return minify(
    env.render('newsletter.njk', data),
    minifySettings
  )
}

/**
 * @param {number} issueNumber
 * @returns string
 */
export function renderIntro (issueNumber) {
  return minify(
    env.render('intro.njk', { issueNumber }),
    minifySettings
  )
}

/**
 * @param {Object} quote
 * @param {number} quote.id
 * @param {string} quote.text
 * @param {string} quote.author
 * @param {string} quote.authorDescription
 * @param {string} [quote.authorUrl]
 */
export function renderQuote (quote) {
  return minify(
    env.render('quote.njk', { quote }),
    minifySettings
  )
}

export function renderLinkPrimaryImage (link) {
  return minify(
    env.render('link_primary_image.njk', { link }),
    minifySettings
  )
}

export function renderLinkContent (link) {
  return minify(
    env.render('link_content.njk', { link }),
    minifySettings
  )
}

export function renderBookTitle (book) {
  return minify(
    env.render('book_title.njk', { book }),
    minifySettings
  )
}

export function renderBookImage (book) {
  return minify(
    env.render('book_image.njk', { book }),
    minifySettings
  )
}

export function renderBookContent (book) {
  return minify(
    env.render('book_content.njk', { book }),
    minifySettings
  )
}

export function renderBookBuyLink (link, label) {
  return minify(
    env.render('book_buy_link.njk', { link, label }),
    minifySettings
  )
}

export function renderExtraContent (extraContentTitle, extraContent) {
  return minify(
    env.render('extra_content.njk', { extraContentTitle, extraContent }),
    minifySettings
  )
}
