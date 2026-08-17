import straconLogoDark from '../assets/straconlogo.svg'
import straconLogoLight from '../assets/straconlogo-light.svg'

export { straconLogoDark, straconLogoLight }

export default function StraconLogo({ className = '', alt = 'Stracon', variant = 'light' }) {
  const src = variant === 'dark' ? straconLogoDark : straconLogoLight
  return <img src={src} alt={alt} className={className} />
}
