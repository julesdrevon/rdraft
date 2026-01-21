"use client";

import { useState, useEffect } from "react";
import { Champion } from "@/types";

interface UseDragonReturn {
  version: string;
  champions: Champion[];
  loading: boolean;
  error: string | null;
  getRandomBackground: () => Promise<string | null>;
}

export function useDragon(): UseDragonReturn {
  const [version, setVersion] = useState<string>("");
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // 1. Get Versions
        const vRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        if (!vRes.ok) throw new Error("Failed to fetch versions");
        const versions = await vRes.json();
        const latestInfo = versions[0];
        setVersion(latestInfo);

        // 2. Get Champions
        const cRes = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${latestInfo}/data/fr_FR/champion.json`
        );
        if (!cRes.ok) throw new Error("Failed to fetch champions");
        const data = await cRes.json();
        const champsArray = Object.values(data.data) as Champion[];
        setChampions(champsArray);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données de League of Legends.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const getRandomBackground = async (): Promise<string | null> => {
    if (!version || champions.length === 0) return null;

    try {
      const randomChamp = champions[Math.floor(Math.random() * champions.length)];
      // Provide detail fetch if we need skins, but checking basic validity first
      // To get skins, we need the individual champion details:
      const dRes = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion/${randomChamp.id}.json`
      );
      if(!dRes.ok) return null;
      
      const dData = await dRes.json();
      const detailedChamp = dData.data[randomChamp.id];
      const skins = detailedChamp.skins;
      const randomSkin = skins[Math.floor(Math.random() * skins.length)];

      return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${randomChamp.id}_${randomSkin.num}.jpg`;
    } catch (e) {
      console.error("BG fetch error", e);
      return null;
    }
  };

  return { version, champions, loading, error, getRandomBackground };
}
