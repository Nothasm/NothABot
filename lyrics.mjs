import axios from "axios";
import { lastFmToken, geniusToken, lastFmUser } from "./config.mjs";
import Lyricist from "lyricist";

const lfClient = axios.create({
    baseURL: `http://ws.audioscrobbler.com/2.0/`,
});

const defaultParams = {
    api_key: lastFmToken,
    user: lastFmUser,
    format: "json",
};

const geniusClient = axios.create({
    baseURL: "https://api.genius.com/",
    headers: {
        Authorization: `Bearer ${geniusToken}`
    }
});

const lyricist = new Lyricist(geniusToken);

async function getLyricsOnGenius(title, artist) {
    const songs = await geniusClient.get(`search?q=${title} by ${artist}`);
    //console.log(`${title} by ${artist}`);
    //console.log(songs.data.response.hits);

    const lyricId = songs.data.response.hits[0].result.id;

    let song = await lyricist.song(lyricId, { fetchLyrics: true });

    if (!song) return `${title} - ${artist}, essa é desconhecida em...`;

    if (!checkSongTitle(song.full_title, title)) return `Acho que não encontrei a música certa 🤔\n${song.full_title}`;

    if (!song.lyrics) {
        song = await lyricist.song(lyricId, { fetchLyrics: true });

        if (!song.lyrics) return "Tente novamente";
    }

    return song.full_title + "\n\n" + song.lyrics + "\n";
}

function checkSongTitle(fullTitle, title) {
    return fullTitle.toLowerCase().includes(title.toLowerCase());
}

export default async function getLyrics() {
    const { data } = await lfClient.get("", {
        params: {
            ...defaultParams,
            method: "user.getrecenttracks",
            limit: "1"
        }
    });

    //console.log(JSON.stringify(data, undefined, 2));

    if (data && data.recenttracks.track.length === 2) {
        const track = data.recenttracks.track[0];
        const artist = track.artist["#text"];
        const title = track.name.split("(")[0];

        return await getLyricsOnGenius(title, artist);
    }

    return "Não tá escutando nada no momento";
}