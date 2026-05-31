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

const validateYouTubeVideo = async (videoId) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || !videoId) return false;

  const url = `https://youtube.googleapis.com/youtube/v3/videos?part=status&id=${videoId}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error('YouTube validate error:', response.status, response.statusText);
    return false;
  }

  const data = await response.json();
  const item = data.items?.[0];
  if (!item?.status) return false;

  return item.status.uploadStatus === 'processed' && item.status.privacyStatus === 'public';
};

const getYouTubeVideos = async (searchQuery, maxResults = 5) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&order=relevance&relevanceLanguage=es&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error('YouTube API error:', response.status, response.statusText);
    return [];
  }

  const data = await response.json();
  const items = (data.items || []).filter((item) => item.id?.videoId && item.snippet?.title);
  const validVideos = [];

  for (const item of items) {
    const videoId = item.id.videoId;
    const isValid = await validateYouTubeVideo(videoId);
    if (isValid) {
      validVideos.push({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        summary: item.snippet.description?.slice(0, 120) + '...',
      });
      if (validVideos.length >= 2) break;
    }
  }

  return validVideos;
};

const enrichRoadmapLinks = async (nodes, language) => {
  const docs = getOfficialDocs(language);
  const enrichedNodes = await Promise.all(
    nodes.map(async (node) => {
      const documentation = node.documentation?.length ? node.documentation : docs;

      const existingVideos = Array.isArray(node.videos)
        ? await Promise.all(
            node.videos
              .filter((v) => v?.title && v?.url)
              .map(async (video) => {
                const videoId = extractYouTubeId(video.url);
                return (await validateYouTubeVideo(videoId)) ? video : null;
              })
          ).then((videos) => videos.filter(Boolean))
        : [];

      let videos = [...existingVideos];
      // Solo 1 búsqueda optimizada en lugar de 3 para acelerar
      const query = `${language} ${node.title} curso en español`;
      
      if (videos.length < 2) {
        const youtubeVideos = await getYouTubeVideos(query, 3);
        for (const video of youtubeVideos) {
          if (!videos.some((existing) => existing.url === video.url)) {
            videos.push(video);
          }
          if (videos.length >= 2) break;
        }
      }

      return {
        ...node,
        documentation,
        videos,
      };
    })
  );

  return enrichedNodes;
};

module.exports = { enrichRoadmapLinks };
