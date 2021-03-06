import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'

import TrackSearchResponse from '../fixtures/spotify/track-search'

import TrackSeedSummary from '../../src/components/track-seed-summary.jsx'

const track = TrackSearchResponse.tracks.items[0]
const image = track.album.images[2].url

function props() {
  return {
    artists: track.artists.map(a => a.name),
    album: track.album.name,
    image,
    name: track.name
  }
}

describe('TrackSeedSummary', () => {
  let component = null

  beforeEach(() => {
    component = <TrackSeedSummary {...props()} />
  })

  test('matches snapshot', () => {
    const tree = renderer.create(component).toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('lists artists', () => {
    const artists = shallow(component).find('.track-artists')
    expect(artists.text()).toBe('Grimes, Aristophanes')
  })

  test('displays song title', () => {
    const title = shallow(component).find('.track-name')
    expect(title.text()).toBe('SCREAM')
  })

  test('displays album name', () => {
    const album = shallow(component).find('.track-album')
    expect(album.text()).toBe('Art Angels')
  })

  test('displays album art', () => {
    const images = shallow(component).find('.track-image')
    expect(images.length).toBe(1)
    expect(images.at(0).props().src).toBe(image)
  })
})
