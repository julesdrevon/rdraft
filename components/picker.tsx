"use client"

import * as React from "react"
import {Card, CardContent, CardTitle, CardHeader, CardDescription, CardFooter} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Minus, Plus, RefreshCw, Trash2} from "lucide-react";
import { Spinner } from "@/components/ui/spinner"

const ALL_LANES = ["TOP", "JGL", "MID", "ADC", "SUPP"];

export function Picker() {
  const [teammate, setTeammate] = React.useState("")
  const [list, setList] = React.useState<string[]>([])
  const [results, setResults] = React.useState<any[]>([]);
  const [isStarted, setIsStarted] = React.useState(false);
  const [displayCount, setDisplayCount] = React.useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = React.useState(0);
  const [selectedChampIndex, setSelectedChampIndex] = React.useState<number | null>(null);
  const [championsPool, setChampionsPool] = React.useState<any[]>([]);
  const [latestVersion, setLatestVersion] = React.useState("");
  const [background, setBackground] = React.useState("");

  // Charger le fond d'écran au démarrage
  React.useEffect(() => {
    const initBg = async () => {
      try {
        const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await vRes.json();
        const v = versions[0];
        const cRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/fr_FR/champion.json`);
        const data = await cRes.json();
        const champs = Object.keys(data.data);
        const randomChamp = champs[Math.floor(Math.random() * champs.length)];
        setBackground(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${randomChamp}_0.jpg`);
      } catch (e) {
        console.error(e);
      }
    };
    initBg();
  }, []);

  const addTeammate = () => {
    if (teammate.trim() !== "" && list.length < 5) {
      setList([...list, teammate]);
      setTeammate("");
    }
  }

  const resetAll = () => {
    setTeammate("");
    setList([]);
    setResults([]);
    setIsStarted(false);
    setDisplayCount(0);
    setCurrentPlayerIndex(0);
    setSelectedChampIndex(null);
  };

  const removeLast = () => {
    setList(list.slice(0, -1));
  };

  const assignSelection = (lane: string) => {
    if (selectedChampIndex === null || currentPlayerIndex >= list.length) return;

    const newResults = [...results];
    newResults[selectedChampIndex].playerName = list[currentPlayerIndex];
    newResults[selectedChampIndex].lane = lane;

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

    const newResults = [...results];
    newResults[index] = {
      ...newResults[index],
      name: champion.name,
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`
    };
    setResults(newResults);
  };

  const getAvailableLanes = () => {
    const takenLanes = results.map(r => r.lane).filter(Boolean);
    return ALL_LANES.filter(lane => !takenLanes.includes(lane));
  };

  const lancerTirage = async () => {
    setIsStarted(true);
    setDisplayCount(0);
    setResults([]);
    setCurrentPlayerIndex(0);
    setSelectedChampIndex(null);

    try {
      const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
      const versions = await versionRes.json();
      const version = versions[0];
      setLatestVersion(version);

      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`);
      const data = await response.json();
      const allChampions = Object.values(data.data);
      setChampionsPool(allChampions);

      let pool = [...allChampions];
      const selection = Array.from({ length: list.length }).map(() => {
        const randomIndex = Math.floor(Math.random() * pool.length);
        const champion: any = pool.splice(randomIndex, 1)[0];
        const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`;

        const img = new Image();
        img.src = imageUrl;

        return {
          name: champion.name,
          image: imageUrl,
          playerName: null,
          lane: null
        };
      });

      setResults(selection);

      for (let i = 1; i <= selection.length; i++) {
        setTimeout(() => setDisplayCount(i), 1000 * i);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const availableLanes = getAvailableLanes();
  const isFinished = isStarted && displayCount === list.length && currentPlayerIndex === list.length;

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-stone-950 p-4 overflow-hidden">
      {background && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      <Card className="relative z-10 min-w-sm bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-2xl border-stone-200/20">
        <CardHeader>
          <CardTitle>Rdraft</CardTitle>
          <div className="flex flex-col mt-1">
            <CardDescription>
              {!isStarted ? "Entrez les noms de vos coéquipiers." :
                displayCount < list.length ? "Tirage en cours..." :
                  currentPlayerIndex < list.length ? "Sélectionnez un champion et une lane." : "Bonne chance 🤣"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isStarted && displayCount === list.length && currentPlayerIndex < list.length && (
            <p className="text-sm font-bold uppercase text-amber-500 text-center m-0">
              {list[currentPlayerIndex]}
            </p>
          )}
          <div className="flex flex-row flex-wrap gap-4 items-start justify-center">
            {!isStarted ? (
              <div className="flex flex-row flex-wrap gap-2 items-center justify-center">
                {list.map((name, index) => (
                  <div key={index} className="w-32">
                    <Input value={name} disabled className="bg-stone-100 dark:bg-stone-800 opacity-70" />
                  </div>
                ))}
                {list.length < 5 && (
                  <div className="flex flex-row gap-2 items-center">
                    <Input
                      placeholder="Nom"
                      className="w-32"
                      value={teammate}
                      onChange={(e) => setTeammate(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTeammate()}
                    />
                    <button onClick={addTeammate} className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded text-white transition-colors cursor-pointer">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {list.length > 0 && (
                  <button onClick={removeLast} className="p-2 bg-rose-500 hover:bg-rose-600 rounded text-white transition-colors cursor-pointer">
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              results.map((champ, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black uppercase h-4">
                    {champ.playerName || ""}
                  </span>

                  <div
                    onClick={() => !champ.playerName && displayCount === list.length && setSelectedChampIndex(index)}
                    className={`group h-24 w-24 overflow-hidden shrink-0 flex items-center justify-center bg-stone-900/50 transition-all border-none rounded-none relative
                      ${champ.playerName && !isFinished ? 'cursor-default' : 'cursor-pointer'}
                      ${selectedChampIndex === index ? 'ring-2 ring-emerald-500 z-20' : ''}
                    `}
                  >
                    {displayCount > index ? (
                      <>
                        <img
                          src={champ.image}
                          alt={champ.name}
                          className={`h-full w-full object-cover transition-all ${champ.playerName && !isFinished ? 'grayscale opacity-60' : 'grayscale-0 opacity-100'}`}
                        />

                        {isFinished && (
                          <div
                            onClick={(e) => { e.stopPropagation(); rerollOne(index); }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer"
                          >
                            <RefreshCw className="h-8 w-8 text-white" />
                          </div>
                        )}

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

                  <p className="text-[11px] font-bold text-emerald-500 truncate w-24 text-center">
                    {displayCount > index ? champ.name : "..."}
                  </p>
                </div>
              ))
            )}
          </div>

          {isStarted && displayCount === list.length && currentPlayerIndex < list.length && (
            <div className="flex flex-col items-center gap-3 py-4 border-t border-stone-800">
              <p className="text-xs font-bold uppercase text-stone-400 italic">Assigner à la lane :</p>
              <div className="flex flex-row gap-2">
                {availableLanes.map(lane => (
                  <Button
                    key={lane}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    onClick={() => assignSelection(lane)}
                  >
                    {lane}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <div className="w-full flex flex-col items-center gap-2">
            {!isStarted ? (
              <Button onClick={lancerTirage} disabled={list.length < 2} className="uppercase tracking-widest bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 cursor-pointer">
                Lancer le tirage
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={lancerTirage} className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center justify-center" disabled={displayCount < results.length}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${displayCount < results.length ? 'animate-spin' : ''}`} /> Recommencer
                </Button>
                <Button onClick={resetAll} variant="outline" className="cursor-pointer border-rose-500 text-rose-500 hover:bg-rose-50 flex items-center justify-center">
                  <Trash2 className="mr-2 h-4 w-4" /> Tout effacer
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}