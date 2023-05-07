import { useState, useEffect } from "react";
import "./App.css";
import ClipLoader from "react-spinners/ClipLoader";

const url = "https://accounts.spotify.com/api/token";
const clientId = "YOUR CLIENT ID";
const clientSecret = "YOUR CLIENT SECRET";

type SpotifyAuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};
type Album = {
  name: string;
  id: string;
  release_data: number;
  type: string;
  href: string;
  artists: [Artist];
  images: [Image];
};
type Artist = {
  name: string;
  type: string;
  id: string;
  href: string;
  external_urls: {
    spotify: string;
  };
};
type Image = {
  height: number;
  url: string;
  width: number;
};

type Language = {
  languageCode: string;
  languageName: string;
};

type AlbumWithSongs = {
  images: [Image],
  name: string,
  tracks: {
    items: [Song]
  }
}

type Song = {
  name: string,
  preview_url: string,
  track_number: number,
  artists: [Artist],
  external_urls: {
    spotify: string;
  };
}

function App() {
  const [albums, setAlbums] = useState<Album[]>();
  const [dropdownShown, setDropdownShown] = useState<Boolean>(false);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    languageCode: "US",
    languageName: "United States",
  });
  const [album, setAlbum] = useState<AlbumWithSongs>();
  const [albumShown, setAlbumShown] = useState<Boolean>(false);

  const getAlbums = async (language?: Language) => {
    await fetchNewRealeases(language);
  }
  const getAlbum = async(href: string) => {
    const spotifyAuthResponse: SpotifyAuthResponse = await getToken();
    await fetch(href, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyAuthResponse.access_token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setAlbum(data);
      })
      .catch((error) => console.error(error));

  }

  const getToken = async () => {
    var spotifyAuthResponse: SpotifyAuthResponse = {
      access_token: "string",
      token_type: "string",
      expires_in: 99
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    };
    await fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        spotifyAuthResponse = data;
      })
      .catch((error) => console.error(error));

    return spotifyAuthResponse
  };
  const fetchNewRealeases = async (
    language?: Language
  ) => {
    const spotifyAuthResponse: SpotifyAuthResponse = await getToken();
    if (language){
      var url = `https://api.spotify.com/v1/browse/new-releases?country=${language.languageCode}`;
    } else {
      var url = `https://api.spotify.com/v1/browse/new-releases?country=${selectedLanguage.languageCode}`;
    }

    await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyAuthResponse.access_token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.albums.items)
        setAlbums(data.albums.items);
        setIsLoading(false)
      })
      .catch((error) => console.error(error));
  };
  useEffect(() => {
    getAlbums();
    
  }, []);

  return (
    <>
      {/* Modal */}
      <div className={`${albumShown ? "absolute" : "hidden"} w-[100%] h-[100%] bg-white left-0 right-0 top-0`}>
        <div className="flex flex-col items-center">
          <div className="">
          <div className="my-8 mt-16">
            <h1>{album?.name}</h1>
          </div>
          <div className="absolute right-10 top-6 cursor-pointer" onClick={() => {
          setAlbum(null)
          setAlbumShown(false)
          }}><p>Close</p></div>
          { album ? album.tracks.items.map((song, index) => {
            return (
              <>
                <div className="my-8 flex mx-8" key={index} onClick={() => console.log(song)}>
                  <p>{index + 1}.</p>
                  <img className="mx-8" onClick={() => {     
                  }} src={`${album.images[2] ? album.images[2].url : ""}`}></img>
                  <span><a href={song.external_urls.spotify}>{`${song.name} `}</a>
                    
                    {song.artists
                      ? song.artists.map((artist, index) => {
                          if (index == 0) {
                            return (
                              <>
                                von{" "}
                                <a href={`${artist.external_urls.spotify}`}>
                                  {artist.name}
                                </a>
                              </>
                            );
                          } else {
                            return (
                              <>
                                ,{" "}
                                <a href={`${artist.external_urls.spotify}`}>
                                  {artist.name}
                                </a>
                              </>
                            );
                          }
                        })
                      : ""}
                  </span>
                  
                </div>
                <audio controls className="ml-8">
                    <source src={song.preview_url} type="audio/mpeg"/>
                    Your browser does not support the audio element.
                  </audio>
              </>
            )
          }) : ""
        }
        </div>

        </div>

      </div>
      
      {/* Dropdown */}
      <button
        onClick={() => setDropdownShown((prev) => !prev)}
        id="dropdownDelayButton"
        data-dropdown-toggle="dropdownDelay"
        data-dropdown-delay="500"
        data-dropdown-trigger="hover"
        class={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex  items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${albumShown ? "hidden" : ""}`}
        type="button"
      > {
        isLoading ? <ClipLoader color="#cff1ff" size={20}/> : <p>{`${selectedLanguage.languageName}`}</p>
      }
        
        <svg
          class="w-4 h-4 ml-2"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
      <div className={`flex justify-center ${albumShown ? "hidden" : ""}`}>
        <div
          id="dropdownDelay"
          className={`z-10 ${
            dropdownShown ? "" : "hidden"
          } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
        >
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownDelayButton"
          >
            {languages.map((language: Language, index: number) => {
              return (
                <li onClick={() => {
                  setSelectedLanguage(() => language);
                  setIsLoading((prev) => !prev)
                  setDropdownShown((prev) => !prev)
                  getAlbums(language);
                }}>
                  <a
                    key={index}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    {language.languageName}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      { albums && albumShown === false ? albums.map((album, index) => {
            return (
              <>
                <div className="my-8 flex" key={index}>
                  <p>{index + 1}.</p>
                  <img className="mx-8 cursor-pointer" onClick={() => {
                    getAlbum(album.href)
                    setAlbumShown(prev => !prev);
                  }} src={`${album.images[2] ? album.images[2].url : ""}`}></img>
                  <span>
                    <a className="cursor-pointer" onClick={() => {
                      getAlbum(album.href)
                      setAlbumShown(prev => !prev);
                    }}>{`${album.name} `}</a>
                    {album.artists
                      ? album.artists.map((artist, index) => {
                          if (index == 0) {
                            return (
                              <>
                                von{" "}
                                <a href={`${artist.external_urls.spotify}`}>
                                  {artist.name}
                                </a>
                              </>
                            );
                          } else {
                            return (
                              <>
                                ,{" "}
                                <a href={`${artist.external_urls.spotify}`}>
                                  {artist.name}
                                </a>
                              </>
                            );
                          }
                        })
                      : ""}
                  </span>
                </div>
                {/* <div className="mt-8">{JSON.stringify(album)}</div> */}
              </>
            );
          })
      : ""}
    </>
  );
}

export default App;

const languages: Language[] = [
  { languageCode: "DE", languageName: "Germany" },
  { languageCode: "ES", languageName: "Spain" },
  { languageCode: "FR", languageName: "France" },
  { languageCode: "US", languageName: "United States" },
  { languageCode: "GB", languageName: "Great Britain" },
  { languageCode: "IT", languageName: "Italy" },
];

