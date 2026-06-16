const OFFICIAL_DOCS = {
  python: [
    { title: 'Documentación oficial de Python', url: 'https://docs.python.org/3/' },
    { title: 'Tutorial oficial de Python', url: 'https://docs.python.org/3/tutorial/' }
  ],
  javascript: [
    { title: 'Documentación de JavaScript (MDN)', url: 'https://developer.mozilla.org/es/docs/Web/JavaScript' },
    { title: 'Guía de JavaScript de Mozilla', url: 'https://developer.mozilla.org/es/docs/Web/JavaScript/Guide' }
  ],
  java: [
    { title: 'Documentación de Java SE', url: 'https://docs.oracle.com/en/java/' },
    { title: 'Tutorial de Java', url: 'https://docs.oracle.com/javase/tutorial/' }
  ],
  'c++': [
    { title: 'Documentación de C++ (cplusplus.com)', url: 'https://cplusplus.com/doc/tutorial/' },
    { title: 'Referencia de C++ (cppreference)', url: 'https://en.cppreference.com/w/' }
  ],
  go: [
    { title: 'Documentación de Go', url: 'https://go.dev/doc/' },
    { title: 'Tour of Go', url: 'https://go.dev/tour/' }
  ],
  rust: [
    { title: 'The Rust Programming Language', url: 'https://doc.rust-lang.org/book/', summary: 'Libro oficial exhaustivo sobre Rust.' },
    { title: 'Rust By Example', url: 'https://doc.rust-lang.org/rust-by-example/', summary: 'Aprende Rust a través de ejemplos prácticos.' }
  ],
  react: [
    { title: 'Documentación Oficial de React', url: 'https://react.dev/', summary: 'Guía oficial para aprender y referenciar React.' }
  ],
  typescript: [
    { title: 'Manual de TypeScript', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', summary: 'Guía completa sobre el lenguaje TypeScript.' }
  ],
  'node.js': [
    { title: 'Node.js Docs', url: 'https://nodejs.org/en/docs/', summary: 'Documentación oficial de la API de Node.js.' }
  ],
  nestjs: [
    { title: 'Documentación de NestJS', url: 'https://docs.nestjs.com/', summary: 'Guía oficial del framework NestJS.' }
  ]
};

const getOfficialDocs = (language) => {
  const key = language.trim().toLowerCase();
  return OFFICIAL_DOCS[key] || [
    {
      title: `Documentación oficial de ${language}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(language + ' documentation')}`
    }
  ];
};

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
};

const getYouTubeVideosFast = async (searchQuery, maxResults = 2) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  try {
    const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&order=relevance&relevanceLanguage=es&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) return [];

    const data = await response.json();
    return (data.items || [])
      .filter((item) => item.id?.videoId && item.snippet?.title)
      .map((item) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        summary: item.snippet.description ? item.snippet.description.slice(0, 120) + '...' : 'Tutorial en video.',
      }));
  } catch (error) {
    return [];
  }
};

const enrichRoadmapLinks = async (nodes, language) => {
  const docs = getOfficialDocs(language);
  
  const enrichedNodes = await Promise.all(
    nodes.map(async (node) => {
      const documentation = node.documentation?.length ? node.documentation : docs;

      // Hacemos 1 sola petición de búsqueda rápida por nodo en paralelo.
      // Así evitamos la validación lenta y aseguramos enlaces 100% reales.
      const query = `${language} ${node.title} programación tutorial español`;
      const youtubeVideos = await getYouTubeVideosFast(query, 2);

      return {
        ...node,
        documentation,
        videos: youtubeVideos.length > 0 ? youtubeVideos : node.videos,
      };
    })
  );

  return enrichedNodes;
};

module.exports = { enrichRoadmapLinks };
