import fs from 'fs';
import path from 'path';

export default function Home() {
  const filePath = path.join(process.cwd(), 'src/app/allocflow_hydrated_body.html');
  const htmlContent = fs.readFileSync(filePath, 'utf-8');

  return (
    <>
      <link rel="stylesheet" href="/_astro/base-layout.D3gcHEVS.css" />
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <script src="/interactive_features.js" defer></script>
    </>
  );
}

// Cache bust
// cache bust
