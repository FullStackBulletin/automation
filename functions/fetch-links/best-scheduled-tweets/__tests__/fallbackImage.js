import { afterAll, afterEach, beforeAll, expect, test } from 'vitest'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { createFallbackImageClient } from '../fallbackImage.js'

const mockResponse = {
  id: 'bN5XdU-bap4',
  slug: 'bN5XdU-bap4',
  created_at: '2018-01-27T18:23:54Z',
  updated_at: '2023-06-30T12:02:53Z',
  promoted_at: null,
  width: 6016,
  height: 4016,
  color: '#595959',
  blur_hash: 'L6BXAeIDhi_MDi-:O9?bL%og^+%g',
  description: 'Close up technologies',
  alt_description: 'tilt-shift photography of green computer motherboard',
  urls: {
    raw: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixid=M3w0NjYzNjZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODgyMDM0OTR8&ixlib=rb-4.0.3',
    full: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w0NjYzNjZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODgyMDM0OTR8&ixlib=rb-4.0.3&q=85',
    regular: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NjYzNjZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODgyMDM0OTR8&ixlib=rb-4.0.3&q=80&w=1080',
    small: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NjYzNjZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODgyMDM0OTR8&ixlib=rb-4.0.3&q=80&w=400',
    thumb: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NjYzNjZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODgyMDM0OTR8&ixlib=rb-4.0.3&q=80&w=200',
    small_s3: 'https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1517077304055-6e89abbf09b0'
  },
  links: {
    self: 'https://api.unsplash.com/photos/bN5XdU-bap4',
    html: 'https://unsplash.com/photos/bN5XdU-bap4',
    download: 'https://unsplash.com/photos/bN5XdU-bap4/download?ixid=M3w0NjYzNjZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODgyMDM0OTR8',
    download_location: 'https://api.unsplash.com/photos/bN5XdU-bap4/download?ixid=M3w0NjYzNjZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODgyMDM0OTR8'
  },
  likes: 403,
  liked_by_user: false,
  current_user_collections: [

  ],
  sponsorship: null,
  topic_submissions: {

  },
  user: {
    id: 'HhNMEcL0uMA',
    updated_at: '2023-06-29T23:54:45Z',
    username: 'cdr6934',
    name: 'Chris Ried',
    first_name: 'Chris',
    last_name: 'Ried',
    twitter_username: 'generatecoll',
    portfolio_url: 'http://www.generativecollective.com',
    bio: 'Technology follows me. Loves adventure through travel and capture its beauty through visual stimulations. ',
    location: 'Nashville, TN',
    links: {
      self: 'https://api.unsplash.com/users/cdr6934',
      html: 'https://unsplash.com/@cdr6934',
      photos: 'https://api.unsplash.com/users/cdr6934/photos',
      likes: 'https://api.unsplash.com/users/cdr6934/likes',
      portfolio: 'https://api.unsplash.com/users/cdr6934/portfolio',
      following: 'https://api.unsplash.com/users/cdr6934/following',
      followers: 'https://api.unsplash.com/users/cdr6934/followers'
    },
    profile_image: {
      small: 'https://images.unsplash.com/profile-fb-1493876076-6b7575293525.jpg?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32',
      medium: 'https://images.unsplash.com/profile-fb-1493876076-6b7575293525.jpg?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64',
      large: 'https://images.unsplash.com/profile-fb-1493876076-6b7575293525.jpg?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128'
    },
    instagram_username: 'generate.collective',
    total_collections: 24,
    total_likes: 115,
    total_photos: 51,
    accepted_tos: true,
    for_hire: false,
    social: {
      instagram_username: 'generate.collective',
      portfolio_url: 'http://www.generativecollective.com',
      twitter_username: 'generatecoll',
      paypal_email: null
    }
  },
  exif: {
    make: 'NIKON CORPORATION',
    model: 'NIKON D610',
    name: 'NIKON CORPORATION, NIKON D610',
    exposure_time: '1/125',
    aperture: '6.3',
    focal_length: '90.0',
    iso: 3200
  },
  location: {
    name: null,
    city: null,
    country: null,
    position: {
      latitude: null,
      longitude: null
    }
  },
  meta: {
    index: true
  },
  public_domain: false,
  tags: [
    {
      type: 'search',
      title: 'tech'
    },
    {
      type: 'search',
      title: 'technology'
    },
    {
      type: 'search',
      title: 'electronics'
    },
    {
      type: 'search',
      title: 'circuit board'
    },
    {
      type: 'landing_page',
      title: 'grey',
      source: {
        ancestry: {
          type: {
            slug: 'wallpapers',
            pretty_slug: 'HD Wallpapers'
          },
          category: {
            slug: 'colors',
            pretty_slug: 'Color'
          },
          subcategory: {
            slug: 'grey',
            pretty_slug: 'Grey'
          }
        },
        title: 'Hd grey wallpapers',
        subtitle: 'Download free grey wallpapers',
        description: 'Choose from a curated selection of grey wallpapers for your mobile and desktop screens. Always free on Unsplash.',
        meta_title: 'Grey Wallpapers: Free HD Download [500+ HQ] | Unsplash',
        meta_description: 'Choose from hundreds of free grey wallpapers. Download HD wallpapers for free on Unsplash.',
        cover_photo: {
          id: 'ctXf1GVyf9A',
          slug: 'ctXf1GVyf9A',
          created_at: '2018-09-10T08:05:55Z',
          updated_at: '2023-06-26T18:04:53Z',
          promoted_at: null,
          width: 5304,
          height: 7952,
          color: '#a6a6a6',
          blur_hash: 'L3IYFNIU00~q-;M{R*t80KtRIUM{',
          description: 'Old stone background texture',
          alt_description: 'a close up of a gray concrete surface',
          urls: {
            raw: 'https://images.unsplash.com/photo-1536566482680-fca31930a0bd?ixlib=rb-4.0.3',
            full: 'https://images.unsplash.com/photo-1536566482680-fca31930a0bd?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb',
            regular: 'https://images.unsplash.com/photo-1536566482680-fca31930a0bd?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
            small: 'https://images.unsplash.com/photo-1536566482680-fca31930a0bd?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max',
            thumb: 'https://images.unsplash.com/photo-1536566482680-fca31930a0bd?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max',
            small_s3: 'https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1536566482680-fca31930a0bd'
          },
          links: {
            self: 'https://api.unsplash.com/photos/ctXf1GVyf9A',
            html: 'https://unsplash.com/photos/ctXf1GVyf9A',
            download: 'https://unsplash.com/photos/ctXf1GVyf9A/download',
            download_location: 'https://api.unsplash.com/photos/ctXf1GVyf9A/download'
          },
          likes: 1939,
          liked_by_user: false,
          current_user_collections: [

          ],
          sponsorship: null,
          topic_submissions: {
            'textures-patterns': {
              status: 'approved',
              approved_on: '2020-04-06T14:20:11Z'
            }
          },
          premium: false,
          plus: false,
          user: {
            id: 'IFcEhJqem0Q',
            updated_at: '2023-06-26T17:57:21Z',
            username: 'anniespratt',
            name: 'Annie Spratt',
            first_name: 'Annie',
            last_name: 'Spratt',
            twitter_username: 'anniespratt',
            portfolio_url: 'https://www.anniespratt.com',
            bio: 'Photographer from England, sharing my digital, film + vintage slide scans.  \r\n',
            location: 'New Forest National Park, UK',
            links: {
              self: 'https://api.unsplash.com/users/anniespratt',
              html: 'https://unsplash.com/@anniespratt',
              photos: 'https://api.unsplash.com/users/anniespratt/photos',
              likes: 'https://api.unsplash.com/users/anniespratt/likes',
              portfolio: 'https://api.unsplash.com/users/anniespratt/portfolio',
              following: 'https://api.unsplash.com/users/anniespratt/following',
              followers: 'https://api.unsplash.com/users/anniespratt/followers'
            },
            profile_image: {
              small: 'https://images.unsplash.com/profile-1648828806223-1852f704c58aimage?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32',
              medium: 'https://images.unsplash.com/profile-1648828806223-1852f704c58aimage?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64',
              large: 'https://images.unsplash.com/profile-1648828806223-1852f704c58aimage?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128'
            },
            instagram_username: 'anniespratt',
            total_collections: 117,
            total_likes: 14450,
            total_photos: 18587,
            accepted_tos: true,
            for_hire: false,
            social: {
              instagram_username: 'anniespratt',
              portfolio_url: 'https://www.anniespratt.com',
              twitter_username: 'anniespratt',
              paypal_email: null
            }
          }
        }
      }
    },
    {
      type: 'search',
      title: 'miniature'
    },
    {
      type: 'search',
      title: 'DIY'
    },
    {
      type: 'search',
      title: 'web'
    },
    {
      type: 'search',
      title: 'electricity'
    },
    {
      type: 'search',
      title: 'board'
    },
    {
      type: 'search',
      title: 'connected'
    },
    {
      type: 'search',
      title: 'chip'
    },
    {
      type: 'search',
      title: 'microchip'
    },
    {
      type: 'search',
      title: 'computer chip'
    },
    {
      type: 'search',
      title: 'soldering'
    },
    {
      type: 'search',
      title: 'infrastructure'
    },
    {
      type: 'search',
      title: 'electronic chip'
    },
    {
      type: 'search',
      title: 'cpu'
    },
    {
      type: 'search',
      title: 'computer hardware'
    },
    {
      type: 'search',
      title: 'hardware'
    }
  ],
  tags_preview: [
    {
      type: 'search',
      title: 'tech'
    },
    {
      type: 'search',
      title: 'technology'
    },
    {
      type: 'search',
      title: 'electronics'
    }
  ],
  views: 11040603,
  downloads: 84031,
  topics: [

  ]
}

export const restHandlers = [
  rest.get('https://api.unsplash.com/photos/random?query=tech', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
]

const server = setupServer(...restHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())

test('It returns the URL of the small version of the random image', async () => {
  const fallbackImageClient = createFallbackImageClient('someUnsplashAccessKey')
  const url = await fallbackImageClient.getImageUrl('tech')
  expect(url).toBe('https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NjYzNjZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODgyMDM0OTR8&ixlib=rb-4.0.3&q=80&w=400')
})
