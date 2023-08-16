import { useEffect, useState } from 'react'

type SheetVariant = 'mobile' | 'desktop'

/**
 * Returns which sheet variant we should be using, based on the viewport size.
 *
 * Sheets only appear as a result of user interactions, so there's not gonna be a flash
 * when switching between mobile and desktop variants in the useEffect
 */
const useSheetVariant = (): SheetVariant => {
  const [variant, setVariant] = useState<SheetVariant>('desktop')

  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth < 992) {
        setVariant('mobile')
      } else {
        setVariant('desktop')
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return variant
}

export default useSheetVariant
