import straconLogoDark from '../assets/straconlogo.svg'
import straconLogoLight from '../assets/straconlogo-light.svg'

export { straconLogoDark, straconLogoLight }

export default function StraconLogo({
  className = '',
  alt = 'Stracon',
  variant = 'light',
  withTech = true,
}) {
  const src = variant === 'dark' ? straconLogoDark : straconLogoLight
  return (
    <div
      className={`stracon-brand-mark ${variant === 'dark' ? 'stracon-brand-mark--dark' : ''}`}
    >
      <img src={src} alt={alt} className={className} />
      {withTech && <span className="stracon-brand-tech">Tech</span>}
    </div>
  )
}
