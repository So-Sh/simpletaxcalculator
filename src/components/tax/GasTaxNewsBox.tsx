interface GasTaxNews {
    state: string;
    slug: string;
    note: string;
    sourceUrl: string;
    until: string;
}

interface GasTaxNewsBoxProps {
    news: GasTaxNews;
}

export default function GasTaxNewsBox({
    news,
}: GasTaxNewsBoxProps) {
    return (
        <aside
            className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4"
            aria-label={`Gas tax news for ${news.state}`}
        >
            <h2 className="mb-2 font-semibold text-amber-950">
                Recent Gas Tax Update
            </h2>

            <p className="text-sm leading-6 text-amber-950">
                {news.note}
            </p>
            <a
                href={news.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-amber-900 underline"
            >
                Official source
            </a>
        </aside>
    );
}