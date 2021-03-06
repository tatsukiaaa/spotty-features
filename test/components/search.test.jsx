import fetchMock from 'fetch-mock'
import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'

import Config from '../../src/public/config'
import Search from '../../src/components/search.jsx'

import ArtistSearchResponse from '../fixtures/spotify/artist-search'
import AudioFeaturesResponse from '../fixtures/spotify/audio-features'
import TrackSearchResponse from '../fixtures/spotify/track-search'

import waitForRequests from '../helpers/wait-for-requests'

const track = TrackSearchResponse.tracks.items[0]
const trackSeed = {
  id: track.id,
  name: track.name,
  url: track.external_urls.spotify,
  artists: track.artists.map(artist => artist.name),
  album: track.album.name,
  image: track.album.images[2].url,
  albumUrl: track.album.external_urls.spotify
}

const artist = ArtistSearchResponse.artists.items[0]
const artistSeed = {
  id: artist.id,
  name: artist.name,
  url: artist.external_urls.spotify,
  image: artist.images[3].url
}

function props(opts) {
  return {
    token: '123abc',
    unauthorized: opts.unauthorized,
    recommendationsFormShown: opts.recommendationsFormShown,
    recommendationsFormHidden: opts.recommendationsFormHidden
  }
}

describe('Search', () => {
  let component = null
  let wasUnauthorized = false
  let wasRecommendationsFormShown = null
  let featureReq = null

  const unauthorized = () => {
    wasUnauthorized = true
  }

  const recommendationsFormShown = () => {
    wasRecommendationsFormShown = true
  }

  const recommendationsFormHidden = () => {
    wasRecommendationsFormShown = false
  }

  beforeEach(() => {
    const path = `audio-features/${trackSeed.id}`
    featureReq = fetchMock.get(`${Config.spotify.apiUrl}/${path}`,
                               AudioFeaturesResponse)

    const opts = {
      unauthorized, recommendationsFormShown, recommendationsFormHidden
    }
    component = <Search {...props(opts)} />
  })

  afterEach(() => {
    fetchMock.restore()
    wasRecommendationsFormShown = null
    wasUnauthorized = false
  })

  test('matches snapshot', () => {
    const tree = renderer.create(component).toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('renders seed search form', () => {
    const container = shallow(component).find('div')
    expect(container.children().name()).toBe('SeedSearchForm')
  })

  test('handles expired token on audio features search', () => {
    console.error = () => {}
    expect(wasUnauthorized).toBe(false)

    const error = { response: { status: 401 } }
    shallow(component).instance().onAudioFeaturesError(error)

    expect(wasUnauthorized).toBe(true)
  })

  test('recommendations form shown when seed track chosen', done => {
    shallow(component).instance().chooseSeed(trackSeed)

    waitForRequests([featureReq], done, done.fail, () => {
      expect(wasRecommendationsFormShown).toBe(true)
    })
  })

  test('recommendations form shown when seed artist chosen', () => {
    const instance = shallow(component).instance()
    instance.onSeedTypeChange('artist')
    instance.chooseSeed(artistSeed)

    expect(wasRecommendationsFormShown).toBe(true)
  })

  test('returns track seed summary for given track', done => {
    const instance = shallow(component).instance()
    instance.chooseSeed(trackSeed)

    waitForRequests([featureReq], done, done.fail, () => {
      const type = instance.seedSummary().type.toString()
      expect(type).toMatch(/TrackSeedSummary/)
    })
  })

  test('returns artist seed summary for given artist', () => {
    const instance = shallow(component).instance()
    instance.onSeedTypeChange('artist')
    instance.chooseSeed(artistSeed)

    const type = instance.seedSummary().type.toString()
    expect(type).toMatch(/ArtistSeedSummary/)
  })
})
