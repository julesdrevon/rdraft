"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerInputProps {
  list: string[];
  onAdd: (name: string) => void;
  onRemoveLast: () => void;
  isStarted: boolean;
}

export function PlayerInput({ list, onAdd, onRemoveLast, isStarted }: PlayerInputProps) {
  const [teammate, setTeammate] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (teammate.trim() !== "") {
      onAdd(teammate);
      setTeammate("");
      inputRef.current?.focus();
    }
  };

  if (isStarted) {
    
    return (
      <div className="flex flex-row flex-wrap gap-2 items-center justify-center">
        {list.map((name, index) => (
          <div key={index} className="w-32">
            <Input value={name} disabled className="bg-stone-100 dark:bg-stone-800 opacity-70 text-center font-semibold" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-wrap gap-2 items-center justify-center">
      {list.map((name, index) => (
        <div key={index} className="w-32">
           <Input value={name} disabled className="bg-stone-100 dark:bg-stone-800 opacity-70 text-center" />
        </div>
      ))}

      {list.length < 5 && (
        <div className="flex flex-row gap-2 items-center">
          <Input
            ref={inputRef}
            placeholder="Pseudo"
            className="w-32"
            value={teammate}
            onChange={(e) => setTeammate(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} size="icon" className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {list.length > 0 && (
        <Button onClick={onRemoveLast} size="icon" className="bg-rose-500 hover:bg-rose-600 cursor-pointer">
          <Minus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
