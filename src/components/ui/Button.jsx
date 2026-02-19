export function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'btn'

  const variants = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    subtle: 'btn-subtle',
  }

  const variantClass = variants[variant] ?? variants.primary

  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {props.children}
    </button>
  )
}
