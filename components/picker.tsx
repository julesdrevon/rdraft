"use client"

import * as React from "react"
import {Card, CardContent, CardTitle, CardHeader, CardDescription, CardFooter} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Minus, Plus, RefreshCw, Trash2, Volume2, Fingerprint} from "lucide-react";
import { Spinner } from "@/components/ui/spinner"
import { LaneSelector } from "./picker/lane-selector";
import { Lobby } from "./picker/lobby";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fr } from "@/lib/i18n/fr"
import { en } from "@/lib/i18n/en"
import { es } from "@/lib/i18n/es"
import { de } from "@/lib/i18n/de"
import { it } from "@/lib/i18n/it"
import { pt } from "@/lib/i18n/pt"
import { ru } from "@/lib/i18n/ru"
import { tr } from "@/lib/i18n/tr"
import { ja } from "@/lib/i18n/ja"
import { ko } from "@/lib/i18n/ko"
import { ar } from "@/lib/i18n/ar"


const LANE_ICONS: Record<string, string> = {
  "TOP": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-top.svg",
  "JGL": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-jungle.svg",
  "MID": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-middle.svg",
  "ADC": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-bottom.svg",
  "SUPP": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-utility.svg"
};

const ALL_LANES = ["TOP", "JGL", "MID", "ADC", "SUPP"];

const HEARTSTEEL_SOUNDS = [
  "https://static.wikia.nocookie.net/leagueoflegends/images/0/0f/Heartsteel_trigger_SFX_2.ogg",
  "https://static.wikia.nocookie.net/leagueoflegends/images/9/95/Heartsteel_trigger_SFX.ogg",
  "https://static.wikia.nocookie.net/leagueoflegends/images/8/87/Heartsteel_trigger_SFX_3.ogg"
];

const TRANSLATIONS = { fr, en, es, de, it, pt, ru, tr, ja, ko, ar };

const DD_LOCALES: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  de: "de_DE",
  it: "it_IT",
  pt: "pt_BR",
  ru: "ru_RU",
  tr: "tr_TR",
  ja: "ja_JP",
  ko: "ko_KR",
  ar: "en_US", 
};

const CD_LOCALES: Record<string, string> = {
  fr: "fr_fr",
  en: "default",
  es: "es_es",
  de: "de_de",
  it: "it_it",
  pt: "pt_br",
  ru: "ru_ru",
  tr: "tr_tr",
  ja: "ja_jp",
  ko: "ko_kr",
  ar: "ar_ae",
};

export function Picker() {

  const [list, setList] = React.useState<{ name: string; iconId: number }[]>([]);
  const [results, setResults] = React.useState<any[]>([]);
  const [isStarted, setIsStarted] = React.useState(false);
  const [displayCount, setDisplayCount] = React.useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = React.useState(0);
  const [rouletteName, setRouletteName] = React.useState("");
  const [isShuffling, setIsShuffling] = React.useState(false);
  const [selectedChampIndex, setSelectedChampIndex] = React.useState<number | null>(null);
  const [championsPool, setChampionsPool] = React.useState<any[]>([]);
  const [latestVersion, setLatestVersion] = React.useState("");
  const [background, setBackground] = React.useState("");
  const [loadingUids, setLoadingUids] = React.useState<Set<string>>(new Set());
  const [lang, setLang] = React.useState<keyof typeof TRANSLATIONS>("fr");
  const rerollStartTimes = React.useRef<Record<string, number>>({});
  const audioCache = React.useRef<Record<string, HTMLAudioElement>>({});
  const [masterVolume, setMasterVolume] = React.useState(0.5);
  const masterVolumeRef = React.useRef(0.5);
  const currentAudioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    masterVolumeRef.current = masterVolume;
    console.log("Master Volume changed to:", masterVolume);
    Object.values(audioCache.current).forEach(audio => {
      audio.volume = 0.5 * masterVolume;
    });
  }, [masterVolume]);

  const [secretChamp, setSecretChamp] = React.useState<any>(null);
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [secretVoType, setSecretVoType] = React.useState<'choose' | 'ban'>('choose');

  const t = TRANSLATIONS[lang];

  const startSecretGame = () => {
    if (championsPool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * championsPool.length);
    const champ = championsPool[randomIndex];
    const type = Math.random() > 0.5 ? 'choose' : 'ban';
    setSecretChamp(champ);
    setIsRevealed(false);
    setSecretVoType(type);
    
    const locale = CD_LOCALES[lang] || "default";
    const cacheKey = `${champ.key}-${locale}-${type}`;
    if (!audioCache.current[cacheKey]) {
      preloadVo(champ.key, type);
    }
    
    setTimeout(() => playChampVo(champ.key, type), 100);
  };

  React.useEffect(() => {
    const initBg = async () => {
      try {
        const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await vRes.json();
        const v = versions[0];
        setLatestVersion(v);

        const locale = DD_LOCALES[lang] || "en_US";
        const cRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/${locale}/champion.json`);
        const data = await cRes.json();
        const champs = Object.keys(data.data);
        const randomChampId = champs[Math.floor(Math.random() * champs.length)];

        const dRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/${locale}/champion/${randomChampId}.json`);
        const dData = await dRes.json();
        const skins = dData.data[randomChampId].skins;

        const randomSkin = skins[Math.floor(Math.random() * skins.length)];

        setBackground(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${randomChampId}_${randomSkin.num}.jpg`);
      } catch (e) {
        console.error(e);
      }
    };
    initBg();
  }, []);







  React.useEffect(() => {
    if (isStarted && displayCount === list.length && currentPlayerIndex < list.length) {
      setIsShuffling(true);
      let count = 0;
      const maxShuffles = 15;
      const interval = setInterval(() => {
        const randomName = list[Math.floor(Math.random() * list.length)].name;
        setRouletteName(randomName);
        count++;
        
        if (count >= maxShuffles) {
          clearInterval(interval);
          setRouletteName(list[currentPlayerIndex].name);
          setIsShuffling(false);
        }
      }, 60);
      
      return () => clearInterval(interval);
    }
  }, [currentPlayerIndex, isStarted, displayCount, list]);

  React.useEffect(() => {
    const updateLocale = async () => {
      if (!latestVersion) return;
      try {
        const locale = DD_LOCALES[lang] || "en_US";
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/${locale}/champion.json`);
        const data = await res.json();
        const allChampions = Object.values(data.data) as any[];
        setChampionsPool(allChampions);

        
        if (results.length > 0) {
          setResults(prev => prev.map(res => {
            const champ: any = allChampions.find(c => c.id === res.id);
            return champ ? { ...res, name: champ.name } : res;
          }));
        }
      } catch (e) {
        console.error("Failed to update locale:", e);
      }
    };
    updateLocale();
  }, [lang, latestVersion]);

  const addPlayer = (name: string, iconId: number) => {
    if (list.length < 5) {
      setList([...list, { name, iconId }]);
    }
  };

  const removePlayer = (index: number) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
  };

  const resetAll = () => {
    setList([]);
    setIsStarted(false);
    setResults([]);
    setCurrentPlayerIndex(0);
    setSelectedChampIndex(null);
  };

  const playChampVo = (champKey: string | number, type: 'choose' | 'ban' = 'choose') => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    const locale = CD_LOCALES[lang] || "default";
    const cacheKey = `${champKey}-${locale}-${type}`;

    if (audioCache.current[cacheKey]) {
      const audio = audioCache.current[cacheKey];
      audio.currentTime = 0;
      audio.volume = 0.5 * masterVolumeRef.current;
      currentAudioRef.current = audio;
      audio.play().catch(e => console.error("Cached VO playback failed:", e));
    } else {
      const folder = type === 'choose' ? 'champion-choose-vo' : 'champion-ban-vo';
      const audio = new Audio(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/${locale}/v1/${folder}/${champKey}.ogg`);
      audio.volume = 0.5 * masterVolumeRef.current;
      currentAudioRef.current = audio;
      audio.play().catch(e => console.error("Direct VO playback failed:", e));
    }
  };

  const preloadVo = (champKey: string | number, type: 'choose' | 'ban' = 'choose') => {
    const locale = CD_LOCALES[lang] || "default";
    const cacheKey = `${champKey}-${locale}-${type}`;
    
    if (audioCache.current[cacheKey]) return;

    const folder = type === 'choose' ? 'champion-choose-vo' : 'champion-ban-vo';
    const audio = new Audio(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/${locale}/v1/${folder}/${champKey}.ogg`);
    audio.volume = 0.5 * masterVolumeRef.current;
    audio.preload = "auto";
    audioCache.current[cacheKey] = audio;
  };

  const preloadImage = (url: string) => {
    const img = new Image();
    img.src = url;
  };

  const playHeartsteel = () => {
    const randomIndex = Math.floor(Math.random() * HEARTSTEEL_SOUNDS.length);
    const audio = new Audio(HEARTSTEEL_SOUNDS[randomIndex]);
    audio.volume = 0.1 * masterVolumeRef.current; 
    audio.play().catch(e => console.error("Heartsteel sound playback failed:", e));
  };

  const assignSelection = (lane: string) => {
    if (selectedChampIndex === null || currentPlayerIndex >= list.length) return;

    const newResults = [...results];
    newResults[selectedChampIndex].playerName = list[currentPlayerIndex].name;
    newResults[selectedChampIndex].playerIconId = list[currentPlayerIndex].iconId;
    newResults[selectedChampIndex].lane = lane;
    
    const champ: any = championsPool.find(c => c.name === newResults[selectedChampIndex].name);
    if (champ) playChampVo(champ.key);

    setResults(newResults);
    setCurrentPlayerIndex(prev => prev + 1);
    setSelectedChampIndex(null);
  };

  const rerollOne = (index: number) => {
    if (championsPool.length === 0) return;
    const currentNames = results.map(r => r.name);
    const filteredPool = championsPool.filter(c => !currentNames.includes(c.name));
    if (filteredPool.length === 0) return;

    const randomIndex = Math.floor(Math.random() * filteredPool.length);
    const champion: any = filteredPool[randomIndex];

    const slotUid = results[index].uid;
    rerollStartTimes.current[slotUid] = Date.now();
    setLoadingUids(prev => new Set(prev).add(slotUid));

    const newResults = [...results];
    newResults[index] = {
      ...newResults[index],
      name: champion.name,
      id: champion.id,
      key: champion.key,
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`
    };

    preloadVo(champion.key);
    preloadImage(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`);
    preloadImage(`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`);

    setResults(newResults);
  };

  const getAvailableLanes = () => {
    const takenLanes = results.map(r => r.lane).filter(Boolean);
    return ALL_LANES.filter(lane => !takenLanes.includes(lane));
  };

  const lancerTirage = async () => {
    const shuffledList = [...list];
    for (let i = shuffledList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
    }
    setList(shuffledList);

    setIsStarted(true);
    setDisplayCount(0);
    setResults([]);
    setCurrentPlayerIndex(0);
    setSelectedChampIndex(null);

    try {
      const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
      const versions = await vRes.json();
      const version = versions[0];
      setLatestVersion(version);

      const locale = DD_LOCALES[lang] || "en_US";
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/champion.json`);
      const data = await response.json();
      const allChampions = Object.values(data.data);
      setChampionsPool(allChampions);

      let pool = [...allChampions];
      const selection = Array.from({ length: list.length }).map((_, i) => {
        const randomIndex = Math.floor(Math.random() * pool.length);
        const champion: any = pool.splice(randomIndex, 1)[0];
        const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`;
 
        return {
          uid: `slot-${i}-${Date.now()}`, 
          name: champion.name,
          id: champion.id,
          key: champion.key,
          image: imageUrl,
          playerName: null,
          lane: null
        };
      });
 
      setResults(selection);

      selection.forEach(slot => {
        if (slot.key) preloadVo(slot.key);
        if (slot.image) preloadImage(slot.image);
        preloadImage(`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${slot.id}_0.jpg`);
      });

      for (let i = 1; i <= selection.length; i++) {
        setTimeout(() => {
          setDisplayCount(i);
          playHeartsteel();
        }, 1000 * i);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const availableLanes = getAvailableLanes();
  const isFinished = isStarted && displayCount === list.length && currentPlayerIndex === list.length;

  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-start pt-6 sm:pt-12 bg-stone-950 p-4 overflow-hidden gap-4 sm:gap-8">
      <div className="w-full flex flex-col items-center justify-center relative z-60 gap-2">
        <div className="relative group">
          <h1 
            onClick={resetAll}
            className="text-6xl sm:text-7xl md:text-8xl font-league font-normal uppercase tracking-widest text-[#c89c38] cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
          >
            Rdraft
          </h1>
          
          <div className="absolute top-1/2 -right-12 sm:-right-20 -translate-y-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none focus:ring-0">
                <span className="text-3xl sm:text-4xl cursor-pointer hover:scale-110 transition-transform block">
                  {{
                    fr: <span className="fi fi-fr rounded-sm" />, 
                    en: <span className="fi fi-gb rounded-sm" />, 
                    es: <span className="fi fi-es rounded-sm" />, 
                    de: <span className="fi fi-de rounded-sm" />, 
                    it: <span className="fi fi-it rounded-sm" />, 
                    pt: <span className="fi fi-br rounded-sm" />, 
                    ru: <span className="fi fi-ru rounded-sm" />, 
                    tr: <span className="fi fi-tr rounded-sm" />, 
                    ja: <span className="fi fi-jp rounded-sm" />, 
                    ko: <span className="fi fi-kr rounded-sm" />, 
                    ar: <span className="fi fi-sa rounded-sm" />
                  }[lang]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-stone-900/95 border-white/10 backdrop-blur-md min-w-[160px] max-h-[300px] overflow-y-auto silver-scroll z-70">
                {(Object.keys(TRANSLATIONS) as Array<keyof typeof TRANSLATIONS>).map((l) => (
                  <DropdownMenuItem 
                    key={l}
                    onClick={() => setLang(l)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-white/10 py-2"
                  >
                    <span className="text-xl">
                      {{
                        fr: <span className="fi fi-fr rounded-sm" />, 
                        en: <span className="fi fi-gb rounded-sm" />, 
                        es: <span className="fi fi-es rounded-sm" />, 
                        de: <span className="fi fi-de rounded-sm" />, 
                        it: <span className="fi fi-it rounded-sm" />, 
                        pt: <span className="fi fi-br rounded-sm" />, 
                        ru: <span className="fi fi-ru rounded-sm" />, 
                        tr: <span className="fi fi-tr rounded-sm" />, 
                        ja: <span className="fi fi-jp rounded-sm" />, 
                        ko: <span className="fi fi-kr rounded-sm" />, 
                        ar: <span className="fi fi-sa rounded-sm" />
                      }[l]}
                    </span>
                    <span className="text-white font-medium capitalize">
                      {{
                        fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch', it: 'Italiano',
                        pt: 'Português', ru: 'Русский', tr: 'Türkçe', ja: '日本語', ko: '한국어', ar: 'العربية'
                      }[l]}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-3 group/vol animate-in fade-in slide-in-from-top-1 duration-700">
          <Volume2 className="w-4 h-4 text-stone-500 group-hover/vol:text-[#c89c38] transition-colors" />
          <Slider 
            value={masterVolume} 
            onChange={setMasterVolume} 
            className="w-32 sm:w-48" 
          />
        </div>

        {!isStarted && (
          <p className="text-[10px] sm:text-xs font-medium text-stone-500 uppercase tracking-[0.2em] text-center max-w-[280px] sm:max-w-md mt-2 animate-in fade-in duration-1000 delay-500">
            {t.siteDescription}
          </p>
        )}
      </div>
      {background && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </div>
      )}

      {!isFinished && (
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <Card className="relative w-full min-w-sm bg-transparent border-0 ring-0 shadow-none pointer-events-auto">
        {isStarted && (
        <CardHeader>
          <div className="flex flex-col mt-1">
            <CardDescription className="text-center font-bold text-white uppercase tracking-widest">
              {displayCount < list.length ? t.drawing :
                  currentPlayerIndex < list.length ? t.selectChampion : ""}
            </CardDescription>
          </div>
        </CardHeader>
        )}

        <CardContent className="space-y-6 p-2 sm:p-6 overflow-x-hidden">
          {isStarted && displayCount === list.length && currentPlayerIndex < list.length && (
            <div className="flex flex-col items-center gap-2 mb-4 animate-in fade-in zoom-in duration-500">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 animate-pulse">
                &mdash; {t.yourTurn} &mdash;
              </span>
              <p className={cn(
                "text-2xl sm:text-4xl font-black uppercase text-white text-center m-0 transition-all duration-75",
                isShuffling ? "opacity-70" : "opacity-100 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
              )}>
                {rouletteName || list[currentPlayerIndex].name}
              </p>
            </div>
          )}
          <div className="flex flex-row flex-wrap gap-4 items-start justify-center">
            {!isStarted ? (
              <Lobby 
                players={list} 
                onAddPlayer={addPlayer} 
                onRemovePlayer={removePlayer} 
                t={t}
              />

            ) : (
              results.map((champ, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black uppercase h-4">
                    {champ.playerName || ""}
                  </span>

                  <div
                    onClick={() => !isShuffling && !champ.playerName && displayCount === list.length && setSelectedChampIndex(index)}
                    className={cn(
                        "group h-16 w-16 sm:h-24 sm:w-24 overflow-hidden shrink-0 flex items-center justify-center bg-stone-900/50 transition-all border-none rounded-md relative",
                        (champ.playerName || isShuffling) ? 'cursor-default' : 'cursor-pointer',
                        selectedChampIndex === index ? 'ring-2 ring-emerald-500 z-20 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''
                    )}
                  >
                    {displayCount > index ? (
                      <>
                        <img
                          src={champ.image}
                          alt={champ.name}
                          className={`h-full w-full object-cover transition-all ${champ.playerName ? 'grayscale opacity-60' : 'grayscale-0 opacity-100'}`}
                        />



                        {champ.lane && (
                          <div className="absolute bottom-0 left-0 w-full bg-emerald-600 text-[10px] text-white py-0.5 font-bold text-center uppercase z-10">
                            {champ.lane}
                          </div>
                        )}
                      </>
                    ) : (
                      <Spinner />
                    )}
                  </div>

                  <p className="text-[10px] sm:text-[11px] font-bold text-white truncate w-16 sm:w-24 text-center">
                    {displayCount > index ? champ.name : "..."}
                  </p>
                </div>
              ))
            )}
          </div>

          {isStarted && displayCount === list.length && currentPlayerIndex < list.length && (
             <LaneSelector 
                takenLanes={results.map(r => r.lane).filter(Boolean)} 
                onSelect={assignSelection} 
                disabled={isShuffling}
                t={t}
             />
          )}


        </CardContent>

        <CardFooter>
          <div className="w-full flex flex-col items-center gap-2 mt-5">
            {!isStarted ? (
              <Button onClick={lancerTirage} disabled={list.length < 2} className="uppercase tracking-widest bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 cursor-pointer">
                {t.startDraft}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={lancerTirage} className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center justify-center" disabled={displayCount < results.length}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${displayCount < results.length ? 'animate-spin' : ''}`} /> {t.restart}
                </Button>
                <Button onClick={resetAll} variant="outline" className="cursor-pointer border-rose-500 text-rose-500 hover:bg-rose-50 flex items-center justify-center">
                  <Trash2 className="mr-2 h-4 w-4" /> {t.clearAll}
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
      </div>
      )}

      {isFinished && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="flex flex-col items-center w-full px-4">
              <h2 className="text-2xl sm:text-4xl font-black text-white mb-6 uppercase tracking-[0.2em] drop-shadow-lg">
                {t.luckFinal}
              </h2>
              
               <div className="flex flex-row flex-wrap justify-center items-center gap-1 sm:gap-4 w-full">
                {[...results].sort((a, b) => {
                  const laneA = a.lane || "";
                  const laneB = b.lane || "";
                  return ALL_LANES.indexOf(laneA) - ALL_LANES.indexOf(laneB);
                }).map((champ, index) => (
                  <div key={champ.uid} className="relative w-[17vw] h-[25dvh] sm:w-[15vw] sm:h-[55dvh] max-h-[450px] sm:max-w-[240px] overflow-hidden rounded-lg border border-stone-800 group shadow-2xl">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
                        alt={champ.name}
                        className={cn(
                          "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                          loadingUids.has(champ.uid) ? "opacity-0 scale-110 blur-sm" : "opacity-80 group-hover:opacity-100 scale-100 blur-0"
                        )}
                        onLoad={() => {
                          const slotUid = champ.uid;
                          const isRerolling = loadingUids.has(slotUid);
                          const startTime = rerollStartTimes.current[slotUid] || 0;
                          const elapsed = Date.now() - startTime;
                          const remaining = Math.max(0, 500 - elapsed);

                          setTimeout(() => {
                            if (isRerolling && champ.key) {
                              playChampVo(champ.key);
                            }
                            setLoadingUids(prev => {
                              const next = new Set(prev);
                              next.delete(slotUid);
                              return next;
                            });
                            delete rerollStartTimes.current[slotUid];
                          }, remaining);
                        }}
                      />

                      {loadingUids.has(champ.uid) && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-pulse">
                           <RefreshCw className="w-12 h-12 text-amber-500/80 animate-spin" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                       <div 
                        className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-[2px] cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            const originalIndex = results.findIndex(r => r.uid === champ.uid);
                            if (originalIndex !== -1) rerollOne(originalIndex);
                        }}
                        title={t.rerollHint}
                      >
                         <RefreshCw className="w-16 h-16 text-white/90 drop-shadow-lg transition-all duration-500" />
                      </div>
 
                      {}
                      <div className="absolute inset-0 p-4">

                          {}
                          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 sm:gap-2 w-full">
                              {}
                              <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-black/40">
                                  <img 
                                      src={`https://ddragon.leagueoflegends.com/cdn/16.1.1/img/profileicon/${champ.playerIconId}.png`}
                                      alt={champ.playerName}
                                      className="w-full h-full object-cover"
                                  />
                              </div>

                              <div className="bg-black/60 px-1 py-0 sm:px-4 sm:py-1 rounded-full border border-white/10 backdrop-blur-md shadow-lg max-w-[90%]">
                                <span className="text-[7px] sm:text-base font-bold text-white uppercase tracking-widest block text-shadow truncate">
                                    {champ.playerName}
                                </span>
                              </div>
                          </div>

                          <div className="absolute bottom-2 sm:bottom-6 left-0 right-0 flex flex-col items-center text-center px-0.5">
                              
                              <div className="h-6 w-6 sm:h-12 sm:w-12 rounded-full bg-stone-900/80 border border-stone-600 hover:border-emerald-500 p-1.5 sm:p-2.5 shadow-xl hover:shadow-emerald-500/20 flex items-center justify-center mb-0.5 sm:mb-2 backdrop-blur-sm group-hover:scale-110 transition-all duration-300">
                                <img 
                                  src={LANE_ICONS[champ.lane || ""]} 
                                  alt={champ.lane || ""} 
                                  className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity invert dark:invert-0"
                                />
                              </div>

                              <p className="text-[8px] sm:text-base font-serif italic text-white text-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity truncate w-full">
                                {champ.name}
                              </p>
                          </div>
                      </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-amber-500/80 uppercase tracking-widest mt-6 sm:mt-8 animate-bounce">
                {t.rerollHint}
              </p>

              <div className="mt-4 sm:mt-8 flex gap-4 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
                  <Button onClick={lancerTirage} size="lg" className="bg-stone-100 text-stone-900 hover:bg-white cursor-pointer font-bold uppercase tracking-widest px-8 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                      <RefreshCw className="mr-2 h-5 w-5" /> {t.replay}
                  </Button>
                  <Button onClick={resetAll} size="lg" className="border-rose-500 text-rose-500 bg-[#1b1917] cursor-pointer hover:bg-rose-500 hover:text-white hover:border-rose-500 uppercase tracking-widest transition-colors">
                      <Trash2 className="mr-2 h-5 w-5" /> {t.quit}
                  </Button>
              </div>
            </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-100 flex flex-col items-end gap-3">
        {secretChamp && (
          <div className="bg-stone-900/90 border border-white/10 backdrop-blur-lg p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 w-64">
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs font-bold uppercase text-amber-500 tracking-tighter">{t.guessWho}</p>
              
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/5 bg-black/40">
                {isRevealed ? (
                  <img 
                    src={`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${secretChamp.image.full}`}
                    alt={secretChamp.name}
                    className="w-full h-full object-cover animate-in zoom-in-50 duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-black text-white/10">?</span>
                  </div>
                )}
              </div>

              {isRevealed && (
                <p className="text-lg font-bold text-white uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                  {secretChamp.name}
                </p>
              )}

              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2 w-full">
                  {!isRevealed ? (
                    <Button 
                      onClick={() => setIsRevealed(true)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs py-1 h-8 cursor-pointer"
                    >
                      {t.reveal}
                    </Button>
                  ) : (
                    <Button 
                      onClick={startSecretGame}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 h-8 cursor-pointer"
                    >
                      {t.replay}
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => playChampVo(secretChamp.key, secretVoType)}
                    className="w-10 h-8 border-white/10 hover:bg-white/5 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-[9px] text-white/30 text-center leading-tight">
                  {t.audioNotice}
                </p>
              </div>
              
              <button 
                onClick={() => setSecretChamp(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-stone-800 rounded-full border border-white/10 text-white/60 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <Button
          onClick={secretChamp ? () => setSecretChamp(null) : startSecretGame}
          className={cn(
            "w-12 h-12 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center p-0 cursor-pointer",
            secretChamp 
              ? "bg-rose-600 hover:bg-rose-700" 
              : "bg-[#c89c38] hover:bg-[#a6822d] hover:scale-110"
          )}
          title={t.secretGame}
        >
          {secretChamp ? (
             <Plus className="w-6 h-6 text-white rotate-45" />
          ) : (
             <Fingerprint className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

    </main>
  )
}