'use client';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const share = {
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=ゆるゆる救急医`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    hatena: `https://b.hatena.ne.jp/entry/s/${url.replace(/^https?:\/\//, '')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  return (
    <div
      style={{
        marginTop: '64px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border, #D8D2C5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          fontSize: '0.7rem',
          fontFamily: 'sans-serif',
          letterSpacing: '0.12em',
          color: 'var(--muted)',
        }}
      >
        SHARE
      </span>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <ShareIcon href={share.x} label="Xでシェア" hoverColor="#1a1a1a">
          <XIcon />
        </ShareIcon>
        <ShareIcon href={share.line} label="LINEでシェア" hoverColor="#06C755">
          <LineIcon />
        </ShareIcon>
        <ShareIcon href={share.hatena} label="はてなブックマークに追加" hoverColor="#00A4DE">
          <HatenaIcon />
        </ShareIcon>
        <ShareIcon href={share.facebook} label="Facebookでシェア" hoverColor="#1877F2">
          <FacebookIcon />
        </ShareIcon>
      </div>
    </div>
  );
}

function ShareIcon({
  href,
  label,
  hoverColor,
  children,
}: {
  href: string;
  label: string;
  hoverColor: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        color: 'var(--muted)',
        display: 'inline-flex',
        transition: 'color 0.2s ease',
        lineHeight: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--muted)';
      }}
    >
      {children}
    </a>
  );
}

function XIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function HatenaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
      <path d="M 16 3 C 8.8 3 3 8.8 3 16 C 3 23.2 8.8 29 16 29 C 23.2 29 29 23.2 29 16 C 29 8.8 23.2 3 16 3 z M 13.107422 9.5996094 L 15.298828 9.5996094 L 15.298828 15.800781 L 13.107422 15.800781 L 13.107422 9.5996094 z M 14.199219 17.300781 C 14.899219 17.300781 15.5 17.900781 15.5 18.699219 C 15.5 19.399219 14.9 20 14.199219 20 C 13.399219 20 12.800781 19.399219 12.800781 18.699219 C 12.800781 17.900781 13.399219 17.300781 14.199219 17.300781 z M 17.800781 12.800781 L 22 12.800781 C 22.6 12.800781 23.099609 12.899609 23.599609 13.099609 C 24.099609 13.299609 24.5 13.600391 24.800781 13.900391 C 25.100781 14.200391 25.400391 14.600781 25.400391 15.300781 L 25.400391 15.400391 C 25.400391 16.100391 25.199219 16.600781 24.699219 17.300781 C 25.299219 17.600781 25.800781 18.100781 26.099609 18.699219 C 26.299609 19.199219 26.400391 19.699219 26.400391 20.199219 L 26.400391 20.300781 C 26.400391 21.100781 26.199219 21.800781 25.699219 22.300781 C 25.299219 22.800781 24.800781 23.099609 24.199219 23.400391 C 23.599219 23.600391 22.900391 23.699219 22.400391 23.699219 L 17.800781 23.699219 L 17.800781 12.800781 z M 20 14.800781 L 20 17.199219 L 21.699219 17.199219 C 22.099219 17.199219 22.5 17.100781 22.800781 16.800781 C 23.100781 16.500781 23.199219 16.300781 23.199219 15.900781 C 23.199219 15.500781 23.100781 15.200391 22.800781 15.000391 C 22.500781 14.800391 22.199219 14.800781 21.699219 14.800781 L 20 14.800781 z M 20 19.199219 L 20 21.699219 L 22 21.699219 C 22.4 21.699219 22.800781 21.600391 23.199219 21.400391 C 23.499219 21.200391 23.699219 20.800781 23.699219 20.300781 C 23.699219 19.800781 23.500781 19.499219 23.099609 19.199219 C 22.699609 18.999219 22.3 18.900781 21.800781 18.900781 L 20 18.900781 L 20 19.199219 z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
