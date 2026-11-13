type PageHeaderProps = {
  title: string
  description?: string
  align?: 'left' | 'center'
}

/** Inner-page opening: one large statement and a short lead, no label above it. */
export function PageHeader({ title, description, align = 'left' }: PageHeaderProps) {
  const centered = align === 'center'

  return (
    <header className={`max-w-[60rem] ${centered ? 'mx-auto text-center' : ''}`}>
      <h1 className="studio-head">{title}</h1>
      {description ? (
        <p className={`studio-lead mt-6 max-w-[36ch] text-moove-muted ${centered ? 'mx-auto' : ''}`}>
          {description}
        </p>
      ) : null}
    </header>
  )
}
