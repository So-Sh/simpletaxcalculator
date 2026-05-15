interface ToolPageLayoutProps {
    children: React.ReactNode
}

export default function ToolPageLayout({ children }: ToolPageLayoutProps) {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex gap-8 items-start">
                {/* Main content */}
                <div className="flex-1 min-w-0 space-y-4">
                    {children}
                </div>

                {/* Sticky sidebar — desktop only, ad slot */}
                {/*<aside className="hidden lg:block w-[300px] flex-shrink-0">
                    <div className="sticky top-20 space-y-4">
                        <div
                            className="rounded-lg border border-dashed border-border bg-surface
                         flex items-center justify-center text-xs text-muted"
                            style={{ width: 300, height: 600 }}
                        >
                            Ad slot (300×600)
                        </div>
                    </div>
                </aside>
                */}


            </div>
        </div>
    )
}