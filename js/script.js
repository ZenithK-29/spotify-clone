console.log("hello world")

let songs
let currentSong = new Audio()
let currFolder

function formatTime(seconds) {
    // Ensure input is a number
    seconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Add leading zero to seconds if less than 10
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return `${minutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(
                decodeURIComponent(element.getAttribute("href")).split("/").pop()
            )
        }
    }


    //Show all the songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${decodeURI(song)}</div>
                                <div>Zenith</div>
                            </div>

                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="" srcset="">
                            </div>
                            
                         </li>`
    }


    //Attach an event listener to all songs

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })

    })

    return songs
}


//Plaumsic
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track

    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function diplayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchor = div.getElementsByTagName("a")
    let array = Array.from(anchor)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        // console.log(e.href)
        if (e.href.includes("/songs/")) {
            let folder = (e.href.split("/").slice(-1)[0])
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json()
            let cardContainer = document.querySelector(".cardContainer")


            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg viewBox="0 0 100 100" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="46" fill="#1DB954" />
                                <polygon points="42,34 42,66 66,50" fill="#000000" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.png" alt="">

                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load the playlist on clicking the card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item.currentTarget.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

//Main function
async function main() {
    await getSongs("songs/cs")

    diplayAlbums()

    playMusic(songs[0], true)


    //Attach event listener to previous, play and next

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {


        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`

        document.querySelector(".circle").style.left = ((currentSong.currentTime / currentSong.duration) * 100) + "%"
    })

    //add an event listener to seekbar (move the circle)
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.offsetX, e.target.getBoundingClientRect().width)
        let percent = ((e.offsetX / e.target.getBoundingClientRect().width) * 100)
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    //add an event listener for hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add event listener to close

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //add an event listener for prev and next songs

    document.querySelector("#previous").addEventListener("click", () => {
        console.log("previous")
        let index = songs.indexOf((currentSong.src.split("/").slice(-1)[0]))

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })

    document.querySelector("#next").addEventListener("click", () => {
        console.log("next")

        console.log("ggs: ", songs)
        let index = songs.indexOf((currentSong.src.split("/").slice(-1)[0]))

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //add an event listener to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100
    })

    //add event listener for volume (mute)
    document.querySelector(".volume>img").addEventListener("click", e=>{

        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
            currentSong.volume = 0
        }

        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 20
            currentSong.volume = 0.20
        }
    })


}

main()

