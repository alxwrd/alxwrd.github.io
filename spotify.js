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
    return { title: "Offline", is_playing: false }
  }

  let song = data.item.name;
  let artist = data.item.artists.map((artist) => {
    return artist.name
  }).join(", ")

  return {
    title: `${song} - ${artist}`,
    is_playing: data.is_playing,
    url: data.item.external_urls.spotify,
  }
}

(async function refreshSong() {
  let song = await fetchPlayingData();

  let playing = document.getElementById("playing");
  let logo = document.getElementById("spotify-logo")

  playing.innerText = song.is_playing ? song.title : "Offline";

  const clickEvent = ["click", () => {window.open(song.url, "_blank")}, true];

  if (song.is_playing) {
    logo.style.color = "#82c91e"
    playing.classList.add("marquee-animation");
    document.getElementById("spotifyPlaying")
      .addEventListener(...clickEvent);

  } else {
    logo.style.color = "#666666"
    playing.classList.remove("marquee-animation");
    document.getElementById("spotifyPlaying")
      .removeEventListener(...clickEvent);
  }

  setTimeout(refreshSong, 120000)
})();