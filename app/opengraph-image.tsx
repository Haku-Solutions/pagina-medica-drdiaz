import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1C2B48 0%, #2D4A7A 50%, #A7C7E7 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '50px 80px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#FFFFFF',
              textAlign: 'center',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}
          >
            Dr. José Díaz Zacarías
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#A7C7E7',
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            Cirujano General y Laparoscopista
          </div>
          <div
            style={{
              width: '120px',
              height: '4px',
              backgroundColor: '#A7C7E7',
              borderRadius: '2px',
              marginBottom: '24px',
            }}
          />
          <div
            style={{
              fontSize: 22,
              color: 'rgba(255, 255, 255, 0.85)',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.5,
            }}
          >
            Más de 20 años de experiencia en cirugía de mínima invasión
          </div>
          <div
            style={{
              fontSize: 18,
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
              marginTop: '16px',
            }}
          >
            Acapulco y Costa Chica de Guerrero
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
