async function fetchSpotifyToken() {
  let resp = await fetch(
    "https://us-central1-personal-spotify.cloudfunctions.net/spotify-auth"
  )

  return await resp.json()
}

async function fetchPlayingData() {
  let token = await fetchSpotifyToken();

  let resp = await fetch("https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        "Authorization": `Bearer ${token.access_token}`
      }
    }
  )

  var data;
  try {
    data = await resp.json()
  } catch {
    return { title: "", is_playing: false }
  }

  console.log(data)
  let song = data.item.name;
  let artist = data.item.artists.map((artist) => {
    return artist.name
  }).join(", ")

  return {
    title: `${song} - ${artist}`,
    is_playing: data.is_playing,
  }
}

(async function refreshSong() {
  let song = await fetchPlayingData();

  document.getElementById("playing").innerText =
    song.is_playing ? song.title : "Nothing playing";

  setTimeout(refreshSong, 120000)
})();