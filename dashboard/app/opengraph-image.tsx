
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Architecture Review Dashboard'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #0F172A, #1E1B4B)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(124, 58, 237, 0.2)',
                        borderRadius: '24px',
                        padding: '24px',
                        marginBottom: '32px',
                        border: '1px solid rgba(124, 58, 237, 0.4)',
                    }}
                >
                    {/* Simple Icon Representation */}
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center',
                        marginBottom: '16px',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Architecture Review
                </div>
                <div
                    style={{
                        fontSize: 32,
                        color: '#94A3B8',
                        textAlign: 'center',
                    }}
                >
                    Ecosystem Dashboard & Governance
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
