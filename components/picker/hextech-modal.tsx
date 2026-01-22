"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogOverlay } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const ICON_VERSION = "16.1.1"

interface HextechModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string, iconId: number) => void
  title: string
  initialValue?: string
  t: any
}

export function HextechModal({ isOpen, onClose, onConfirm, title, initialValue = "", t }: HextechModalProps) {
  const [name, setName] = React.useState("")
  const [randomIconId, setRandomIconId] = React.useState<number>(685)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onConfirm(name.trim(), randomIconId)
      setName("")
      onClose()
    }
  }

  
  React.useEffect(() => {
    if (isOpen) {
      setName(initialValue)
      
      
      
      const defaultIds = [0, 1, 2]
      const classicIds = Array.from({ length: 20 }, (_, i) => 10 + i) 
      const legacyIds = Array.from({ length: 29 }, (_, i) => 50 + i)  
      const lootIds = Array.from({ length: 50 }, (_, i) => 1000 + i)   
      const safeIds = [...defaultIds, ...classicIds, ...legacyIds, ...lootIds]
      
      const randomId = safeIds[Math.floor(Math.random() * safeIds.length)]
      setRandomIconId(randomId)
      
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, initialValue])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {}
      <DialogContent className="sm:max-w-md duration-0 animate-none data-[state=open]:animate-none data-[state=closed]:animate-none top-1/3 sm:top-1/2 -translate-y-1/2">
        <DialogHeader className="flex flex-col items-center gap-4">
          
          {}
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-stone-900 mt-2">
            <img 
              src={`https://ddragon.leagueoflegends.com/cdn/${ICON_VERSION}/img/profileicon/${randomIconId}.png`}
              alt="Profile Icon"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-xs opacity-60">
              {t.enterUsername}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.usernamePlaceholder}
            className="text-center text-lg h-12 bg-white/5 border-white/10"
          />

          <DialogFooter className="sm:justify-center gap-2">
             <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="hover:bg-white/5 cursor-pointer"
            >
              {t.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim()}
              className="px-8 font-bold uppercase tracking-widest bg-stone-100 text-stone-900 hover:bg-white cursor-pointer"
            >
              {t.add}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
