import { useEffect, useState } from 'react'

export function useOpenAiGlobal<T = unknown>(key: string): T | null {
	const [value, setValue] = useState<T | null>(() => {
		if (typeof window !== 'undefined' && window.openai) {
			return (window.openai[key] as T) ?? null
		}
		return null
	});

	useEffect(() => {
		if (typeof window === 'undefined' || !window.openai) {
			return;
		}

    const listener = (event: Event) => {
      setValue((event as CustomEvent).detail.globals[key] as T)
    }

    window.addEventListener('openai:set_globals', listener)

		return () => {
      window.removeEventListener('openai:set_globals', listener)
    }
	}, [key])

	return value
}
