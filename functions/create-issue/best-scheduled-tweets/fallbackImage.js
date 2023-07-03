import axios from 'axios'

export function createFallbackImageClient (unsplashAccessKey) {
  return {
    async getImageUrl () {
      const response = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          query: 'tech'
        },
        headers: {
          Authorization: `Client-ID ${unsplashAccessKey}`
        }
      })
      return response.data.urls.small
    }
  }
}
