"use client"

import * as React from "react"
import { Plus, X, User } from "lucide-react"
import { HextechModal } from "./hextech-modal"
import { cn } from "@/lib/utils"

interface LobbyProps {
  players: { name: string; iconId: number }[]
  onAddPlayer: (name: string, iconId: number) => void
  onRemovePlayer: (index: number) => void
  t: any
}



const FILL_ORDER = [2, 1, 3, 0, 4]

export function Lobby({ players, onAddPlayer, onRemovePlayer, t }: LobbyProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [initialName, setInitialName] = React.useState("")

  
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      
      
      if (isModalOpen || document.activeElement?.tagName === 'INPUT' || players.length >= 5) return

      
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setInitialName(e.key)
        setIsModalOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, players.length])

  
  const slots = React.useMemo(() => {
    const currentSlots = Array(5).fill(null)
    players.forEach((player, i) => {
      
      if (i < FILL_ORDER.length) {
        currentSlots[FILL_ORDER[i]] = { ...player, originalIndex: i }
      }
    })
    return currentSlots
  }, [players])

  const handleAddClick = () => {
    if (players.length < 5) {
      setInitialName("") 
      setIsModalOpen(true)
    }
  }

  const handleConfirmAdd = (name: string, iconId: number) => {
    onAddPlayer(name, iconId)
  }

  return (
    <div className="w-full flex flex-col items-center">
      
      {}
      <div className="flex flex-row flex-nowrap sm:flex-wrap items-center justify-center gap-1.5 sm:gap-6 pt-2 sm:pt-12 pb-4 relative">
        


        {slots.map((slot, visualIndex) => {
          const isCenter = visualIndex === 2
          const isFilled = slot !== null
          

          return (
            <div 
              key={visualIndex} 
              className={cn(
                "relative transition-all duration-300",
                isCenter ? "scale-105 z-10" : "scale-100",
                !isFilled ? "cursor-pointer hover:scale-[1.07]" : ""
              )}
              onClick={() => !isFilled && handleAddClick()}
            >
              {}
              <div className={cn(
                "w-[17vw] sm:w-[14vw] h-[20dvh] sm:h-[45dvh] max-h-[400px] sm:max-w-[200px] rounded-lg flex items-center justify-center transition-all relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10",
                isFilled 
                  ? "bg-white/10 shadow-2xl border-white/20" 
                  : "hover:bg-white/15 shadow-xl"
              )}>
                
                {isFilled ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center group p-4 gap-4 text-center">
                    
                    {}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-white/10 shadow-lg">
                        <img 
                          src={`https://ddragon.leagueoflegends.com/cdn/16.1.1/img/profileicon/${slot.iconId}.png`}
                          alt={slot.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg max-w-[140px]">
                        <span className="text-[9px] sm:text-sm font-bold text-white uppercase tracking-widest truncate block text-center">
                            {slot.name}
                        </span>
                      </div>
                    </div>
                    
                    {}
                    <div 
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemovePlayer(slot.originalIndex)
                      }}
                    >
                        <div className="bg-destructive/80 p-2 rounded-full shadow-lg">
                            <X className="w-5 h-5 text-white" />
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/20">
                    <Plus className="w-6 h-6 transition-colors group-hover:text-primary" />
                    <span className="text-[8px] uppercase font-bold tracking-widest opacity-40 text-center px-1 w-full">{t.addPlayer}</span>
                  </div>
                )}

                {}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
              </div>
            </div>
          )
        })}
      </div>

      <HextechModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirmAdd}
        title={t.addPlayerModal}
        initialValue={initialName}
        t={t}
      />

    </div>
  )
}
