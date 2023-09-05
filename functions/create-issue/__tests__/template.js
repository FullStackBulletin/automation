import { test, expect } from 'vitest'
import url from 'url'
import path from 'path'
import { renderIntro, renderTemplate } from '../template.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

test('it should render the template', async () => {
  const data = {
    issueNumber: 336,
    quote: {
      id: 149,
      text: 'All programming languages are shit. But the good ones fertilize your mind',
      author: 'Reginald Braithwaite',
      authorDescription: 'Software Developer',
      authorUrl: null
    },
    book: {
      id: '0692232699',
      title: "Build APIs You Won't Hate: Everyone and their dog wants an API, so you should probably learn how to build them",
      author: 'Phil Sturgeon',
      links: {
        usa: 'https://www.amazon.com/dp/0692232699/?tag=fullstackbulletin-20',
        uk: 'https://www.amazon.co.uk/dp/0692232699/?tag=fullstackbulletin-21'
      },
      coverPicture: 'https://images-na.ssl-images-amazon.com/images/I/41A-D5UDB%2BL.jpg',
      description: 'API development is becoming increasingly common for server-side developers thanks to the rise of front-end JavaScript frameworks, iPhone applications, and API-centric architectures. It might seem like grabbing stuff from a data source and shoving it out as JSON would be easy, but surviving changes in business logic, database schema updates, new features, or deprecated endpoints can be a nightmare. After finding many of the existing resources for API development to be lacking, Phil learned a lot of things the hard way through years of trial and error. This book aims to condense that experience, taking examples and explanations further than the trivial apples and pears nonsense tutorials often provide. By passing on some best practices and general good advice you can hit the ground running with API development, combined with some horror stories and how they were overcome/avoided/averted.'
    },
    links: [
      {
        title: 'The complexity of writing an efficient NodeJS Docker image - Specfy',
        url: 'https://specfy.io/blog/1-efficient-dockerfile-nodejs-in-7-steps',
        description: 'A step by step guide to build fast and lightweight NodeJS docker images.',
        image: 'http://res.cloudinary.com/loige/image/upload/c_fit,g_center,h_240,q_80,w_500/v1/fsb/ec026763a5ce4a19a0dde651a349f65b.jpg',
        score: 145,
        originalImage: 'https://specfy.io/posts/1/building-efficient-dockerfile-nodejs.png',
        campaignUrls: {
          title: 'https://specfy.io/blog/1-efficient-dockerfile-nodejs-in-7-steps?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=title',
          image: 'https://specfy.io/blog/1-efficient-dockerfile-nodejs-in-7-steps?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=image',
          description: 'https://specfy.io/blog/1-efficient-dockerfile-nodejs-in-7-steps?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=description'
        }
      },
      {
        title: 'Astro 3.0 | Astro',
        url: 'https://astro.build/blog/astro-3',
        description: '30% faster and more powerful than ever, Astro 3.0 is here! Includes new features and enhancements around View Transitions, Image Optimization, Fast Refresh JSX and more.',
        image: 'http://res.cloudinary.com/loige/image/upload/c_fit,g_center,h_240,q_80,w_500/v1/fsb/bf854c6f46a6aaa9c62ebf24e10f7160.jpg',
        score: 126,
        originalImage: 'https://astro.build/_astro/blog-social.835ac2da.webp',
        campaignUrls: {
          title: 'https://astro.build/blog/astro-3?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=title',
          image: 'https://astro.build/blog/astro-3?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=image',
          description: 'https://astro.build/blog/astro-3?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=description'
        }
      },
      {
        title: 'Dark Mode: How Users Think About It and Issues to Avoid',
        url: 'https://nngroup.com/articles/dark-mode-users-issues',
        description: 'Dark mode is popular, but not essential. Users like dark mode but maintain similar behaviors without it. They think about it at the system level, not the application level. If you choose to support dark mode, test your design to avoid common dark-mode issues.',
        image: 'http://res.cloudinary.com/loige/image/upload/c_fit,g_center,h_240,q_80,w_500/v1/fsb/1f73152a1dfd8eaad9fd239c69a2e616.jpg',
        score: 81,
        originalImage: 'https://media.nngroup.com/media/articles/opengraph_images/dark-mode-eng.png',
        campaignUrls: {
          title: 'https://nngroup.com/articles/dark-mode-users-issues?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=title',
          image: 'https://nngroup.com/articles/dark-mode-users-issues?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=image',
          description: 'https://nngroup.com/articles/dark-mode-users-issues?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=description'
        }
      },
      {
        title: 'Bézier Curves - and the logic behind them | Richard Ekwonye',
        url: 'https://www.blog.richardekwonye.com/bezier-curves',
        description: 'The logic behind Bézier Curves used in CSS animations and visual elements.',
        image: 'http://res.cloudinary.com/loige/image/upload/c_fit,g_center,h_240,q_80,w_500/v1/fsb/6bc604c9b2d50f8af4d3fb4a47997f91.jpg',
        score: 47,
        originalImage: 'https://www.blog.richardekwonye.com/images/bezier-curves-cover.jpg',
        campaignUrls: {
          title: 'https://www.blog.richardekwonye.com/bezier-curves?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=title',
          image: 'https://www.blog.richardekwonye.com/bezier-curves?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=image',
          description: 'https://www.blog.richardekwonye.com/bezier-curves?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=description'
        }
      },
      {
        title: '8 Reasons Why WhatsApp Was Able to Support 50 Billion Messages a Day With Only 32 Engineers',
        url: 'https://newsletter.systemdesign.one/p/whatsapp-engineering',
        description: '#1: Learn More - Awesome WhatsApp Engineering (6 minutes)',
        image: 'http://res.cloudinary.com/loige/image/upload/c_fit,g_center,h_240,q_80,w_500/v1/fsb/84f520f397e1c95d792aa2caaa3e9262.jpg',
        score: 23,
        originalImage: 'https://substackcdn.com/image/fetch/w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F94e067cc-6ade-44bf-9818-5dc20a260541_1280x720.png',
        campaignUrls: {
          title: 'https://newsletter.systemdesign.one/p/whatsapp-engineering?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=title',
          image: 'https://newsletter.systemdesign.one/p/whatsapp-engineering?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=image',
          description: 'https://newsletter.systemdesign.one/p/whatsapp-engineering?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=description'
        }
      },
      {
        title: 'Creating custom easing effects in CSS animations using the linear() function | MDN Blog',
        url: 'https://developer.mozilla.org/en-US/blog/custom-easing-in-css-with-linear',
        description: 'The new CSS linear() timing function enables custom easing in animations. Explore how linear() works compared with other timing functions used for easing, with practical examples.',
        image: 'http://res.cloudinary.com/loige/image/upload/c_fit,g_center,h_240,q_80,w_500/v1/fsb/597f65d0dd87620e86925c5014639fa7.jpg',
        score: 18,
        originalImage: 'https://developer.mozilla.org/en-US/blog/custom-easing-in-css-with-linear/linear-easing-featured.png',
        campaignUrls: {
          title: 'https://developer.mozilla.org/en-US/blog/custom-easing-in-css-with-linear?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=title',
          image: 'https://developer.mozilla.org/en-US/blog/custom-easing-in-css-with-linear?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=image',
          description: 'https://developer.mozilla.org/en-US/blog/custom-easing-in-css-with-linear?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=description'
        }
      },
      {
        title: 'Falling For Oklch: A Love Story Of Color Spaces, Gamuts, And CSS — Smashing Magazine',
        url: 'https://smashingmagazine.com/2023/08/oklch-color-spaces-gamuts-css',
        description: 'The CSS Color Module Level 4 specification defined a slew of new color features when it became a candidate recommendation in 2022, including Oklab and Oklch, which have widened the field of color we have to work with. Explore the Oklch color space and how to start using it in CSS today.',
        image: 'http://res.cloudinary.com/loige/image/upload/c_fit,g_center,h_240,q_80,w_500/v1/fsb/0f278f43caa7520973407b005ef35581.jpg',
        score: 16,
        originalImage: 'https://files.smashing.media/articles/oklch-color-spaces-gamuts-css/oklch-color-spaces-gamuts-css.jpg',
        campaignUrls: {
          title: 'https://smashingmagazine.com/2023/08/oklch-color-spaces-gamuts-css?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=title',
          image: 'https://smashingmagazine.com/2023/08/oklch-color-spaces-gamuts-css?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=image',
          description: 'https://smashingmagazine.com/2023/08/oklch-color-spaces-gamuts-css?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=description'
        }
      }
    ],
    extraContent: [
      {
        title: 'CSS Selectors: A Visual Guide & Reference',
        url: 'https://fffuel.co',
        description: 'Visual guide to CSS selectors, including pseudo-classes (:nth-child, :hover,...), functional pseudo-classes (:not, :is,...) and pseudo-elements.',
        image: 'http://res.cloudinary.com/loige/image/upload/c_fit,g_center,h_240,q_80,w_500/v1/fsb/8562eaf1c0470e0ce5a4557cd11af763.jpg',
        score: 83,
        originalImage: 'https://fffuel.co/images/covers/css-selectors.png',
        campaignUrls: {
          title: 'https://fffuel.co/?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=title',
          image: 'https://fffuel.co/?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=image',
          description: 'https://fffuel.co/?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=description'
        }
      },
      {
        title: '8 Reasons Why WhatsApp Was Able to Support 50 Billion Messages a Day With Only 32 Engineers',
        url: 'https://newsletter.systemdesign.one/p/whatsapp-engineering',
        description: '#1: Learn More - Awesome WhatsApp Engineering (6 minutes)',
        image: 'http://res.cloudinary.com/loige/image/upload/c_fit,g_center,h_240,q_80,w_500/v1/fsb/84f520f397e1c95d792aa2caaa3e9262.jpg',
        score: 30,
        originalImage: 'https://substackcdn.com/image/fetch/w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F94e067cc-6ade-44bf-9818-5dc20a260541_1280x720.png',
        campaignUrls: {
          title: 'https://newsletter.systemdesign.one/p/whatsapp-engineering?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=title',
          image: 'https://newsletter.systemdesign.one/p/whatsapp-engineering?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=image',
          description: 'https://newsletter.systemdesign.one/p/whatsapp-engineering?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=description'
        }
      },
      {
        title: "Email Authentication: A Developer's Guide · Resend",
        url: 'https://resend.com/blog/email-authentication-a-developers-guide',
        description: 'Learn the importance of SPF, DKIM, DMARC, and BIMI in ensuring email delivery.',
        image: 'http://res.cloudinary.com/loige/image/upload/c_fit,g_center,h_240,q_80,w_500/v1/fsb/eb37d2b287bdef4e054206cee69f61a1.jpg',
        score: 1,
        originalImage: 'https://resend.com/static/posts/email-authentication.jpg',
        campaignUrls: {
          title: 'https://resend.com/blog/email-authentication-a-developers-guide?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=title',
          image: 'https://resend.com/blog/email-authentication-a-developers-guide?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=image',
          description: 'https://resend.com/blog/email-authentication-a-developers-guide?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-35-2023&utm_content=description'
        }
      }
    ]
  }

  const result = await renderTemplate(data)
  expect(result).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', 'template.html'))
})

test('it should render the intro', async () => {
  const result = await renderIntro(1000)
  expect(result).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', 'intro.html'))
})
