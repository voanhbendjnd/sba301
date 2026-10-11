export default function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <img src="/assets/funews-logo.png" alt="FUNews AI-generated logo" width="42" height="42" />
      <div>
        <strong>
          FU<span>News</span>
        </strong>
        <small>THE UNIVERSITY NEWSROOM</small>
      </div>
    </div>
  );
}
