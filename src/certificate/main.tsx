import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { SmoothScrollProvider } from '../providers/SmoothScroll';
import { CurtainProvider } from '../providers/Curtain';
import { CERTIFICATES } from '../content/data';
import { describeCertificate } from '../content/certificates';
import CertificatePage from './CertificatePage';
import '../styles/globals.css';

const id = new URLSearchParams(window.location.search).get('id');
const certificate = CERTIFICATES.find((c) => c.id === id);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider syncMeta={false}>
      <SmoothScrollProvider>
        {/* The opening scene repeats the name the journey link announced on its way here. */}
        <CurtainProvider opening={(t) => (certificate ? describeCertificate(certificate, t).name : t.certificate.label)}>
          <MotionConfig reducedMotion="user">
            <CertificatePage cert={certificate} />
          </MotionConfig>
        </CurtainProvider>
      </SmoothScrollProvider>
    </LanguageProvider>
  </StrictMode>,
);
