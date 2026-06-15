type PageHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function PageHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: PageHeaderProps) {
  const centered = align === 'center'

  return (
    <header className={`max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
      <p className="moove-eyebrow">{eyebrow}</p>
      <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-moove-silver sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-moove-muted sm:text-lg">
          {description}
        </p>
      ) : null}
      <div
        className={`moove-rule mt-6 ${centered ? 'mx-auto' : ''}`}
        aria-hidden
      />
    </header>
  )
}
