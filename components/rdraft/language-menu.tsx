"use client";

import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANG_CODES, LOCALES, type LangCode } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { Flag } from "./flag";

interface LanguageMenuProps {
  value: LangCode;
  onChange: (lang: LangCode) => void;
}

export function LanguageMenu({ value, onChange }: LanguageMenuProps) {
  const active = LOCALES[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Langue : ${active.label}`}
        className="text-gold/60 hover:text-gold flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-base transition-colors"
      >
        <Flag code={active.flag} />
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="panel scroll-slim z-100 max-h-72 min-w-44 overflow-y-auto border-0 p-1"
      >
        {LANG_CODES.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => onChange(code)}
            className={cn(
              "focus:bg-gold/15 flex cursor-pointer items-center gap-3 py-2",
              code === value && "text-gold",
            )}
          >
            <Flag code={LOCALES[code].flag} className="text-lg" />
            <span className="flex-1 font-medium">{LOCALES[code].label}</span>
            {code === value && <Check className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
