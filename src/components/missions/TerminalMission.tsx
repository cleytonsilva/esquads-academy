import React, { useEffect, useRef, useState } from 'react'

type Step = { id: string; prompt: string; answer: string; hint?: string; hints?: string[] }

type Props = {
  title: string
  steps: Step[]
  onComplete?: () => void
}

export default function TerminalMission({ title, steps, onComplete }: Props) {
  const [history, setHistory] = useState<string[]>([`Mission: ${title}`, 'Type help to see commands.'])
  const [input, setInput] = useState('')
  const [index, setIndex] = useState(0)
  const [hintIndex, setHintIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const add = (line: string) => setHistory((prev) => prev.concat(line))

  const handle = (cmd: string) => {
    const step = steps[index]
    if (!step) return
    if (cmd === 'help') {
      add('Available: help, hint, objective, status, clear')
    } else if (cmd === 'hint') {
      const hints = Array.isArray(step.hints) && step.hints.length ? step.hints : (step.hint ? [step.hint] : [])
      if (hints.length === 0) {
        add('No hint available.')
      } else if (hintIndex < hints.length) {
        add(`Hint ${hintIndex + 1}: ${hints[hintIndex]}`)
        setHintIndex(hintIndex + 1)
      } else {
        add('No more hints for this step.')
      }
    } else if (cmd === 'objective') {
      add(step.prompt)
    } else if (cmd === 'status') {
      add(`Step ${index + 1}/${steps.length}. Hints used: ${hintIndex}.`)
    } else if (cmd === 'clear') {
      setHistory([])
    } else {
      if (cmd.trim().toLowerCase() === step.answer.trim().toLowerCase()) {
        add('✅ Correct')
        if (index + 1 < steps.length) {
          setIndex(index + 1)
          setHintIndex(0)
          add(`Next: ${steps[index + 1].prompt}`)
        } else {
          add('🏁 Mission complete!')
          onComplete?.()
        }
      } else {
        add('❌ Incorrect, try again. (hint to get help)')
      }
    }
  }

  return (
    <div className="bg-black text-green-400 p-4 rounded-md font-mono">
      <div className="h-64 overflow-auto space-y-1">
        {history.map((line, i) => (
          <div key={i}>&gt; {line}</div>
        ))}
        <div>&gt; {steps[index]?.prompt}</div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span>&gt;</span>
        <input
          ref={inputRef}
          className="flex-1 bg-black text-green-400 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const cmd = input
              setInput('')
              handle(cmd)
            }
          }}
        />
      </div>
    </div>
  )
}

