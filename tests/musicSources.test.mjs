import test from 'node:test';
import assert from 'node:assert/strict';
import { playableSources,releaseLinks,spotifyEntity,youtubeId,timeLabel,spotifyPlayback } from '../src/components/music/musicSources.ts';
const release={id:'test',title:'Test',date:null,featuredArtist:null,artwork:null,platforms:[],duration:null,credits:null};
test('Spotify source IDs derive only from supplied trusted URLs',()=>{
 assert.equal(spotifyEntity('https://open.spotify.com/intl-fr/album/1sS9oT0NO7VIpaAey3AQFu'),'spotify:album:1sS9oT0NO7VIpaAey3AQFu');
 assert.equal(spotifyEntity('https://open.spotify.com.evil.test/album/abc'),null);
 assert.equal(spotifyEntity('not-a-url'),null);
});
test('YouTube requires a trusted host and a valid supplied video ID',()=>{
 assert.equal(youtubeId('https://www.youtube.com/watch?v=QprpeYkvZFM'),'QprpeYkvZFM');
 assert.equal(youtubeId('https://youtu.be/QprpeYkvZFM'),'QprpeYkvZFM');
 assert.equal(youtubeId('https://example.com/watch?v=QprpeYkvZFM'),null);
 assert.equal(youtubeId('https://www.youtube.com/watch?v=invalid'),null);
});
test('missing sources stay empty and unknown platforms remain external links',()=>{
 assert.deepEqual(playableSources(release),[]);
 const withLinks={...release,platforms:[{platform:'Deezer',url:'https://www.deezer.com/'}]};
 assert.equal(releaseLinks(withLinks).length,1);assert.deepEqual(playableSources(withLinks),[]);
});
test('direct previews are first choice and explicit URL fields deduplicate platform links',()=>{
 const url='https://open.spotify.com/album/1sS9oT0NO7VIpaAey3AQFu';
 const item={...release,audioPreviewUrl:'/audio/approved-preview.mp3',spotifyUrl:url,platforms:[{platform:'Spotify',url}]};
 assert.equal(releaseLinks(item).length,1);assert.equal(playableSources(item)[0].kind,'preview');
});
test('unknown progress never fabricates a duration',()=>{
 assert.equal(timeLabel(null),'—:—');assert.equal(timeLabel(NaN),'—:—');assert.equal(timeLabel(125.5),'2:05');
});

test('Spotify buffering, missing state and completed previews never claim playback',()=>{
 assert.equal(spotifyPlayback({}).isPlaying,false);
 assert.equal(spotifyPlayback({isPaused:false,isBuffering:true,position:1000,duration:15000}).isPlaying,false);
 assert.equal(spotifyPlayback({isPaused:false,isBuffering:false,position:15000,duration:15000}).isPlaying,false);
 assert.equal(spotifyPlayback({isPaused:false,isBuffering:false,position:1000,duration:15000}).isPlaying,true);
 assert.equal(spotifyPlayback({isPaused:true,isBuffering:false,position:1000,duration:15000}).isPlaying,false);
});

test('explicit source fields override older platform-list URLs',()=>{
 const item={...release,spotifyUrl:'https://open.spotify.com/album/new',platforms:[{platform:'Spotify',url:'https://open.spotify.com/album/old'}]};
 assert.equal(releaseLinks(item)[0].url,item.spotifyUrl);
});
